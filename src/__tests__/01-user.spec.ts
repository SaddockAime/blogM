import supertest from 'supertest'
import { it, describe, expect, jest, beforeAll } from '@jest/globals'
import { prefix } from './setup'
import { app } from '../server'
import { User } from '../database/models/User'
import * as helper from '../utils/helper'

const request = supertest(app)
let authToken: string

describe('Login with admin token', () => {
    it('Login Succefully', async () => {
        const res = await request.post(`${prefix}login`).send({
            email: 'aimegetz@gmail.com',
            password: 'password'
        })
        expect(res.body.message).toEqual('Login successful')
        expect(res.body.success).toBe(true)
        authToken = res.body.data.token
    })
    it('users Doesnt exist', async () => {
        const res = await request.post(`${prefix}login`).send({
            email: 'admin2@admin.com',
            password: 'password'
        })
        expect(res.body.message).toEqual("User not found")
        expect(res.status).toBe(404)
    })
    it('invalid Password', async () => {
        const res = await request.post(`${prefix}login`).send({
            email: 'aimegetz@gmail.com',
            password: 'passworrd'
        })
        expect(res.body.message).toEqual("Invalid email or password")
        expect(res.status).toBe(401)
    })

    it("getting 500 error", async () => {
      jest.spyOn(User, "findOne").mockRejectedValue(new Error());
      const res = await request.post(`${prefix}login`).send({
        email: "aimegetz@gmail.com",
        password: "password",
      });
      expect(res.status).toBe(500);
    });
})

describe('create A user', () => {
    describe('Starting from 400', () => {
        it('having an unexcepted columbn', async () => {
            const res = await request.post(`${prefix}users`)
                .send({
                    email: 'saddock@gmail.com',
                    name: 'saddock',
                    password: 'password',
                    gender: 'male',
                    role: 'users'
                })
            expect(res.status).toBe(400)
        })

        it('create user successfuly', async () => {
            const res = await request.post(`${prefix}users`)
                .send({
                    email: 'saddock@gmail.com',
                    name: 'saddock',
                    password: 'password',
                    gender: 'male',
                })
            expect(res.status).toBe(201)
        })
        it('user already exist', async () => {
            const res = await request.post(`${prefix}users`)
                .send({
                    email: 'saddock@gmail.com',
                    name: 'saddock',
                    password: 'password',
                    gender: 'male',
                })
            expect(res.status).toBe(409)
            expect(res.body.message).toBe('User already exists')
        })

        it("getting 500 error", async () => {
          jest.spyOn(User, "create").mockRejectedValue(new Error());
          const res = await request.post(`${prefix}users`).send({
            email: "newemail@gmail.com",
            name: "saddock",
            password: "password",
            gender: "male",
          });
          expect(res.status).toBe(500);
        });
    })
})

describe('Logout functionality', () => {

    it('should logout successfully with valid token', async () => {
        const res = await request
            .post(`${prefix}logout`)
            .set('Authorization', `Bearer ${authToken}`)

        expect(res.status).toBe(200)
        expect(res.body.success).toBe(true)
        expect(res.body.message).toEqual('Logout successful')
        expect(res.body.data).toBe(null)
    })

    it('should return 401 without authentication token', async () => {
        const res = await request.post(`${prefix}logout`)

        expect(res.status).toBe(401)
    })

    it('should handle 500 error when destroyToken fails', async () => {
        jest.spyOn(helper, 'destroyToken').mockRejectedValue(new Error('Redis connection failed'))

        const loginRes = await request.post(`${prefix}login`).send({
            email: 'aimegetz@gmail.com',
            password: 'password'
        })
        const freshToken = loginRes.body.data.token

        const res = await request
            .post(`${prefix}logout`)
            .set('Authorization', `Bearer ${freshToken}`)

        expect(res.status).toBe(500)
        expect(res.body.success).toBe(false)
    })
})
