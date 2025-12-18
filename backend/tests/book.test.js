import { jest } from '@jest/globals';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import app from '../app.js';
import User from '../models/User.js';
import Book from '../models/Book.js';

jest.setTimeout(30000);

let mongoServer;
let adminToken;
let userToken;

beforeAll(async () => {
  // Start in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  await User.deleteMany({});
  await Book.deleteMany({});

  // Create ADMIN user
  await request(app).post('/library/auth/register').send({
    name: 'Admin',
    email: 'admin@test.com',
    password: '123456',
  });

  const adminUser = await User.findOne({ email: 'admin@test.com' });
  adminUser.role = 'admin';
  adminUser.isVerified = true;
  await adminUser.save();

  const adminLogin = await request(app).post('/library/auth/login').send({
    email: 'admin@test.com',
    password: '123456',
  });
  adminToken = adminLogin.body.token;

  // Create NORMAL user
  await request(app).post('/library/auth/register').send({
    name: 'User',
    email: 'user@test.com',
    password: '123456',
  });

  const normalUser = await User.findOne({ email: 'user@test.com' });
  normalUser.isVerified = true;
  await normalUser.save();

  const userLogin = await request(app).post('/library/auth/login').send({
    email: 'user@test.com',
    password: '123456',
  });
  userToken = userLogin.body.token;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Reset books before each test
  await Book.deleteMany({});

  await Book.create([
    {
      title: 'Book 1',
      author: 'Author 1',
      category: 'Fiction',
      totalCopies: 3,
      description: 'Description for Book 1',
    },
    {
      title: 'Book 2',
      author: 'Author 2',
      category: 'Science',
      totalCopies: 5,
      description: 'Description for Book 2',
    },
  ]);
});

describe('GET /library/books (getBooks)', () => {
  it('should return 401 if user is not authenticated', async () => {
    const res = await request(app).get('/library/books');
    expect(res.statusCode).toBe(401);
  });

  it('should return all books for logged-in user', async () => {
    const res = await request(app)
      .get('/library/books')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);

    expect(res.body[0]).toHaveProperty('title');
    expect(res.body[0]).toHaveProperty('author');
    expect(res.body[0]).toHaveProperty('category');
    expect(res.body[0]).toHaveProperty('description');
  });

  it('should also return books for admin user', async () => {
    const res = await request(app)
      .get('/library/books')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
  });
});
