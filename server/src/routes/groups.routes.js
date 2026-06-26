const express = require('express');
const { protect } = require('../middleware/auth');
const { query } = require('../config/db');
const router = express.Router();

router.get('/', protect, async (req, res, next) => {
  try {
    const { tab } = req.query;
    const userId = req.user.id;
    let result;

    if (tab === 'my-groups') {
      result = await query(
        `SELECT * FROM study_groups
         WHERE owner_id = $1 OR $1 = ANY(member_ids)
         ORDER BY created_at DESC`,
        [userId]
      );
    } else {
      result = await query(
        `SELECT * FROM study_groups
         WHERE is_private = false
         ORDER BY created_at DESC
         LIMIT 20`
      );
    }

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.post('/', protect, async (req, res, next) => {
  try {
    const { name, description, form_level, stream, is_private } = req.body;
    const userId = req.user.id;

    const result = await query(
      `INSERT INTO study_groups
        (name, description, owner_id, member_ids, form_level, stream, is_private)
       VALUES ($1, $2, $3, ARRAY[$3]::uuid[], $4, $5, $6)
       RETURNING *`,
      [name, description, userId, form_level, stream, is_private || false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/join', protect, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await query(
      `UPDATE study_groups
       SET member_ids = array_append(member_ids, $1::uuid)
       WHERE id = $2 AND NOT ($1::uuid = ANY(member_ids))`,
      [userId, id]
    );
    res.json({ message: 'Joined group' });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/leave', protect, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await query(
      `UPDATE study_groups
       SET member_ids = array_remove(member_ids, $1::uuid)
       WHERE id = $2 AND owner_id != $1`,
      [userId, id]
    );
    res.json({ message: 'Left group' });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', protect, async (req, res, next) => {
  try {
    const { id } = req.params;

    const group = await query(
      `SELECT g.*,
              COALESCE(
                json_agg(
                  json_build_object(
                    'id', u.id,
                    'full_name', u.full_name,
                    'stream', u.stream,
                    'form_level', u.form_level
                  )
                ) FILTER (WHERE u.id IS NOT NULL), '[]'
              ) AS members
       FROM study_groups g
       LEFT JOIN users u ON u.id = ANY(g.member_ids)
       WHERE g.id = $1
       GROUP BY g.id`,
      [id]
    );

    if (!group.rows.length) {
      return res.status(404).json({ message: 'Group not found' });
    }

    res.json(group.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.get('/:id/messages', protect, async (req, res, next) => {
  try {
    const { id } = req.params;

    const conv = await query(
      `SELECT id FROM conversations WHERE group_id = $1`,
      [id]
    );

    if (!conv.rows.length) {
      return res.json([]);
    }

    const result = await query(
      `SELECT m.*, u.full_name AS sender_name
       FROM messages m
       JOIN users u ON u.id = m.sender_id
       WHERE m.conversation_id = $1
       ORDER BY m.sent_at ASC
       LIMIT 100`,
      [conv.rows[0].id]
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/messages', protect, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    let conv = await query(
      `SELECT id FROM conversations WHERE group_id = $1`,
      [id]
    );

    if (!conv.rows.length) {
      conv = await query(
        `INSERT INTO conversations (type, group_id, participant_ids)
         VALUES ('group', $1, ARRAY[$2]::uuid[])
         RETURNING id`,
        [id, userId]
      );
    }

    const convId = conv.rows[0].id;

    await query(
      `INSERT INTO messages (conversation_id, sender_id, content, read_by)
       VALUES ($1, $2, $3, ARRAY[$2]::uuid[])`,
      [convId, userId, content]
    );

    await query(
      `UPDATE conversations SET last_message_at = NOW() WHERE id = $1`,
      [convId]
    );

    res.status(201).json({ message: 'Sent' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;