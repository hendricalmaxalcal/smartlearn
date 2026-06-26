const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

const teacherOrAdmin = (req, res, next) => {
  if (!req.user || !['admin', 'teacher'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Teacher or admin access required' });
  }
  next();
};

module.exports = { adminOnly, teacherOrAdmin };
