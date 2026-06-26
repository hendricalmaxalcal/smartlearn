const express = require('express');
const { protect } = require('../middleware/auth');
const { query } = require('../config/db');

const router = express.Router();

router.get('/dashboard', protect, async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [enrolled, events] = await Promise.all([
      query(
        `SELECT c.id, c.title, c.slug, c.stream, c.thumbnail_url,
                e.enrolled_at,
                COALESCE(
                  ROUND(
                    COUNT(cp.id) FILTER (WHERE cp.completed = true) * 100.0 /
                    NULLIF(COUNT(r.id), 0)
                  ), 0
                ) AS progress
         FROM enrollments e
         JOIN courses c ON c.id = e.course_id
         LEFT JOIN chapters ch ON ch.course_id = c.id
         LEFT JOIN resources r ON r.chapter_id = ch.id
         LEFT JOIN course_progress cp ON cp.resource_id = r.id AND cp.user_id = $1
         WHERE e.user_id = $1
         GROUP BY c.id, c.title, c.slug, c.stream,
                  c.thumbnail_url, e.enrolled_at
         ORDER BY e.enrolled_at DESC
         LIMIT 5`,
        [userId]
      ),
      query(
        `SELECT id, title, event_date FROM events
         WHERE event_date > NOW()
         AND (target_form_level IS NULL OR target_form_level = (
           SELECT form_level FROM users WHERE id = $1
         ))
         ORDER BY event_date ASC LIMIT 3`,
        [userId]
      ),
    ]);

    res.json({
      enrolled: enrolled.rows.length,
      completed: 0,
      quizAvg: null,
      streak: 0,
      recentCourses: enrolled.rows,
      upcomingEvents: events.rows,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/my-courses', protect, async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await query(
      `SELECT c.id, c.title, c.slug, c.stream, c.form_level,
              c.thumbnail_url, c.is_premium, c.total_resources,
              e.enrolled_at,
              COALESCE(
                ROUND(
                  COUNT(cp.id) FILTER (WHERE cp.completed = true) * 100.0 /
                  NULLIF(COUNT(r.id), 0)
                ), 0
              ) AS progress
       FROM enrollments e
       JOIN courses c ON c.id = e.course_id
       LEFT JOIN chapters ch ON ch.course_id = c.id
       LEFT JOIN resources r ON r.chapter_id = ch.id
       LEFT JOIN course_progress cp ON cp.resource_id = r.id AND cp.user_id = $1
       WHERE e.user_id = $1
       GROUP BY c.id, c.title, c.slug, c.stream, c.form_level,
                c.thumbnail_url, c.is_premium, c.total_resources, e.enrolled_at
       ORDER BY e.enrolled_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.post('/progress', protect, async (req, res, next) => {
  try {
    const { resource_id, completed, last_position_sec } = req.body;
    const userId = req.user.id;

    await query(
      `INSERT INTO course_progress (user_id, resource_id, completed, last_position_sec)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, resource_id)
       DO UPDATE SET
         completed = COALESCE($3, course_progress.completed),
         last_position_sec = COALESCE($4, course_progress.last_position_sec),
         updated_at = NOW()`,
      [userId, resource_id, completed || false, last_position_sec || 0]
    );

    res.json({ message: 'Progress saved' });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', protect, async (req, res, next) => {
  try {
    const { id } = req.params;
    const group = await query(
      `SELECT g.*,
              json_agg(
                json_build_object(
                  'id', u.id,
                  'full_name', u.full_name,
                  'stream', u.stream,
                  'form_level', u.form_level
                )
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
    const result = await query(
      `SELECT m.*, u.full_name AS sender_name
       FROM messages m
       JOIN users u ON u.id = m.sender_id
       JOIN conversations c ON c.id = m.conversation_id
       WHERE c.group_id = $1
       ORDER BY m.sent_at ASC
       LIMIT 100`,
      [id]
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