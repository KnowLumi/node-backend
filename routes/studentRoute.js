// studentRoutes.js

const express = require('express');
const router = express.Router();
const { createStudent, getAllStudents, deleteStudent, updateStudent, getStudentById } = require('../controllers/studentController');
const {  verifyFirebaseToken} = require('../middlewares/authMiddleware');

// Create a new student
router.post('/students', verifyFirebaseToken,createStudent);


// Get all student details
router.get('/students',verifyFirebaseToken, getAllStudents);

// Get a student by ID
router.get('/students/:id',verifyFirebaseToken, getStudentById);

// Delete a student by ID
router.delete('/students/:id',verifyFirebaseToken,deleteStudent);

// update a student by ID
router.put('/students/:id',verifyFirebaseToken, updateStudent );

// Define other student-related routes (update, delete, etc.) as needed.

module.exports = router;
