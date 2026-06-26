require('dotenv').config();
const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

const authRoutes     = require('./routes/auth.routes');
const coursesRoutes  = require('./routes/courses.routes');
const adminRoutes    = require('./routes/admin.routes');
const studentsRoutes = require('./routes/students.routes');
const socialRoutes   = require('./routes/social.routes');
const groupsRoutes   = require('./routes/groups.routes');

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use('/api/auth',     authRoutes);
app.use('/api/courses',  coursesRoutes);
app.use('/api/admin',    adminRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/social',   socialRoutes);
app.use('/api/groups',   groupsRoutes);

app.use('*', (req, res) => res.status(404).json({ message: `Route ${req.originalUrl} not found` }));
app.use(errorHandler);

module.exports = app;