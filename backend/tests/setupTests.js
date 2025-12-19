import { jest } from '@jest/globals';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Mock sendEmail globally
jest.mock('../utils/sendEmail.js', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(true),
}));
