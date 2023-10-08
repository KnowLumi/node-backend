const multer = require('multer');
const { db } = require('../config');
const { curriculumSchema } = require('../schema/curriculumSchema'); // Import your curriculum schema

// Configure multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

const curriculumCollection = db.collection('curriculum');

// Create a new curriculum for a specific course with JSON data or multipart form data
const createCurriculumForCourse = async (req, res) => {
  try {
    upload.any()(req, res, async function (err) {
      if (err) {
        console.error('Error uploading files:', err);
        return res.status(400).json({ error: 'File upload failed' });
      }

      // Access form fields from req.body
      const { courseId, title, subtitle, sections } = req.body;

      // Check if required fields are provided
      if (!courseId || !title || !subtitle || !sections) {
        return res.status(400).json({ error: 'Required fields are missing.' });
      }

      // Create a new curriculum document using the schema
      const newCurriculum = {
        courseId,
        title,
        subtitle,
        sections: JSON.parse(sections), // Parse sections as JSON
        tmsCreate: Date.now(), // Add the current timestamp for tmsCreate
        tmsUpdate: Date.now(), // Add the current timestamp for tmsUpdate
      };

      // Add the new curriculum document to the 'curriculum' collection
      const curriculumRef = await curriculumCollection.add(newCurriculum);

      res.status(201).json({ message: 'Curriculum created successfully', id: curriculumRef.id });
    });
  } catch (error) {
    console.error('Error creating curriculum:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Function to get a single curriculum by ID
const getCurriculumById = async (req, res) => {
  try {
    const curriculumId = req.params.id; // Get the curriculum ID from the request parameters

    // Retrieve the curriculum with the specified ID from the 'curricula' collection
    const curriculumDoc = await curriculumCollection.doc(curriculumId).get();

    if (!curriculumDoc.exists) {
      return res.status(404).json({ error: 'Curriculum not found' });
    }

    // Get the curriculum data
    const curriculumData = curriculumDoc.data();

    res.status(200).json(curriculumData);
  } catch (error) {
    console.error('Error getting curriculum by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



// Update a curriculum by ID
const updateCurriculum = async (req, res) => {
  try {
    // Get the curriculum ID from the request parameters
    const curriculumId = req.params.id;

    // Access the updated curriculum data from req.body
    const { title, subtitle, sections } = req.body;

    // Check if required fields are provided
    if (!title || !subtitle || !sections) {
      return res.status(400).json({ error: 'Required fields are missing.' });
    }

    // Prepare the updated curriculum data
    const updatedCurriculumData = {
      title,
      subtitle,
      sections: JSON.parse(sections), // Parse sections as JSON
      tmsUpdate: Date.now(), // Update the tmsUpdate timestamp
    };

    // Update the curriculum document in the 'curriculum' collection
    const curriculumRef = curriculumCollection.doc(curriculumId);

    await curriculumRef.update(updatedCurriculumData);

    res.status(200).json({ message: 'Curriculum updated successfully' });
  } catch (error) {
    console.error('Error updating curriculum:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};




// Delete a curriculum by ID
const deleteCurriculum = async (req, res) => {
    try {
      // Get the curriculum ID from the request parameters
      const curriculumId = req.params.id;
  
      // Check if the curriculum exists
      const curriculumDoc = await curriculumCollection.doc(curriculumId).get();
  
      if (!curriculumDoc.exists) {
        return res.status(404).json({ error: 'Curriculum not found' });
      }
  
      // Delete the curriculum document from the 'curriculum' collection
      await curriculumCollection.doc(curriculumId).delete();
  
      res.status(200).json({ message: 'Curriculum deleted successfully' });
    } catch (error) {
      console.error('Error deleting curriculum:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  


module.exports = { createCurriculumForCourse,updateCurriculum,deleteCurriculum,getCurriculumById };
