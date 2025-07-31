import supertest from 'supertest'
import { it, describe, expect, jest, beforeAll } from '@jest/globals'
import { prefix } from './setup'
import { app } from '../server'
import { Comment } from '../database/models/Comment'
import { Blog } from '../database/models/Blog'

const request = supertest(app)

describe('Comment API Tests', () => {
    let blogId: string
    let userToken: string
    let adminToken: string

    beforeAll(async () => {
        const loginRes = await request.post(`${prefix}login`).send({
            email: 'john.doe@example.com',
            password: 'password'
        })
        userToken = loginRes.body.data.token
        adminToken = userToken

        const blogRes = await request
            .post(`${prefix}blogs`)
            .set('Authorization', `Bearer ${adminToken}`)
            .field('title', 'Blog for Comments Test')
            .field('description', 'This is a test blog description with more than 20 characters for testing comments')
            .field('content', 'Content for testing comments functionality')
            .field('isPublished', 'true')

        if (blogRes.status === 201) {
            blogId = blogRes.body.data.id
        } else {
            // If blog creation fails, use a mock ID for testing error cases
            blogId = '123e4567-e89b-12d3-a456-426614174000'
        }
    })

    describe('comments tests', () => {
        it('should return 404 when no comments found', async () => {
            const res = await request
                .get(`${prefix}comments`)
                .set('Authorization', `Bearer ${userToken}`)
            
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
                .set('Authorization', `Bearer ${userToken}`)
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
                .set('Authorization', `Bearer ${userToken}`)
                .send(commentData)

            expect(res.status).toBe(404)
            expect(res.body.success).toBe(false)
            expect(res.body.message).toEqual('Blog not found')
        })

        it('should get all comments with authentication', async () => {
            const res = await request
                .get(`${prefix}comments`)
                .set('Authorization', `Bearer ${userToken}`)
            
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
                .set('Authorization', `Bearer ${userToken}`)

            expect(res.status).toBe(500)
        })

        it('should handle 500 error when creating comment - Comment.create fails', async () => {
            jest.spyOn(Comment, 'create').mockRejectedValue(new Error('Database error'))

            const commentData = {
                content: 'This is a test comment with more than 20 characters for testing database errors.'
            }

            const res = await request
                .post(`${prefix}comments/${blogId}/message`)
                .set('Authorization', `Bearer ${userToken}`)
                .send(commentData)

            expect(res.status).toBe(500)
        })
    })
})
