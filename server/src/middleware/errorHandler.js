const errorHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error:`, err.message);
  if (process.env.NODE_ENV === 'development') console.error(err.stack);

  if (err.code === '23505') {
    return res.status(409).json({ message: 'A record with that value already exists' });
  }
  if (err.code === '23503') {
    return res.status(400).json({ message: 'Referenced record not found' });
  }

  const status = err.statusCode || err.status || 500;
  res.status(status).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
