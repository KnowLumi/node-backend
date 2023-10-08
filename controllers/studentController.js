// studentController.js
const { studentCollection } = require('../schema/studentSchema');
const multer = require('multer');
const admin = require('firebase-admin');

const storageMulter = multer.memoryStorage();
const upload = multer({ storage: storageMulter }).single('photo');

const createStudent = async (req, res) => {
  try {
    upload(req, res, async function (err) {
      if (err) {
        console.error('Error uploading image:', err);
        return res.status(400).json({ error: 'Image upload failed' });
      }

      if (req.file) {
        const uploadedFile = req.file;

        // Upload the image to Firebase Storage
        const bucket = admin.storage().bucket(); // Replace with your Firebase Storage bucket name

        const uniqueFileName = `${Date.now()}_${uploadedFile.originalname}`;

        const file = bucket.file(uniqueFileName);

        const stream = file.createWriteStream({
          metadata: {
            contentType: uploadedFile.mimetype,
          },
          resumable: false,
        });

        stream.on('error', (err) => {
          console.error('Error uploading to Firebase Storage:', err);
          res.status(500).json({ error: 'Internal server error' });
        });

        stream.on('finish', async () => {
          // Generate the image URL
          const photoUrl = `https://storage.googleapis.com/${bucket.name}/${uniqueFileName}`;

          // Access form fields from req.body (for both JSON and form data)
          const {
            id,
            firstName,
            lastName,
            email,
            phone,
            interestedTopic,
            accessibleCourses,
            enrolledCourses,
            wishlistedCourses,
            refId,
            
          } = req.body;
         
          // Create a new student document using the updated schema
          const newStudent = {
            id,
            firstName,
            lastName,
            email,
            phone,
            photoUrl, // Add the photo URL here
            interestedTopic,
            accessibleCourses,
            enrolledCourses,
            wishlistedCourses,
            refId,
            tmsCreate: Date.now(), // Add the current timestamp for tmsCreate
            tmsUpdate: Date.now(), // Add the current timestamp for tmsUpdate
          };

          // Add the new student document to the 'students' collection
          const studentRef = await studentCollection.add(newStudent);

          res.status(201).json({ message: 'Student created successfully', id: studentRef.id });
        });

        // Pipe the file buffer to the storage stream
        stream.end(uploadedFile.buffer);
      } else {
        res.status(400).json({ error: 'No image file uploaded' });
      }
    });
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Function to get all student details
const getAllStudents = async (req, res) => {
    try {
      // Query Firestore to get all student documents
      const querySnapshot = await studentCollection.get();
  
      // Initialize an array to store student data
      const students = [];
  
      // Loop through the query snapshot and extract student data
      querySnapshot.forEach((doc) => {
        const studentData = doc.data();
        students.push({
          id: doc.id, // Document ID
          ...studentData, // Other student data
        });
      });
  
      // Respond with the array of student details
      res.status(200).json({ students });
    } catch (error) {
      console.error('Error getting students:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  // Function to delete a student by ID
const deleteStudent = async (req, res) => {
    try {
      const studentId = req.params.id; // Get the student ID from the request parameters
  
      // Check if the student document exists
      const studentDoc = await studentCollection.doc(studentId).get();
      if (!studentDoc.exists) {
        return res.status(404).json({ error: 'Student not found' });
      }
  
      // Delete the student document
      await studentDoc.ref.delete();
  
      // Respond with a success message
      res.status(200).json({ message: 'Student deleted successfully' });
    } catch (error) {
      console.error('Error deleting student:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  // Function to update a student by ID
const updateStudent = async (req, res) => {
    try {
      upload(req, res, async function (err) {
        if (err) {
          console.error('Error uploading image:', err);
          return res.status(400).json({ error: 'Image upload failed' });
        }
  
        const studentId = req.params.id; // Get the student ID from the request parameters
        const data = req.body; // Student data from the form fields
  
        // Check if a file has been uploaded
        if (req.file) {
          const uploadedFile = req.file;
  
          // Upload the image to Firebase Storage
          const bucket = admin.storage().bucket(); // Replace with your Firebase Storage bucket name
  
          const uniqueFileName = `${Date.now()}_${uploadedFile.originalname}`;
  
          const file = bucket.file(uniqueFileName);
  
          const stream = file.createWriteStream({
            metadata: {
              contentType: uploadedFile.mimetype,
            },
            resumable: false,
          });
  
          stream.on('error', (err) => {
            console.error('Error uploading to Firebase Storage:', err);
            res.status(500).json({ error: 'Internal server error' });
          });
  
          stream.on('finish', async () => {
            // Generate the updated photo URL
            const updatedPhotoUrl = `https://storage.googleapis.com/${bucket.name}/${uniqueFileName}`;
  
            // Update the data to include the updated photo URL
            data.photoUrl = updatedPhotoUrl;
  
            try {
              // Check if the student document exists
              const studentDoc = await studentCollection.doc(studentId).get();
              if (!studentDoc.exists) {
                return res.status(404).json({ error: 'Student not found' });
              }
  
              // Update the student document with the provided data
              await studentDoc.ref.update(data);
  
              // Respond with a success message
              res.status(200).json({ message: 'Student updated successfully' });
            } catch (error) {
              console.error('Error updating student:', error);
              res.status(500).json({ error: 'Internal server error' });
            }
          });
  
          // Pipe the file buffer to the storage stream
          stream.end(uploadedFile.buffer);
        } else {
          // No new photo has been uploaded, proceed to update other fields
          try {
            // Check if the student document exists
            const studentDoc = await studentCollection.doc(studentId).get();
            if (!studentDoc.exists) {
              return res.status(404).json({ error: 'Student not found' });
            }
  
            // Update the student document with the provided data
            await studentDoc.ref.update(data);
  
            // Respond with a success message
            res.status(200).json({ message: 'Student updated successfully' });
          } catch (error) {
            console.error('Error updating student:', error);
            res.status(500).json({ error: 'Internal server error' });
          }
        }
      });
    } catch (error) {
      console.error('Error updating student:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  // Function to get a student by ID
const getStudentById = async (req, res) => {
    try {
      const studentId = req.params.id; // Get the student ID from the request parameters
  
      // Query Firestore to get the student document by ID
      const studentDoc = await studentCollection.doc(studentId).get();
  
      // Check if the student document exists
      if (!studentDoc.exists) {
        return res.status(404).json({ error: 'Student not found' });
      }
  
      // Extract the student data from the document
      const studentData = studentDoc.data();
  
      // Respond with the student data
      res.status(200).json({ student: { id: studentDoc.id, ...studentData } });
    } catch (error) {
      console.error('Error getting student by ID:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  

module.exports = { createStudent,getAllStudents,deleteStudent,updateStudent ,getStudentById};
