// middlewares/uploadProgressMiddleware.js

const formidable = require('formidable');

const uploadProgressMiddleware = (req, res, next) => {
  // Create a new Formidable instance
  const form = new formidable.IncomingForm();

  // Set the upload directory
  form.uploadDir = './uploads';

  // Listen for the progress event
  form.on('progress', (event) => {
    // Calculate the upload progress
    const progress = (event.loaded / event.total) * 100;

    // Store the upload progress in the request object
    req.uploadProgress = progress;
  });

  // Parse the multipart form data
  form.parse(req, async (err, fields, files) => {
    // ...

    // Call the next middleware
    next();
  });
};

module.exports = uploadProgressMiddleware;