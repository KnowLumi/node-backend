// routes/creatorRoutes.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { createCreator, getAllCreators, updateCreatorss, deleteCreator, getCreatorById } = require('../controllers/creatorController');
const admin = require('firebase-admin');
const { verifyFirebaseToken } = require('../middlewares/authMiddleware');




// Configure multer for handling file uploads (if needed)
const storage = multer.memoryStorage(); // Use memory storage for file uploads
const upload = multer({ storage: storage });

// Create a new creator with JSON data or multipart form data
router.post('/creators',verifyFirebaseToken, createCreator);

//get all creator
router.get('/creators',verifyFirebaseToken, getAllCreators);

// Get a creator by ID
router.get('/creators/:id',verifyFirebaseToken, getCreatorById);

//update
router.put('/creators/:id',verifyFirebaseToken, updateCreatorss)

//delete
router.delete('/creators/:id',verifyFirebaseToken,deleteCreator);


  
module.exports = router;
