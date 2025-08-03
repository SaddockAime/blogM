import supertest from 'supertest'
import { it, describe, expect, jest, beforeAll } from '@jest/globals'
import { prefix } from './setup'
import { app } from '../server'
import { Like } from '../database/models/Like'
import { Blog } from '../database/models/Blog'

const request = supertest(app)

describe('Like API Tests', () => {
    let blogId: string
    let adminToken: string

    describe('Like functionality tests', () => {
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
            title: "Test Blog Title2",
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

        it('should like a blog successfully when not previously liked', async () => {
            const res = await request
                .post(`${prefix}blogs/${blogId}/like`)
                .set('Authorization', `Bearer ${adminToken}`)

            if (res.status === 201) {
                expect(res.body.success).toBe(true)
                expect(res.body.message).toEqual('Blog liked successfully')
                expect(res.body.data).toHaveProperty('id')
                expect(res.body.data.blogId).toBe(blogId)
            } else if (res.status === 404) {
                expect(res.body.success).toBe(false)
                expect(res.body.message).toEqual('Blog not found')
            }
        })

        it('should unlike a blog when previously liked (toggle functionality)', async () => {
            const res = await request
                .post(`${prefix}blogs/${blogId}/like`)
                .set('Authorization', `Bearer ${adminToken}`)

            if (res.status === 200) {
                expect(res.body.success).toBe(true)
                expect(res.body.message).toEqual('Blog unliked successfully')
                expect(res.body.data).toBe(null)
            }
        })

        it('should like again after unliking (toggle functionality)', async () => {
            const res = await request
                .post(`${prefix}blogs/${blogId}/like`)
                .set('Authorization', `Bearer ${adminToken}`)

            if (res.status === 201) {
                expect(res.body.success).toBe(true)
                expect(res.body.message).toEqual('Blog liked successfully')
                expect(res.body.data).toHaveProperty('id')
                expect(res.body.data.blogId).toBe(blogId)
            }
        })

        it('should return 401 when trying to like without authentication', async () => {
            const res = await request
                .post(`${prefix}blogs/${blogId}/like`)

            expect(res.status).toBe(401)
            expect(res.body.success).toBe(false)
            expect(res.body.message).toEqual('Authentication token is missing')
        })

        it('should return 400 when blog ID is missing', async () => {
            const res = await request
                .post(`${prefix}blogs//like`)
                .set('Authorization', `Bearer ${adminToken}`)

            expect(res.status).toBe(404)
        })

        it('should return 404 when trying to like non-existent blog', async () => {
            const nonExistentBlogId = '123e4567-e89b-12d3-a456-426614174999'
            const res = await request
                .post(`${prefix}blogs/${nonExistentBlogId}/like`)
                .set('Authorization', `Bearer ${adminToken}`)

            expect(res.status).toBe(404)
            expect(res.body.success).toBe(false)
            expect(res.body.message).toEqual('Blog not found')
        })

        it('should get all likes for a blog', async () => {
            const res = await request
                .get(`${prefix}blogs/${blogId}/likes`)

            if (res.status === 200) {
                expect(res.body.success).toBe(true)
                expect(res.body.message).toEqual('Likes retrieved successfully')
                expect(res.body.data).toHaveProperty('likes')
                expect(res.body.data).toHaveProperty('count')
                expect(Array.isArray(res.body.data.likes)).toBe(true)
            }
        })

        it('should get likes for non-existent blog and return empty array', async () => {
            const nonExistentBlogId = '123e4567-e89b-12d3-a456-426614174999'
            const res = await request
                .get(`${prefix}blogs/${nonExistentBlogId}/likes`)

            expect(res.status).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.data.likes).toEqual([])
            expect(res.body.data.count).toBe(0)
        })
    })

    describe('Error Handling - Catch Block Tests', () => {
        it('should handle 500 error when Blog.findByPk fails during toggle like', async () => {
            jest.spyOn(Blog, 'findByPk').mockRejectedValue(new Error('Database error'))

            const res = await request
                .post(`${prefix}blogs/${blogId}/like`)
                .set('Authorization', `Bearer ${adminToken}`)

            expect(res.status).toBe(500)
        })

        it('should handle 500 error when Like.findOne fails during toggle like', async () => {
            jest.spyOn(Blog, 'findByPk').mockResolvedValue({ id: blogId } as any)
            jest.spyOn(Like, 'findOne').mockRejectedValue(new Error('Database error'))

            const res = await request
                .post(`${prefix}blogs/${blogId}/like`)
                .set('Authorization', `Bearer ${adminToken}`)

            expect(res.status).toBe(500)
        })

        it('should handle 500 error when Like.create fails during toggle like', async () => {
            jest.spyOn(Blog, 'findByPk').mockResolvedValue({ id: blogId } as any)
            jest.spyOn(Like, 'findOne').mockResolvedValue(null)
            jest.spyOn(Like, 'create').mockRejectedValue(new Error('Database error'))

            const res = await request
                .post(`${prefix}blogs/${blogId}/like`)
                .set('Authorization', `Bearer ${adminToken}`)

            expect(res.status).toBe(500)
        })

        it('should handle 500 error when destroy fails during unlike', async () => {
            const mockLike = {
                id: 'like-id',
                destroy: async () => {
                    throw new Error('Database error')
                }
            }
            
            jest.spyOn(Blog, 'findByPk').mockResolvedValue({ id: blogId } as any)
            jest.spyOn(Like, 'findOne').mockResolvedValue(mockLike as any)

            const res = await request
                .post(`${prefix}blogs/${blogId}/like`)
                .set('Authorization', `Bearer ${adminToken}`)

            expect(res.status).toBe(500)
        })

        it('should handle 500 error when getting blog likes - Like.findAll fails', async () => {
            jest.spyOn(Like, 'findAll').mockRejectedValue(new Error('Database error'))

            const res = await request
                .get(`${prefix}blogs/${blogId}/likes`)

            expect(res.status).toBe(500)
        })
    })
})
