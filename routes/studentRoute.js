// studentRoutes.js

const express = require('express');
const router = express.Router();
const { createStudent, getAllStudents, deleteStudent, updateStudent, getStudentById } = require('../controllers/studentController');
const { authenticateStudent } = require('../middlewares/authMiddleware');

// Create a new student
router.post('/students',authenticateStudent, createStudent);

// Get all student details
router.get('/students', getAllStudents);

// Get a student by ID
router.get('/students/:id', getStudentById);

// Delete a student by ID
router.delete('/students/:id', deleteStudent);

// update a student by ID
router.put('/students/:id', updateStudent );

// Define other student-related routes (update, delete, etc.) as needed.

module.exports = router;
