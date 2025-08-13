const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Simple login route
router.post('/login', async (req, res) => {
  try {
    const { password } = req.body;

    // Check if password matches environment variable
    if (password !== process.env.DASHBOARD_PASSWORD) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Create and sign JWT token
    const token = jwt.sign(
      { user: 'dashboard_user' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 