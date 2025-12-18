/* eslint-env jest */
/* @jest-environment node
 */
import { jest } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcryptjs';
import app from '../app.js';
import User from '../models/User.js';

jest.setTimeout(30000); // 30 seconds

jest.mock('../utils/sendEmail.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

// ======================================================
// 🔵 REGISTER TESTS
// ======================================================

describe('POST /library/auth/register', () => {
  it('should return 400 if fields are missing', async () => {
    const res = await request(app)
      .post('/library/auth/register')
      .send({ email: 'test@gmail.com' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('All fields are required');
  });

  it('should return 409 if email already exists', async () => {
    await User.create({
      name: 'John',
      email: 'john@gmail.com',
      password: 'hashed',
    });

    const res = await request(app).post('/library/auth/register').send({
      name: 'John',
      email: 'john@gmail.com',
      password: '123456',
    });

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toBe('Email already registered');
  });

  it('should register user successfully', async () => {
    const res = await request(app).post('/library/auth/register').send({
      name: 'John',
      email: 'john@gmail.com',
      password: '123456',
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toMatch(/Registration successful/i);

    const user = await User.findOne({ email: 'john@gmail.com' });
    expect(user).not.toBeNull();
    expect(user.verificationCode).toBeDefined();
  });
});

// ======================================================
// 🔵 VERIFY EMAIL TESTS
// ======================================================

describe('POST /library/auth/verify-email', () => {
  it('should return 400 if fields missing', async () => {
    const res = await request(app)
      .post('/library/auth/verify-email')
      .send({ email: 'test@gmail.com' });

    expect(res.statusCode).toBe(400);
  });

  it('should return 404 if user not found', async () => {
    const res = await request(app).post('/library/auth/verify-email').send({
      email: 'missing@gmail.com',
      code: '123456',
    });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('User not found');
  });

  it('should return 400 if code incorrect', async () => {
    await User.create({
      name: 'John',
      email: 'john@gmail.com',
      password: 'hashed',
      verificationCode: '111111',
      verificationCodeExpires: Date.now() + 600000,
    });

    const res = await request(app).post('/library/auth/verify-email').send({
      email: 'john@gmail.com',
      code: '222222',
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Incorrect verification code');
  });

  it('should return 400 if code expired', async () => {
    await User.create({
      name: 'John',
      email: 'john@gmail.com',
      password: 'hashed',
      verificationCode: '111111',
      verificationCodeExpires: Date.now() - 10000,
    });

    const res = await request(app).post('/library/auth/verify-email').send({
      email: 'john@gmail.com',
      code: '111111',
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Verification code has expired');
  });

  it('should verify email successfully', async () => {
    await User.create({
      name: 'John',
      email: 'john@gmail.com',
      password: 'hashed',
      verificationCode: '123456',
      verificationCodeExpires: Date.now() + 600000,
    });

    const res = await request(app).post('/library/auth/verify-email').send({
      email: 'john@gmail.com',
      code: '123456',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Email verified successfully');

    const user = await User.findOne({ email: 'john@gmail.com' });
    expect(user.isVerified).toBe(true);
  });
});

// ======================================================
// 🔵 LOGIN TESTS
// ======================================================

describe('POST /library/auth/login', () => {
  it('should return 400 if fields missing', async () => {
    const res = await request(app)
      .post('/library/auth/login')
      .send({ email: 'test@gmail.com' });

    expect(res.statusCode).toBe(400);
  });

  it('should return 404 if user does not exist', async () => {
    const res = await request(app).post('/library/auth/login').send({
      email: 'none@gmail.com',
      password: '123456',
    });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('User not found');
  });

  it('should block unverified user', async () => {
    await User.create({
      name: 'John',
      email: 'john@gmail.com',
      password: await bcrypt.hash('123456', 10),
      isVerified: false,
    });

    const res = await request(app).post('/library/auth/login').send({
      email: 'john@gmail.com',
      password: '123456',
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Please verify your email first');
  });

  it('should login verified user', async () => {
    const hashed = await bcrypt.hash('123456', 10);

    await User.create({
      name: 'John',
      email: 'john@gmail.com',
      password: hashed,
      isVerified: true,
    });

    const res = await request(app).post('/library/auth/login').send({
      email: 'john@gmail.com',
      password: '123456',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('john@gmail.com');
  });
});
