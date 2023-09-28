const { db } = require('../config');

// Define the schema for creators
const creatorSchema = {
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  about: String,
  employmentType: String,
  youtubeUrl: String,
  instagramUrl: String,
  linkedInUrl: String,
  websiteUrl: String,
  tmsCreate: Number,
  refId: String, // This can be null
  photoUrl: String, // URL to the uploaded photo
};

// Create a reference to the 'creators' collection
const creatorsCollection = db.collection('creators');

module.exports = { creatorSchema, creatorsCollection };
