// schema/courseSchema.js

const { db } = require('../middlewares/authMiddleware');

const courseSchema = {
  id: String,
  isPublished: Number,
  creatorId: String,
  curriculumId: String,
  courseType: String,
  isPaid: Number,
  amount: Number,
  courseName: String,
  description: String,
  previewImageUrl: String,
  previewVideoUrl: String,
  syllabusPdfUrl: String,
  whatsappUrl: String,
  studentsEnrolled: Number,
  curriculumId: String,
  tmsCreate: Number,
  tmsUpdate: Number,
  // Add other fields as neede
};

const coursesCollection = db.collection('courses');

module.exports = { courseSchema, coursesCollection };