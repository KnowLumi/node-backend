const multer = require('multer');
const { db } = require('../middlewares/authMiddleware');
const { curriculumSchema } = require('../schema/curriculumSchema'); // Import your curriculum schemaa

// Configure multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

const curriculumCollection = db.collection('curriculum');

const createCurriculum = async (req, res) => {
  try {
    const { courseId, title, subtitle, sections } = req.body;
    const parsedSections = JSON.parse(sections);

    // Function to upload a file to Firebase Cloud Storage
    const uploadFileToFirebase = async (fileBuffer, contentType) => {
      const bucket = admin.storage().bucket();
      const file = bucket.file(`lesson_${Date.now()}_${Math.random()}.${contentType}`);
      const fileStream = file.createWriteStream({ metadata: { contentType } });

      return new Promise((resolve, reject) => {
        fileStream.on('error', (error) => {
          reject(error);
        });

        fileStream.on('finish', () => {
          resolve(file.publicUrl());
        });

        fileStream.end(fileBuffer);
      });
    };

    // Process file uploads for each lesson
    parsedSections.forEach((section) => {
      if (section.lessons) {
        section.lessons.forEach(async (lesson) => {
          if (req.files && req.files[lesson.contentType]) {
            const uploadedFile = req.files[lesson.contentType][0];
            const fileURL = await uploadFileToFirebase(uploadedFile.buffer, lesson.contentType);

            // Set the file URL in the lesson
            lesson.file = fileURL;
          }
        });
      }
    });

    // Create a new curriculum document
    const newCurriculum = {
      courseId,
      title,
      subtitle,
      sections: parsedSections,
      tmsCreate: Date.now(),
      tmsUpdate: Date.now(),
    };

    // Add the new curriculum document to the collection
    const curriculumRef = await curriculumCollection.add(newCurriculum);

    res.status(201).json({ message: 'Curriculum created successfully', id: curriculumRef.id });
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
  


module.exports = { createCurriculum,updateCurriculum,deleteCurriculum,getCurriculumById };
