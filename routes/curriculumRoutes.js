// curriculumRoutes.js
const express = require('express');
const { createCurriculum, updateCurriculum, deleteCurriculum, getCurriculumById } = require('../controllers/curriculumController');
const multer = require('multer');
const { verifyFirebaseToken } = require('../middlewares/authMiddleware');


const router = express.Router();

// Configure multer for handling file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Define a route to create a curriculum
router.post('/curriculum', upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'pdf', maxCount: 1 },
    { name: 'image', maxCount: 1 }
  ]), createCurriculum);
  

// Route to update a curriculum by ID
router.get('/curriculum/:id',verifyFirebaseToken, getCurriculumById);

// Route to update a curriculum by ID
router.put('/curriculum/:id',upload.none(),verifyFirebaseToken, updateCurriculum);

// Route to delete a curriculum by ID
router.delete('/curriculum/:id',verifyFirebaseToken, deleteCurriculum)

module.exports = router;
