const express = require('express');
const { getAllCourses, getCourseBySlug, createCourse, updateCourse, deleteCourse, enrollInCourse } = require('../controllers/courses.controller');
const { protect } = require('../middleware/auth');
const { teacherOrAdmin } = require('../middleware/adminOnly');

const router = express.Router();

router.get('/', getAllCourses);
router.get('/:slug', getCourseBySlug);
router.post('/', protect, teacherOrAdmin, createCourse);
router.put('/:id', protect, teacherOrAdmin, updateCourse);
router.delete('/:id', protect, teacherOrAdmin, deleteCourse);
router.post('/enroll', protect, enrollInCourse);

module.exports = router;
