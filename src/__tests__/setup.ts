import supertest from 'supertest'
import { jest, beforeAll, afterAll, afterEach } from '@jest/globals'
import { app } from '../server'
import { Sequelize } from 'sequelize'
import databaseConfig from '../config/config'

const request = supertest(app)
export const userResponse = {
    token: ''
}
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
        console.error('Database connection failed:', error)
        throw error
    }

}, 10000)
afterEach(() => {
    jest.clearAllMocks()
})
// afterAll(async () => {
//     jest.clearAllMocks()
//     if (sequelize) {
//         await sequelize.close()
//     }
// })