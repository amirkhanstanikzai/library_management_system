/* eslint-env jest */
import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

jest.mock('../utils/sendEmail.js', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(true),
}));
