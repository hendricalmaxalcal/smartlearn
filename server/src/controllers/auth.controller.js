const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/db');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email');

const register = async (req, res, next) => {
  try {
    const { full_name, email, password, form_level, stream } = req.body;

    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const verify_token = uuidv4();

    const result = await query(
      `INSERT INTO users (full_name, email, password_hash, form_level, stream, verify_token)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, full_name, email, role, form_level, stream, is_verified, created_at`,
      [full_name, email, password_hash, form_level, stream, verify_token]
    );

    const user = result.rows[0];
    await sendVerificationEmail(email, full_name, verify_token);

    const accessToken = generateAccessToken({ id: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id });

    res.status(201).json({
      message: 'Registration successful. Please verify your email.',
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

    // Block unverified users
    if (!user.is_verified) {
      return res.status(403).json({ 
        message: 'Please verify your email before logging in. Check your inbox.' 
      });
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

const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    const result = await query(
      `UPDATE users SET is_verified = true, verify_token = NULL
       WHERE verify_token = $1 RETURNING id`,
      [token]
    );

    if (!result.rows.length) {
      return res.status(400).json({ message: 'Invalid or expired verification link' });
    }

    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    next(err);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await query('SELECT id, full_name FROM users WHERE email = $1', [email]);

    if (result.rows.length) {
      const token = uuidv4();
      const expires = new Date(Date.now() + 60 * 60 * 1000);
      await query(
        'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE email = $3',
        [token, expires, email]
      );
      await sendPasswordResetEmail(email, result.rows[0].full_name, token);
    }

    res.json({ message: 'If that email exists, a reset link has been sent' });
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const result = await query(
      `SELECT id FROM users
       WHERE reset_token = $1 AND reset_token_expires > NOW()`,
      [token]
    );

    if (!result.rows.length) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const hash = await bcrypt.hash(password, 10);
    await query(
      `UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL
       WHERE id = $2`,
      [hash, result.rows[0].id]
    );

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

module.exports = { register, login, refresh, verifyEmail, forgotPassword, resetPassword, getMe };
