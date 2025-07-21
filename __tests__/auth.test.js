// __tests__/auth.test.js

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../Server/Server'); // Ensure this points to your Express app

// Ensure DB connection is established before running tests
beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/Amazon');
});

afterAll(async () => {
    // Clean up DB connection after tests
    await mongoose.disconnect();
});

describe('POST /api/login', () => {
    it('should return 200 and a token for valid credentials', async () => {
        const response = await request(app)
            .post('/api/login')
            .send({ email: 'i@g.com', password: '12345' });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
    });

    it('should return 401 for invalid credentials', async () => {
        const response = await request(app)
            .post('/api/login')
            .send({ email: 't@g.com', password: '12345' });

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
    });
});
describe('POST /api/signup', () => {
    it('should return 201 and the user data for valid signup', async () => {
        const newUser = {
            email: 'newuser@g.com',
            password: '12345',
            name: 'New User',
            contactNumber: '12345678910',
        };

        const response = await request(app)
            .post('/api/signup')
            .send(newUser);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
    });

    it('should return 400 for missing required fields', async () => {
        const incompleteUser = {
            email: 'incompleteuser@g.com',
        };

        const response = await request(app)
            .post('/api/signup')
            .send(incompleteUser);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('All fields are required.');
    });

    it('should return 409 for email already registered', async () => {
        const existingUser = {
            email: 'i@g.com',
            password: '12345',
            name: 'Existing User',
            contactNumber: '12345678910',
        };

        const response = await request(app)
            .post('/api/signup')
            .send(existingUser);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Email already exists.');
    });
});
