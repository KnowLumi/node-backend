// studentSchema.js


const { db } = require('../middlewares/authMiddleware');

// Define the schema for students
const studentSchema = {
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  photoUrl: String,
  interestedTopic: [String], // List of String
  accessibleCourses: [
    {
      courseId: String,
      accessId: String,
      referralId: String,
    },
  ],
  enrolledCourses: [
    {
      id: String,
      enrolledOn: Number,
    },
  ],
  wishlistedCourses: [String], // List of String
  refId: String, // This can be null
  tmsCreate: Number,
  tmsUpdate: Number,
};

const studentCollection = db.collection('students');
module.exports = { db, studentSchema,studentCollection };
