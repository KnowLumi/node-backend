// routes/creatorRoutes.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { createCreator, getAllCreators, updateCreatorss, deleteCreator } = require('../controllers/creatorController');
const admin = require('firebase-admin');
;


// Configure multer for handling file uploads (if needed)
const storage = multer.memoryStorage(); // Use memory storage for file uploads
const upload = multer({ storage: storage });

// Create a new creator with JSON data or multipart form data
router.post('/creators',  createCreator);

//get all creator
router.get('/creators', getAllCreators);

//update
router.put('/creators/:id', updateCreatorss)

//delete
router.delete('/creators/:id', deleteCreator);


  
module.exports = router;
