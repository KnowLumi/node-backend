const { coursesCollection } = require('../schema/courseSchema');
const admin = require('firebase-admin');
const multer = require('multer');
const express = require('express');
const socketIo = require('socket.io');

const app = express();
const server = require('http').Server(app);
const io = socketIo(server);

// Configure multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Create a new course with JSON data or multipart form data
const createCourse = async (req, res) => {
  try {
    upload.any()(req, res, async function (err) {
      if (err) {
        console.error('Error uploading files:', err);
        return res.status(400).json({ error: 'File upload failed' });
      }

      // Access form fields from req.body
      const { title, description, instructor, duration, isPublished,amount,creatorId,courseType,isPaid,whatsappUrl, studentsEnrolled,curriculumId,} = req.body;
      console.log(req.body);

      // Check if required fields are provided
      if (!title || !description || !instructor || !duration) {
        return res.status(400).json({ error: 'Required fields are missing.' });
      }

      // Initialize variables for file URLs
      let imageUrl = '';
      let videoUrl = '';
      let pdfUrl = '';

      // Handle uploaded files (if provided)
      if (req.files) {
        const imageFile = req.files.find((file) => file.fieldname === 'image');
        const videoFile = req.files.find((file) => file.fieldname === 'video');
        const pdfFile = req.files.find((file) => file.fieldname === 'pdf');

        // Upload the files to Firebase Storage
        const storage = admin.storage();
        const bucket = storage.bucket(); // Replace with your Firebase Storage bucket name

        if (imageFile) {
          const imageUploadPromise = uploadFile(imageFile, 'images', 'image.jpg', bucket);
          sendProgressUpdates(imageUploadPromise, 'Image Upload Progress', req);
          imageUrl = await imageUploadPromise;
        }
        if (videoFile) {
          const videoUploadPromise = uploadFile(videoFile, 'videos', 'video.mp4', bucket);
          sendProgressUpdates(videoUploadPromise, 'Video Upload Progress', req);
          videoUrl = await videoUploadPromise;
        }
        if (pdfFile) {
          const pdfUploadPromise = uploadFile(pdfFile, 'pdfs', 'syllabus.pdf', bucket);
          sendProgressUpdates(pdfUploadPromise, 'PDF Upload Progress', req);
          pdfUrl = await pdfUploadPromise;
        }
      }

      // Create a new course document using the schema
      const newCourse = {
        title,
        description,
        instructor,
        duration,
        isPublished,
        amount,
        creatorId,
        courseType,
        isPaid,
        whatsappUrl,
        image: imageUrl,
        video: videoUrl,
        studentsEnrolled,
        curriculumId,
        pdf: pdfUrl,
        tmsCreate: Date.now(), // Add the current timestamp for tmsCreate
        tmsUpdate: Date.now(), // Add the current timestamp for tmsUpdate
      };

      // Add the new course document to the 'courses' collection
      const courseRef = await coursesCollection.add(newCourse);

      // Send the URLs of uploaded files in the response
      const response = {
        message: 'Course created successfully',
        id: courseRef.id,
        imageUrl,
        videoUrl,
        pdfUrl,
      };

      res.status(201).json(response);
    });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Utility function to upload a file to Firebase Storage
async function uploadFile(file, folder, fileName, bucket) {
  return new Promise((resolve, reject) => {
    const storagePath = `${folder}/${fileName}`;
    const stream = bucket.file(storagePath).createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
      resumable: false,
    });

    stream.on('error', (err) => {
      console.error('Error uploading to Firebase Storage:', err);
      reject(err);
    });

    stream.on('finish', () => {
      resolve(`https://storage.googleapis.com/${bucket.name}/${storagePath}`);
    });

    // Pipe the file buffer to the storage stream
    stream.end(file.buffer);
  });
}

// Function to send progress updates to the client and terminal
function sendProgressUpdates(uploadPromise, eventName, req) {
  let lastProgress = 0;

  uploadPromise
    .then((url) => {
      // Log completion message with the uploaded URL
      console.log(`${eventName} completed. Uploaded URL: ${url}`);
      
      // Emit a completion event with the uploaded URL to the client
      const completionUpdate = {
        event: `${eventName} Completed`,
        url,
      };
      req.app.io.emit('progress', completionUpdate); // Emit completion event to the client
    })
    .catch((error) => {
      console.error(`${eventName} failed:`, error);

      // Log failure message
      console.error(`${eventName} failed.`);
      
      // Emit an error event to the client
      const errorUpdate = {
        event: `${eventName} Failed`,
        error: 'Upload failed',
      };
      req.app.io.emit('progress', errorUpdate); // Emit error event to the client
    });

  // Log progress in real-time while the upload is in progress
  const progressInterval = setInterval(() => {
    if (lastProgress >= 100) {
      clearInterval(progressInterval);
      return;
    }

    // Simulate progress by increasing it at a constant rate
    lastProgress += 5; // Increase by 5% (you can adjust this as needed)

    // Log the progress in the terminal
    console.log(`${eventName} Progress: ${lastProgress}%`);
  }, 1000); // Adjust the interval as needed for your desired update frequency
}




// Function to get all courses
const getAllCourses = async (req, res) => {
  try {
    // Retrieve all courses from the 'courses' collection
    const coursesSnapshot = await coursesCollection.get();
    const courses = [];

    coursesSnapshot.forEach((doc) => {
      // Add each course to the courses array
      courses.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    res.status(200).json(courses);
  } catch (error) {
    console.error('Error getting courses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};




// Function to get a single course by ID
const getCourseById = async (req, res) => {
  try {
    const courseId = req.params.id; // Get the course ID from the request parameters

    // Retrieve the course with the specified ID from the 'courses' collection
    const courseDoc = await coursesCollection.doc(courseId).get();

    if (!courseDoc.exists) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Get the course data
    const courseData = courseDoc.data();

    res.status(200).json(courseData);
  } catch (error) {
    console.error('Error getting course by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ...




// Function to update a course
const updateCourse = async (req, res) => {
  try {
    upload.any()(req, res, async function (err) {
      if (err) {
        console.error('Error uploading files:', err);
        return res.status(400).json({ error: 'File upload failed' });
      }

      const courseId = req.params.id; // Get the course ID from the request parameters

      // Access form fields from req.body
      const { title, description, instructor, duration } = req.body;
      console.log(req.body);

      // Check if required fields are provided
      if (!title || !description || !instructor || !duration) {
        return res.status(400).json({ error: 'Required fields are missing.' });
      }

      // Initialize variables for file URLs
      let imageUrl = '';
      let videoUrl = '';
      let pdfUrl = '';

      // Handle uploaded files (if provided)
      if (req.files) {
        const imageFile = req.files.find((file) => file.fieldname === 'image');
        const videoFile = req.files.find((file) => file.fieldname === 'video');
        const pdfFile = req.files.find((file) => file.fieldname === 'pdf');

        // Upload the files to Firebase Storage
        const storage = admin.storage();
        const bucket = storage.bucket(); // Replace with your Firebase Storage bucket name

        if (imageFile) {
          const imageUploadPromise = uploadFile(imageFile, 'images', 'image.jpg', bucket);
          sendProgressUpdates(imageUploadPromise, 'Image Upload Progress', req);
          imageUrl = await imageUploadPromise;
        }
        if (videoFile) {
          const videoUploadPromise = uploadFile(videoFile, 'videos', 'video.mp4', bucket);
          sendProgressUpdates(videoUploadPromise, 'Video Upload Progress', req);
          videoUrl = await videoUploadPromise;
        }
        if (pdfFile) {
          const pdfUploadPromise = uploadFile(pdfFile, 'pdfs', 'syllabus.pdf', bucket);
          sendProgressUpdates(pdfUploadPromise, 'PDF Upload Progress', req);
          pdfUrl = await pdfUploadPromise;
        }
      }

      // Update the course document in the 'courses' collection
      const courseRef = coursesCollection.doc(courseId);

      // Update only the fields that are provided in the request
      const updatedCourseData = {
        ...(imageUrl && { image: imageUrl }),
        ...(videoUrl && { video: videoUrl }),
        ...(pdfUrl && { pdf: pdfUrl }),
        title,
        description,
        instructor,
        duration,
      };

      await courseRef.update(updatedCourseData);

      // Send the updated course data in the response
      const response = {
        message: 'Course updated successfully',
        courseId,
        ...updatedCourseData,
      };

      res.status(200).json(response);
    });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};




// Function to delete a course by ID
const deleteCourse = async (req, res) => {
  try {
    const courseId = req.params.id; // Get the course ID from the request parameters

    // Check if the course with the specified ID exists
    const courseDoc = await coursesCollection.doc(courseId).get();

    if (!courseDoc.exists) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Delete the course document from the 'courses' collection
    await coursesCollection.doc(courseId).delete();

    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { createCourse, getAllCourses, updateCourse,getCourseById,deleteCourse };



