const express = require('express');
const { protect } = require('../middleware/auth');
const { query } = require('../config/db');
const router = express.Router();

router.get('/posts', protect, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await query(
      `SELECT p.*,
              u.full_name AS author_name,
              u.stream AS author_stream,
              EXISTS(
                SELECT 1 FROM post_likes pl
                WHERE pl.post_id = p.id AND pl.user_id = $1
              ) AS liked_by_me,
              COALESCE(
                json_agg(
                  json_build_object(
                    'id', c.id,
                    'content', c.content,
                    'author_name', cu.full_name,
                    'created_at', c.created_at
                  ) ORDER BY c.created_at ASC
                ) FILTER (WHERE c.id IS NOT NULL), '[]'
              ) AS comments
       FROM posts p
       JOIN users u ON u.id = p.user_id
       LEFT JOIN comments c ON c.post_id = p.id
       LEFT JOIN users cu ON cu.id = c.user_id
       GROUP BY p.id, u.full_name, u.stream
       ORDER BY p.created_at DESC
       LIMIT 50`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.post('/posts', protect, async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) {
      return res.status(400).json({ message: 'Content is required' });
    }
    const result = await query(
      `INSERT INTO posts (user_id, content)
       VALUES ($1, $2)
       RETURNING *`,
      [req.user.id, content.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.post('/posts/:id/like', protect, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await query(
      'SELECT id FROM post_likes WHERE post_id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existing.rows.length) {
      await query(
        'DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2',
        [id, userId]
      );
      await query(
        'UPDATE posts SET likes_count = likes_count - 1 WHERE id = $1',
        [id]
      );
    } else {
      await query(
        'INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2)',
        [id, userId]
      );
      await query(
        'UPDATE posts SET likes_count = likes_count + 1 WHERE id = $1',
        [id]
      );
    }
    res.json({ message: 'Done' });
  } catch (err) {
    next(err);
  }
});

router.post('/posts/:id/comments', protect, async (req, res, next) => {
  try {
    const { content } = req.body;
    const { id } = req.params;
    if (!content?.trim()) {
      return res.status(400).json({ message: 'Content is required' });
    }
    await query(
      'INSERT INTO comments (post_id, user_id, content) VALUES ($1, $2, $3)',
      [id, req.user.id, content.trim()]
    );
    await query(
      'UPDATE posts SET comments_count = comments_count + 1 WHERE id = $1',
      [id]
    );
    res.status(201).json({ message: 'Comment added' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;