const { query } = require('../config/db');

const getAllCourses = async (req, res, next) => {
  try {
    const { form_level, stream, search, is_premium, page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;
    const conditions = ['c.is_published = true'];
    const params = [];
    let i = 1;

    if (form_level) { conditions.push(`c.form_level = $${i++}`); params.push(form_level); }
    if (stream) { conditions.push(`c.stream = $${i++}`); params.push(stream); }
    if (is_premium !== undefined) { conditions.push(`c.is_premium = $${i++}`); params.push(is_premium === 'true'); }
    if (search) {
      conditions.push(`(c.title ILIKE $${i} OR c.description ILIKE $${i})`);
      params.push(`%${search}%`); i++;
    }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    params.push(limit, offset);

    const result = await query(
      `SELECT c.*, u.full_name AS teacher_name,
              COUNT(*) OVER() AS total_count
       FROM courses c
       LEFT JOIN users u ON u.id = c.teacher_id
       ${where}
       ORDER BY c.created_at DESC
       LIMIT $${i} OFFSET $${i + 1}`,
      params
    );

    const total = result.rows[0]?.total_count || 0;
    res.json({
      courses: result.rows,
      pagination: { total: Number(total), page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

const getCourseBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const result = await query(
      `SELECT c.*, u.full_name AS teacher_name, u.avatar_url AS teacher_avatar
       FROM courses c
       LEFT JOIN users u ON u.id = c.teacher_id
       WHERE c.slug = $1`,
      [slug]
    );
    if (!result.rows.length) return res.status(404).json({ message: 'Course not found' });

    const course = result.rows[0];

    const chapters = await query(
      `SELECT ch.*, 
              json_agg(r ORDER BY r.order_index) AS resources
       FROM chapters ch
       LEFT JOIN resources r ON r.chapter_id = ch.id
       WHERE ch.course_id = $1
       GROUP BY ch.id
       ORDER BY ch.order_index`,
      [course.id]
    );
    course.chapters = chapters.rows;

    res.json(course);
  } catch (err) {
    next(err);
  }
};

const createCourse = async (req, res, next) => {
  try {
    const { title, description, form_level, stream, is_premium, thumbnail_url } = req.body;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();

    const result = await query(
      `INSERT INTO courses (teacher_id, title, slug, description, form_level, stream, is_premium, thumbnail_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [req.user.id, title, slug, description, form_level, stream, is_premium || false, thumbnail_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, form_level, stream, is_premium, thumbnail_url, is_published } = req.body;

    const result = await query(
      `UPDATE courses SET
         title = COALESCE($1, title),
         description = COALESCE($2, description),
         form_level = COALESCE($3, form_level),
         stream = COALESCE($4, stream),
         is_premium = COALESCE($5, is_premium),
         thumbnail_url = COALESCE($6, thumbnail_url),
         is_published = COALESCE($7, is_published),
         updated_at = NOW()
       WHERE id = $8 RETURNING *`,
      [title, description, form_level, stream, is_premium, thumbnail_url, is_published, id]
    );
    if (!result.rows.length) return res.status(404).json({ message: 'Course not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM courses WHERE id = $1', [id]);
    res.json({ message: 'Course deleted' });
  } catch (err) {
    next(err);
  }
};

const enrollInCourse = async (req, res, next) => {
  try {
    const { course_id } = req.body;
    const user_id = req.user.id;

    const course = await query('SELECT id, is_premium FROM courses WHERE id = $1', [course_id]);
    if (!course.rows.length) return res.status(404).json({ message: 'Course not found' });

    if (course.rows[0].is_premium) {
      const sub = await query(
        `SELECT id FROM subscriptions
         WHERE user_id = $1 AND status = 'active' AND ends_at > NOW()`,
        [user_id]
      );
      if (!sub.rows.length) {
        return res.status(403).json({ message: 'Premium subscription required for this course' });
      }
    }

    await query(
      `INSERT INTO enrollments (user_id, course_id) VALUES ($1, $2)
       ON CONFLICT (user_id, course_id) DO NOTHING`,
      [user_id, course_id]
    );
    res.json({ message: 'Enrolled successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllCourses, getCourseBySlug, createCourse, updateCourse, deleteCourse, enrollInCourse };
