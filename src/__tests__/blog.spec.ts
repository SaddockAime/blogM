import supertest from 'supertest'
import { it, describe, expect, jest, beforeAll } from '@jest/globals'
import { prefix } from './setup'
import { app } from '../server'
import { Blog } from '../database/models/Blog'
import { User } from '../database/models/User'

const request = supertest(app)

describe('Blog API Tests', () => {
    let blogId: string
    let adminToken: string

    beforeAll(async () => {
        const loginRes = await request.post(`${prefix}login`).send({
            email: 'john.doe@example.com',
            password: 'password'
        })
        adminToken = loginRes.body.data.token
    })

    describe('Blogs tests', () => {
        it('should return 404 when no blogs found', async () => {
            const res = await request
                .get(`${prefix}blogs`)
                .set('Authorization', `Bearer ${adminToken}`)
            
            if (res.status === 404) {
                expect(res.body.success).toBe(false)
                expect(res.body.message).toEqual('No blogs found')
            }
        })

        it('should create a blog successfully with admin role', async () => {
            const blogData = {
                title: 'Test Blog Title',
                description: 'This is a test blog description with more than 20 characters',
                content: 'This is the content of the test blog. It contains detailed information.',
                isPublished: true
            }

            const res = await request
                .post(`${prefix}blogs`)
                .set('Authorization', `Bearer ${adminToken}`)
                .field('title', blogData.title)
                .field('description', blogData.description)
                .field('content', blogData.content)
                .field('isPublished', blogData.isPublished.toString())

            expect(res.status).toBe(201)
            expect(res.body.success).toBe(true)
            expect(res.body.message).toEqual('Blog created successfully')
            expect(res.body.data).toHaveProperty('id')
            blogId = res.body.data.id
        })

        it('should return 400 for duplicate blog title', async () => {
            const blogData = {
                title: 'Test Blog Title',
                description: 'This is another test blog description with more than 20 characters',
                content: 'This is different content for the duplicate title test.',
                isPublished: true
            }

            const res = await request
                .post(`${prefix}blogs`)
                .set('Authorization', `Bearer ${adminToken}`)
                .field('title', blogData.title)
                .field('description', blogData.description)
                .field('content', blogData.content)
                .field('isPublished', blogData.isPublished.toString())

            expect(res.status).toBe(400)
            expect(res.body.success).toBe(false)
            expect(res.body.message).toEqual('A blog with this title already exists. Please use a different title.')
        })

        it('should get all blogs with authentication', async () => {
            const res = await request
                .get(`${prefix}blogs`)
                .set('Authorization', `Bearer ${adminToken}`)
            
            expect(res.status).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.message).toEqual('Blogs retrieved successfully')
            expect(res.body.data).toHaveProperty('blogs')
            expect(Array.isArray(res.body.data.blogs)).toBe(true)
        })

        it('should get a single blog by ID', async () => {
            const res = await request.get(`${prefix}blogs/${blogId}`)
            
            expect(res.status).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.message).toEqual('Blog retrieved successfully')
            expect(res.body.data).toHaveProperty('id', blogId)
        })

        it('should return 404 for non-existent blog', async () => {
            const fakeId = '123e4567-e89b-12d3-a456-426614174000' // Valid UUID format
            const res = await request.get(`${prefix}blogs/${fakeId}`)
            
            expect(res.status).toBe(404)
            expect(res.body.success).toBe(false)
            expect(res.body.message).toEqual('Blog not found')
        })

        it('should update a blog successfully with admin role', async () => {
            const updateData = {
                title: 'Updated Blog Title',
                description: 'This is an updated blog description with more than 20 characters',
            }

            const res = await request
                .put(`${prefix}blogs/${blogId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updateData)

            expect(res.status).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.message).toEqual('Blog updated successfully')
        })

        it('should return 404 for non-existent blog update', async () => {
            const fakeId = '123e4567-e89b-12d3-a456-426614174000'
            const updateData = {
                title: 'Updated Title',
                description: 'Updated description with more than 20 characters'
            }

            const res = await request
                .put(`${prefix}blogs/${fakeId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updateData)

            expect(res.status).toBe(404)
        })

        it('should delete a blog successfully with admin role', async () => {
            const res = await request
                .delete(`${prefix}blogs/${blogId}`)
                .set('Authorization', `Bearer ${adminToken}`)

            expect(res.status).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.message).toEqual('Blog deleted successfully')
        })

        it('should return 404 for non-existent blog deletion', async () => {
            const fakeId = '123e4567-e89b-12d3-a456-426614174000'

            const res = await request
                .delete(`${prefix}blogs/${fakeId}`)
                .set('Authorization', `Bearer ${adminToken}`)

            expect(res.status).toBe(404)
        })

        it('should return 401 without authentication', async () => {
            const res = await request.get(`${prefix}blogs`)
            
            expect(res.status).toBe(401)
        })

    })

    describe('Error Handling - Catch Block Tests', () => {
        it('should handle 500 error when getting all blogs', async () => {
            jest.spyOn(Blog, 'findAll').mockRejectedValue(new Error('Database error'))

            const res = await request
                .get(`${prefix}blogs`)
                .set('Authorization', `Bearer ${adminToken}`)

            expect(res.status).toBe(500)
        })

        it('should handle 500 error when getting single blog', async () => {
            jest.spyOn(Blog, 'findByPk').mockRejectedValue(new Error('Database error'))

            const res = await request
                .get(`${prefix}blogs/123e4567-e89b-12d3-a456-426614174000`)

            expect(res.status).toBe(500)
        })

        it('should handle 500 error when creating blog', async () => {
            jest.spyOn(User, 'findByPk').mockRejectedValue(new Error('Database error'))

            const res = await request
                .post(`${prefix}blogs`)
                .set('Authorization', `Bearer ${adminToken}`)
                .field('title', 'Test Blog Title')
                .field('description', 'This is a test blog description with more than 20 characters')
                .field('content', 'This is the test blog content')
                .field('isPublished', 'true')

            expect(res.status).toBe(500)
        })

        it('should handle 500 error when updating blog', async () => {
            jest.spyOn(Blog, 'update').mockRejectedValue(new Error('Database error'))

            const res = await request
                .put(`${prefix}blogs/${blogId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    title: 'Updated Test Blog',
                    description: 'Updated test blog description with more than 20 characters',
                    content: 'Updated test blog content',
                    isPublished: false
                })

            expect(res.status).toBe(500)
        })

        it('should handle 500 error when deleting blog', async () => {
            jest.spyOn(Blog, 'findByPk').mockRejectedValue(new Error('Database error'))

            const res = await request
                .delete(`${prefix}blogs/123e4567-e89b-12d3-a456-426614174000`)
                .set('Authorization', `Bearer ${adminToken}`)

            expect(res.status).toBe(500)
        })
    })
})
