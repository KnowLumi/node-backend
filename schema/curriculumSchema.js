const { db } = require('../middlewares/authMiddleware');

const curriculumSchema = {
  id: String,
  tmsCreate: Number,
  tmsUpdate: Number,
  courseId: String,  // Add a courseId property to relate the curriculum to a specific course
  title: String,
  subtitle: String,
  sections: [
    {
      templateId: Number,
      title: String,
      subtitle: String,
      lessons: [
        {
          order: Number,
          title: String,
          description: String,
          contentType: String, // video, image, pdf
          url: String, // URL to the file (optional)
        },
      ],
    },
  ],
};

const curriculumCollection = db.collection('curriculum');

module.exports = { curriculumSchema, curriculumCollection };
