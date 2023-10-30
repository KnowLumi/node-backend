// routes/courseRoutes.js
const express = require('express');
const { createCourse, getAllCourses, updateCourse, getCourseById, deleteCourse } = require('../controllers/courseController');
const { verifyFirebaseToken } = require('../middlewares/authMiddleware');

const router = express.Router();




router.post('/courses',verifyFirebaseToken, createCourse);

//  route to get all courses
router.get('/courses',verifyFirebaseToken, getAllCourses);

//  route to get a single course by ID
router.get('/courses/:id',verifyFirebaseToken, getCourseById);

//  route to update a course by ID
router.put('/courses/:id',verifyFirebaseToken, updateCourse);

// Define a route to delete a course by ID
router.delete('/courses/:id',verifyFirebaseToken, deleteCourse)

module.exports = router;
