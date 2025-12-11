/**
 * @jest-environment node
 */
import { jest } from '@jest/globals';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import app from '../../app.js'; // ONLY app, NOT server!

import User from '../../models/User.js';
import Book from '../../models/Book.js';

let mongoServer;
let adminToken;
let userToken;
let createdBookId;

beforeAll(async () => {
  // Start memory DB
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri);

  // Create admin user
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@test.com',
    password: '123456',
    role: 'admin',
  });

  // Create normal user
  const user = await User.create({
    name: 'Normal User',
    email: 'user@test.com',
    password: '123456',
    role: 'user',
  });

  // Login admin
  const adminLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@test.com', password: '123456' });

  adminToken = adminLogin.body.token;

  // Login user
  const userLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'user@test.com', password: '123456' });

  userToken = userLogin.body.token;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  await mongoServer.stop();
});

// ------------------------------
// BOOK ROUTES TESTS
// ------------------------------

describe('BOOK ROUTES', () => {
  test('Admin should create a book', async () => {
    const res = await request(app)
      .post('/api/books')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('title', 'Test Book')
      .field('author', 'John Doe')
      .field('description', 'Test description')
      .field('totalCopies', 5);

    expect(res.status).toBe(201);
    expect(res.body.book.title).toBe('Test Book');

    createdBookId = res.body.book._id;
  });

  test('User should fetch all books', async () => {
    const res = await request(app)
      .get('/api/books')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
  });

  test('User should borrow the book', async () => {
    const res = await request(app)
      .post(`/api/books/${createdBookId}/borrow`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.book.borrowedCopies).toBe(1);
  });

  test('User should see their borrowed books', async () => {
    const res = await request(app)
      .get('/api/books/my/borrowed')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
  });

  test('Admin should get borrowers list', async () => {
    const res = await request(app)
      .get(`/api/books/${createdBookId}/borrowers`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.borrowers.length).toBe(1);
  });

  test('User should return the book', async () => {
    const res = await request(app)
      .post(`/api/books/${createdBookId}/return`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.book.borrowedCopies).toBe(0);
  });

  test('Admin should update the book', async () => {
    const res = await request(app)
      .put(`/api/books/${createdBookId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .field('title', 'Updated Title');

    expect(res.status).toBe(200);
    expect(res.body.book.title).toBe('Updated Title');
  });

  test('Admin should delete the book', async () => {
    const res = await request(app)
      .delete(`/api/books/${createdBookId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Book deleted successfully');
  });
});
