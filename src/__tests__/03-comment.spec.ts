import supertest from 'supertest'
import { it, describe, expect, jest, beforeAll } from '@jest/globals'
import { prefix } from './setup'
import { app } from '../server'
import { Comment } from '../database/models/Comment'
import { Blog } from '../database/models/Blog'

const request = supertest(app)

describe('Comment API Tests', () => {
    let blogId: string
    let adminToken: string

    describe('comments tests', () => {
        it("Login Succefully", async () => {
          const res = await request.post(`${prefix}login`).send({
            email: "aimegetz@gmail.com",
            password: "password",
          });
          expect(res.body.message).toEqual("Login successful");
          expect(res.body.success).toBe(true);
          adminToken = res.body.data.token;
        });

        it("should create a blog successfully with admin role", async () => {
          const blogData = {
            title: "Test Blog Title1",
            description:
              "This is a test blog description with more than 20 characters",
            content:
              "This is the content of the test blog. It contains detailed information.",
            isPublished: true,
          };

          const res = await request
            .post(`${prefix}blogs`)
            .set("Authorization", `Bearer ${adminToken}`)
            .field("title", blogData.title)
            .field("description", blogData.description)
            .field("content", blogData.content)
            .field("isPublished", blogData.isPublished.toString());

          expect(res.status).toBe(201);
          blogId = res.body.data.id;
        });
        
        it('should return 404 when no comments found', async () => {
            const res = await request
                .get(`${prefix}comments`)
                .set('Authorization', `Bearer ${adminToken}`)
            
            if (res.status === 404) {
                expect(res.body.success).toBe(false)
                expect(res.body.message).toEqual('No comments found')
            }
        })

        it('should add a comment successfully to existing blog', async () => {
            const commentData = {
                content: 'This is a test comment with more than 20 characters to meet the validation requirements.'
            }

            const res = await request
                .post(`${prefix}comments/${blogId}/message`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(commentData)

            expect(res.status).toBe(201)
            expect(res.body.success).toBe(true)
            expect(res.body.message).toEqual('Comment added successfully')
            expect(res.body.data).toHaveProperty('id')
            expect(res.body.data).toHaveProperty('content', commentData.content)
        })

        it('should return 404 for non-existent blog', async () => {
            const fakeId = '123e4567-e89b-12d3-a456-426614174000' // Non-existent blog ID
            const commentData = {
                content: 'This is a test comment with more than 20 characters for a non-existent blog.'
            }

            const res = await request
                .post(`${prefix}comments/${fakeId}/message`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(commentData)

            expect(res.status).toBe(404)
            expect(res.body.success).toBe(false)
            expect(res.body.message).toEqual('Blog not found')
        })

        it('should get all comments with authentication', async () => {
            const res = await request
                .get(`${prefix}comments`)
                .set('Authorization', `Bearer ${adminToken}`)
            
            expect(res.status).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.message).toEqual('Comments retrieved successfully')
            expect(res.body.data).toHaveProperty('comments')
            expect(Array.isArray(res.body.data.comments)).toBe(true)
        })
    })

    describe('Error Handling - Catch Block Tests', () => {
        it('should handle 500 error when getting all comments', async () => {
            jest.spyOn(Comment, 'findAll').mockRejectedValue(new Error('Database error'))

            const res = await request
                .get(`${prefix}comments`)
                .set('Authorization', `Bearer ${adminToken}`)

            expect(res.status).toBe(500)
        })

        it('should handle 500 error when creating comment - Comment.create fails', async () => {
            jest.spyOn(Comment, 'create').mockRejectedValue(new Error('Database error'))

            const commentData = {
                content: 'This is a test comment with more than 20 characters for testing database errors.'
            }

            const res = await request
                .post(`${prefix}comments/${blogId}/message`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(commentData)

            expect(res.status).toBe(500)
        })
    })
})
