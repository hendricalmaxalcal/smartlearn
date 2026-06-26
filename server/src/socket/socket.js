const { verifyAccessToken } = require('../utils/jwt');
const { query } = require('../config/db');

const setupSocket = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const decoded = verifyAccessToken(token);
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    const userId = socket.userId;
    onlineUsers.set(userId, socket.id);
    io.emit('user:online', { userId, onlineCount: onlineUsers.size });

    socket.on('conversation:join', (conversationId) => {
      socket.join(`conv:${conversationId}`);
    });

    socket.on('message:send', async ({ conversationId, content, mediaUrl }) => {
      try {
        const result = await query(
          `INSERT INTO messages (conversation_id, sender_id, content, media_url, read_by)
           VALUES ($1, $2, $3, $4, ARRAY[$2]::uuid[])
           RETURNING *`,
          [conversationId, userId, content, mediaUrl || null]
        );
        const message = result.rows[0];
        await query(
          'UPDATE conversations SET last_message_at = NOW() WHERE id = $1',
          [conversationId]
        );
        io.to(`conv:${conversationId}`).emit('message:new', message);
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('message:read', async ({ conversationId, messageIds }) => {
      if (!messageIds?.length) return;
      await query(
        `UPDATE messages SET read_by = array_append(read_by, $1::uuid)
         WHERE id = ANY($2::uuid[]) AND NOT ($1::uuid = ANY(read_by))`,
        [userId, messageIds]
      );
      socket.to(`conv:${conversationId}`).emit('message:read', { userId, messageIds });
    });

    socket.on('typing:start', ({ conversationId }) => {
      socket.to(`conv:${conversationId}`).emit('typing:start', { userId });
    });

    socket.on('typing:stop', ({ conversationId }) => {
      socket.to(`conv:${conversationId}`).emit('typing:stop', { userId });
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
      io.emit('user:offline', { userId, onlineCount: onlineUsers.size });
    });
  });
};

module.exports = setupSocket;
