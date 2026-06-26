const { query } = require('../config/db');
const bcrypt = require('bcryptjs');

const getDashboardStats = async (req, res, next) => {
  try {
    const [users, courses, subs, revenue] = await Promise.all([
      query(`SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') AS this_month FROM users WHERE role = 'student'`),
      query(`SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE is_published = true) AS published FROM courses`),
      query(`SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status = 'active' AND ends_at > NOW()) AS active FROM subscriptions`),
      query(`SELECT COALESCE(SUM(sp.price), 0) AS total_revenue FROM subscriptions s JOIN subscription_plans sp ON sp.id = s.plan_id WHERE s.status = 'active' AND s.created_at > NOW() - INTERVAL '30 days'`),
    ]);

    const recentEnrollments = await query(
      `SELECT e.enrolled_at, u.full_name, u.email, c.title AS course_title, c.stream
       FROM enrollments e
       JOIN users u ON u.id = e.user_id
       JOIN courses c ON c.id = e.course_id
       ORDER BY e.enrolled_at DESC LIMIT 10`
    );

    const pendingResources = await query(
      `SELECT r.id, r.title, r.type, ch.title AS chapter_title, c.title AS course_title
       FROM resources r
       JOIN chapters ch ON ch.id = r.chapter_id
       JOIN courses c ON c.id = ch.course_id
       WHERE r.is_published = false
       LIMIT 10`
    );

    res.json({
      stats: {
        students: users.rows[0],
        courses: courses.rows[0],
        subscriptions: subs.rows[0],
        revenue: revenue.rows[0],
      },
      recentEnrollments: recentEnrollments.rows,
      pendingResources: pendingResources.rows,
    });
  } catch (err) {
    next(err);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const { search, stream, role, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];
    let i = 1;

    if (search) {
      conditions.push(`(full_name ILIKE $${i} OR email ILIKE $${i})`);
      params.push(`%${search}%`); i++;
    }
    if (stream) { conditions.push(`stream = $${i++}`); params.push(stream); }
    if (role) { conditions.push(`role = $${i++}`); params.push(role); }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    params.push(limit, offset);

    const result = await query(
      `SELECT id, full_name, email, role, form_level, stream, is_verified,
              is_active, last_login, created_at, COUNT(*) OVER() AS total_count
       FROM users ${where}
       ORDER BY created_at DESC
       LIMIT $${i} OFFSET $${i + 1}`,
      params
    );

    const total = result.rows[0]?.total_count || 0;
    res.json({
      users: result.rows,
      pagination: { total: Number(total), page: Number(page), limit: Number(limit) },
    });
  } catch (err) {
    next(err);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { is_active, role } = req.body;

    const result = await query(
      `UPDATE users SET
         is_active = COALESCE($1, is_active),
         role = COALESCE($2, role)
       WHERE id = $3 RETURNING id, full_name, email, role, is_active`,
      [is_active, role, id]
    );
    if (!result.rows.length) return res.status(404).json({ message: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (id === req.user.id) return res.status(400).json({ message: 'Cannot delete your own account' });
    await query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ message: 'User deleted' });
  } catch (err) {
    next(err);
  }
};

const createAnnouncement = async (req, res, next) => {
  try {
    const { title, body, target_stream, target_form_level } = req.body;

    let userQuery = 'SELECT id FROM users WHERE is_active = true AND role = $1';
    const params = ['student'];

    if (target_stream) { userQuery += ` AND stream = $${params.length + 1}`; params.push(target_stream); }
    if (target_form_level) { userQuery += ` AND form_level = $${params.length + 1}`; params.push(target_form_level); }

    const users = await query(userQuery, params);

    if (users.rows.length) {
      const values = users.rows.map(u =>
        `('${u.id}', 'announcement', '${title.replace(/'/g, "''")}', '${body.replace(/'/g, "''")}', '{}', false, NOW())`
      ).join(',');

      await query(
        `INSERT INTO notifications (user_id, type, title, body, meta, is_read, created_at) VALUES ${values}`
      );
    }

    res.json({ message: `Announcement sent to ${users.rows.length} students` });
  } catch (err) {
    next(err);
  }
};

const getSubscriptionStats = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT sp.name AS plan_name, sp.price,
              COUNT(s.id) AS total_subs,
              COUNT(s.id) FILTER (WHERE s.status = 'active' AND s.ends_at > NOW()) AS active_subs,
              SUM(sp.price) FILTER (WHERE s.created_at > NOW() - INTERVAL '30 days') AS monthly_revenue
       FROM subscription_plans sp
       LEFT JOIN subscriptions s ON s.plan_id = sp.id
       GROUP BY sp.id, sp.name, sp.price
       ORDER BY sp.price ASC`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardStats, getAllUsers, updateUserStatus, deleteUser,
  createAnnouncement, getSubscriptionStats,
};
