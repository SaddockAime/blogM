import supertest from 'supertest';
import { it, describe, expect, jest, beforeAll, afterAll } from '@jest/globals';
import { prefix } from './setup';
import { app } from '../server';

const request = supertest(app);

jest.mock('../utils/emailConfig', () => ({
    sendEmail: jest.fn(() => Promise.resolve(true)),
    transporter: {}
}));

describe('Subscriber API Tests', () => {
    const testEmail = 'huzaabahinzinabaguzi@gmail.com';

    describe('POST /api/v2/subscribers/subscribe', () => {
        it('should successfully subscribe a new email', async () => {
            const res = await request
                .post(`${prefix}subscribers/subscribe`)
                .send({ email: testEmail });

            expect(res.status).toBe(201);
        });

        it('should return 409 if email is already subscribed', async () => {
            const res = await request
                .post(`${prefix}subscribers/subscribe`)
                .send({ email: testEmail });

            expect(res.status).toBe(409);
        });

        it('should successfully unsubscribe an existing subscriber', async () => {
            const res = await request
                .get(`${prefix}subscribers/unsubscribe`)
                .query({ email: testEmail });

            expect(res.status).toBe(200);
        });

        it('should return 400 if email is already unsubscribed', async () => {
            const res = await request
                .get(`${prefix}subscribers/unsubscribe`)
                .query({ email: testEmail });

            expect(res.status).toBe(400);
        });

        it('should return 404 for non-existent email', async () => {
            const res = await request
                .get(`${prefix}subscribers/unsubscribe`)
                .query({ email: 'nonexistent@example.com' });

            expect(res.status).toBe(404);
        });

        it('should resubscribe an unsubscribed email', async () => {
            const res = await request
                .post(`${prefix}subscribers/subscribe`)
                .send({ email: testEmail });

            expect(res.status).toBe(200);
        });
    });

    describe('GET /api/v2/subscribers (Admin only)', () => {
        let adminToken: string;

        it("Login Succefully", async () => {
          const res = await request.post(`${prefix}login`).send({
            email: "aimegetz@gmail.com",
            password: "password",
          });
          expect(res.body.message).toEqual("Login successful");
          expect(res.body.success).toBe(true);
          adminToken = res.body.data.token;
        });

        it('should return paginated list of subscribers for admin', async () => {
            const res = await request
                .get(`${prefix}subscribers`)
                .set('Authorization', `Bearer ${adminToken}`)
                .query({ page: 1, limit: 10 });

            expect(res.status).toBe(200);
        });
    });
});
