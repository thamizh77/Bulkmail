/**
 * Auth Controller
 * Handles admin login and JWT token generation
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Generate JWT Token
 * Creates signed JWT with user id
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

/**
 * POST /api/auth/login
 * Admin login - validates credentials and returns JWT
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        message: 'Please provide email and password',
      });
    }

    // Normalize email (User schema stores lowercase)
    const normalizedEmail = String(email).toLowerCase().trim();

    // Find user with password (select: false by default)
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    // Return token and user info
    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { login };
