import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sendEmail from '../utils/sendEmail.js';
import verificationEmailTemplate from '../utils/emailTemplates/verificationEmail.js';

// ======================================================
// ✅ REGISTER USER
// ======================================================
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if email is taken
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Verification code (6 digits)
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // Expires in 10 minutes
    const verificationCodeExpires = Date.now() + 10 * 60 * 1000;

    // Save user
    await User.create({
      name,
      email,
      password: hashedPassword,
      verificationCode,
      verificationCodeExpires,
    });

    // Create HTML email
    const htmlEmail = verificationEmailTemplate(name, verificationCode);

    // Send email
    await sendEmail(email, 'Verify Your Email - Library System', htmlEmail);

    res.status(201).json({
      message:
        'Registration successful. Check your email for verification code.',
    });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// ======================================================
// ✅ VERIFY EMAIL
// ======================================================
export const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res
        .status(400)
        .json({ message: 'Email and verification code are required' });
    }

    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check code match
    if (user.verificationCode !== code) {
      return res.status(400).json({ message: 'Incorrect verification code' });
    }

    // Check expiration
    if (user.verificationCodeExpires < Date.now()) {
      return res.status(400).json({ message: 'Verification code has expired' });
    }

    // Mark verified
    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;

    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Verify Email Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// ======================================================
// ✅ LOGIN USER
// ======================================================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check verification status
    if (!user.isVerified) {
      return res
        .status(401)
        .json({ message: 'Please verify your email first' });
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch)
      return res.status(401).json({ message: 'Incorrect password' });

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
