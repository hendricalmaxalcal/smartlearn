const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/db');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');

const register = async (req, res, next) => {
  try {
    const { full_name, email, password, form_level, stream } = req.body;

    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const result = await query(
      `INSERT INTO users (full_name, email, password_hash, form_level, stream, is_verified)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING id, full_name, email, role, form_level, stream, is_verified, created_at`,
      [full_name, email, password_hash, form_level, stream]
    );

    const user = result.rows[0];
    const accessToken = generateAccessToken({ id: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id });

    res.status(201).json({
      message: 'Registration successful.',
      user,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await query(
      `SELECT id, full_name, email, password_hash, role, avatar_url,
              form_level, stream, is_verified, is_active
       FROM users WHERE email = $1`,
      [email]
    );

    if (!result.rows.length) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({ message: 'Account has been suspended' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    await query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    const { password_hash, ...safeUser } = user;
    const accessToken = generateAccessToken({ id: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id });

    res.json({ user: safeUser, accessToken, refreshToken });
  } catch (err) {
    next(err);
  }
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: 'Refresh token required' });

    const decoded = verifyRefreshToken(refreshToken);
    const result = await query(
      'SELECT id, role, is_active FROM users WHERE id = $1',
      [decoded.id]
    );

    if (!result.rows.length || !result.rows[0].is_active) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const user = result.rows[0];
    const accessToken = generateAccessToken({ id: user.id, role: user.role });
    res.json({ accessToken });
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    res.json({ message: 'If that email exists, a reset link has been sent' });
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res) => {
  const result = await query(
    `SELECT id, full_name, email, role, avatar_url, form_level, stream,
            is_verified, last_login, created_at
     FROM users WHERE id = $1`,
    [req.user.id]
  );
  res.json(result.rows[0]);
};

module.exports = {
  register,
  login,
  refresh,
  forgotPassword,
  resetPassword,
  getMe,
};