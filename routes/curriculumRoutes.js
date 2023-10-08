// curriculumRoutes.js
const express = require('express');
const {  createCurriculumForCourse, updateCurriculum, deleteCurriculum, getCurriculumById } = require('../controllers/curriculumController');
const multer = require('multer');


const router = express.Router();

// Configure multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Define a route to create a curriculum for a course
router.post('/curriculum', createCurriculumForCourse);

// Route to update a curriculum by ID
router.get('/curriculum/:id', getCurriculumById);

// Route to update a curriculum by ID
router.put('/curriculum/:id',upload.none(), updateCurriculum);

// Route to delete a curriculum by ID
router.delete('/curriculum/:id', deleteCurriculum);

module.exports = router;
