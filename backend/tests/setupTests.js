import { jest } from '@jest/globals';
import dotenv from 'dotenv';

// Load test env variables
dotenv.config({ path: '.env.test' });

// ESM-safe mock for sendEmail
await jest.unstable_mockModule('../utils/sendEmail.js', () => ({
  default: jest.fn().mockResolvedValue(true),
}));
