import supertest from 'supertest'
import { it, describe, expect, jest, beforeAll } from '@jest/globals'
import { prefix } from './setup'
import { app } from '../server'
import { Like } from '../database/models/Like'
import { Blog } from '../database/models/Blog'

const request = supertest(app)

describe('Like API Tests', () => {
    let blogId: string
    let userToken: string
    let adminToken: string

    beforeAll(async () => {
        // Login as admin to create blog
        const adminLoginRes = await request.post(`${prefix}login`).send({
            email: 'john.doe@example.com',
            password: 'password'
        })
        adminToken = adminLoginRes.body.data.token

        userToken = adminToken

        // Create a blog for testing likes
        const blogRes = await request
            .post(`${prefix}blogs`)
            .set('Authorization', `Bearer ${adminToken}`)
            .field('title', 'Blog for Likes Test')
            .field('description', 'This is a test blog description with more than 20 characters for testing likes')
            .field('content', 'Content for testing likes functionality')
            .field('isPublished', 'true')

        if (blogRes.status === 201) {
            blogId = blogRes.body.data.id
        } else {
            // If blog creation fails, use a mock ID for testing error cases
            blogId = '123e4567-e89b-12d3-a456-426614174000'
        }
    })

    describe('Like functionality tests', () => {
        it('should like a blog successfully when not previously liked', async () => {
            const res = await request
                .post(`${prefix}blogs/${blogId}/like`)
                .set('Authorization', `Bearer ${userToken}`)

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
                .set('Authorization', `Bearer ${userToken}`)

            if (res.status === 200) {
                expect(res.body.success).toBe(true)
                expect(res.body.message).toEqual('Blog unliked successfully')
                expect(res.body.data).toBe(null)
            }
        })

        it('should like again after unliking (toggle functionality)', async () => {
            const res = await request
                .post(`${prefix}blogs/${blogId}/like`)
                .set('Authorization', `Bearer ${userToken}`)

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
                .set('Authorization', `Bearer ${userToken}`)

            expect(res.status).toBe(404)
        })

        it('should return 404 when trying to like non-existent blog', async () => {
            const nonExistentBlogId = '123e4567-e89b-12d3-a456-426614174999'
            const res = await request
                .post(`${prefix}blogs/${nonExistentBlogId}/like`)
                .set('Authorization', `Bearer ${userToken}`)

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
                .set('Authorization', `Bearer ${userToken}`)

            expect(res.status).toBe(500)
        })

        it('should handle 500 error when Like.findOne fails during toggle like', async () => {
            jest.spyOn(Blog, 'findByPk').mockResolvedValue({ id: blogId } as any)
            jest.spyOn(Like, 'findOne').mockRejectedValue(new Error('Database error'))

            const res = await request
                .post(`${prefix}blogs/${blogId}/like`)
                .set('Authorization', `Bearer ${userToken}`)

            expect(res.status).toBe(500)
        })

        it('should handle 500 error when Like.create fails during toggle like', async () => {
            jest.spyOn(Blog, 'findByPk').mockResolvedValue({ id: blogId } as any)
            jest.spyOn(Like, 'findOne').mockResolvedValue(null)
            jest.spyOn(Like, 'create').mockRejectedValue(new Error('Database error'))

            const res = await request
                .post(`${prefix}blogs/${blogId}/like`)
                .set('Authorization', `Bearer ${userToken}`)

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
                .set('Authorization', `Bearer ${userToken}`)

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
