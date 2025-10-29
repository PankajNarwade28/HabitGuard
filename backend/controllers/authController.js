const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Secret key for JWT (In production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const SALT_ROUNDS = 10;

// Demo account for when database is unavailable
const DEMO_ACCOUNT = {
  u_id: 999,
  name: 'Demo User',
  age: 25,
  education: 'Computer Science',
  email: 'demo@habitguard.com',
  mobile_no: '9999999999',
  password: 'demo123', // Plain text for demo (will be hashed)
  created_at: new Date().toISOString()
};

// Hash demo password on startup
let DEMO_PASSWORD_HASH = null;
(async () => {
  DEMO_PASSWORD_HASH = await bcrypt.hash(DEMO_ACCOUNT.password, SALT_ROUNDS);
})();

/**
 * Register a new user
 */
exports.signup = async (req, res) => {
  try {
    const { name, age, education, email, mobile_no, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    try {
      // Check if user already exists
      const [existingUsers] = await db.query(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      if (existingUsers.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      // Insert new user
      const [result] = await db.query(
        'INSERT INTO users (name, age, education, email, mobile_no, password) VALUES (?, ?, ?, ?, ?, ?)',
        [name, age || null, education || null, email, mobile_no || null, hashedPassword]
      );

      // Generate JWT token
      const token = jwt.sign(
        { userId: result.insertId, email },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          userId: result.insertId,
          name,
          email,
          token
        }
      });
    } catch (dbError) {
      console.error('Database error during signup:', dbError);
      
      // If database fails, return error with demo account info
      return res.status(503).json({
        success: false,
        message: 'Database connection failed. Please check your database setup.',
        demoAccount: {
          available: true,
          email: DEMO_ACCOUNT.email,
          password: DEMO_ACCOUNT.password,
          note: 'Use demo account to test the app while database is being configured'
        },
        error: 'Database unavailable'
      });
    }
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
};

/**
 * Login user
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Check if trying to login with demo account
    if (email.toLowerCase() === DEMO_ACCOUNT.email.toLowerCase()) {
      const isPasswordValid = password === DEMO_ACCOUNT.password;

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Generate JWT token for demo user
      const token = jwt.sign(
        { userId: DEMO_ACCOUNT.u_id, email: DEMO_ACCOUNT.email, isDemo: true },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      return res.status(200).json({
        success: true,
        message: 'Login successful (Demo Account)',
        data: {
          userId: DEMO_ACCOUNT.u_id,
          name: DEMO_ACCOUNT.name,
          email: DEMO_ACCOUNT.email,
          age: DEMO_ACCOUNT.age,
          education: DEMO_ACCOUNT.education,
          mobile_no: DEMO_ACCOUNT.mobile_no,
          token,
          isDemo: true
        }
      });
    }

    try {
      // Find user by email in database
      const [users] = await db.query(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      if (users.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
          hint: 'Try demo account: demo@habitguard.com / demo123'
        });
      }

      const user = users[0];

      // Compare password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.u_id, email: user.email },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          userId: user.u_id,
          name: user.name,
          email: user.email,
          age: user.age,
          education: user.education,
          mobile_no: user.mobile_no,
          token,
          isDemo: false
        }
      });
    } catch (dbError) {
      console.error('Database error during login:', dbError);
      
      // If database fails, suggest demo account
      return res.status(503).json({
        success: false,
        message: 'Database connection failed',
        demoAccount: {
          available: true,
          email: DEMO_ACCOUNT.email,
          password: DEMO_ACCOUNT.password,
          note: 'Use this demo account to test the app'
        },
        error: 'Database unavailable'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message,
      demoAccount: {
        email: DEMO_ACCOUNT.email,
        password: DEMO_ACCOUNT.password
      }
    });
  }
};

/**
 * Get user profile (requires authentication)
 */
exports.getProfile = async (req, res) => {
  try {
    const userId = req.userId; // Set by auth middleware

    const [users] = await db.query(
      'SELECT u_id, name, age, education, email, mobile_no, created_at FROM users WHERE u_id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
};
