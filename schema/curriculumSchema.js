// curriculumSchema.js
const { db } = require('../config');

const curriculumSchema = {
  id: String,
  tmsCreate: Number,
  tmsUpdate: Number,
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
          url: String,
        },
      ],
    },
  ],
};

const curriculumCollection = db.collection('curriculum');

module.exports = { curriculumSchema, curriculumCollection };
