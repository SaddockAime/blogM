import { jest, beforeAll, afterAll, afterEach } from '@jest/globals'
import { app } from '../server'
import { Sequelize } from 'sequelize'
import databaseConfig from '../config/config'

// Mock RabbitMQ service to prevent background processing during tests
jest.mock('../utils/rabbitmq', () => ({
    rabbitmqService: {
        connect: jest.fn(() => Promise.resolve()),
        disconnect: jest.fn(() => Promise.resolve()),
        publishMessage: jest.fn(() => Promise.resolve(true)),
        consumeMessages: jest.fn(() => Promise.resolve()),
        getChannel: jest.fn(() => ({})),
        isConnected: jest.fn(() => true)
    }
}));

// Mock email worker to prevent actual email processing during tests
jest.mock('../utils/emailWorker', () => ({
    emailWorkerService: {
        start: jest.fn(() => Promise.resolve()),
        stop: jest.fn(() => Promise.resolve())
    }
}));

// Mock notification service to prevent initialization during tests
jest.mock('../utils/notificationService', () => ({
    notificationService: {
        initialize: jest.fn(() => Promise.resolve()),
        shutdown: jest.fn(() => Promise.resolve())
    }
}));

export const prefix = '/api/v2/'
let sequelize: any

beforeAll(async () => {
    try {
        const db_config = databaseConfig() as any
        sequelize = new Sequelize({
            ...db_config,
            dialect: 'postgres',
        })
        await sequelize.authenticate()
        // console.log("Test Database Connected")
    } catch (error) {
        console.log('Database connection failed:', error)
    }

}, 10000)
afterEach(() => {
    jest.clearAllMocks()
})
