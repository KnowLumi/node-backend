// routes/courseRoutes.js
const express = require('express');
const { createCourse, getAllCourses, updateCourse, getCourseById, deleteCourse } = require('../controllers/courseController');

const router = express.Router();




router.post('/courses', createCourse);

//  route to get all courses
router.get('/courses', getAllCourses);

//  route to get a single course by ID
router.get('/courses/:id', getCourseById);

//  route to update a course by ID
router.put('/courses/:id', updateCourse);

// Define a route to delete a course by ID
router.delete('/courses/:id', deleteCourse);

module.exports = router;
