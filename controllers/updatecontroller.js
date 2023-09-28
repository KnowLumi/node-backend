const { creatorsCollection } = require('../schema/creatorSchema');
const multer = require('multer');
const admin = require('firebase-admin');

const storageMulter = multer.memoryStorage();
const upload = multer({ storage: storageMulter }).single('photo');

const updateCreator = async (req, res) => {
  try {
    upload(req, res, async function (err) {
      if (err) {
        console.error('Error uploading image:', err);
        return res.status(400).json({ error: 'Image upload failed' });
      }

      if (req.file) {
        const uploadedFile = req.file;
        const bucket = admin.storage().bucket('knowlumi-app.appspot.com');

        // Your code for uploading and generating photoUrl here...

        const { id } = req.body; // Get the ID from the request

        // Check if the document with the given ID exists
        const creatorDoc = await creatorsCollection.doc(id).get();

        if (!creatorDoc.exists) {
          console.error(`Creator with ID ${id} not found.`);
          return res.status(404).json({ error: 'Creator not found' });
        }

        // Continue with the update
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
            firstName,
            lastName,
            email,
            phone,
            about,
            employmentType,
            youtubeUrl,
            instagramUrl,
            linkedInUrl,
            websiteUrl,
            tmsCreate,
            refId,
          } = req.body;

          // Create an update object with the new data
          const updateData = {
            firstName,
            lastName,
            email,
            phone,
            about,
            employmentType,
            youtubeUrl,
            instagramUrl,
            linkedInUrl,
            websiteUrl,
            tmsCreate,
            refId,
            photoUrl, // Add the photo URL here
          };

          // Update the creator document in Firestore
          await creatorsCollection.doc(id).update(updateData);

          res.status(200).json({ message: 'Creator updated successfully' });
        });

        // Pipe the file buffer to the storage stream
        stream.end(uploadedFile.buffer);
      } else {
        res.status(400).json({ error: 'No image file uploaded' });
      }
    });
  } catch (error) {
    console.error('Error updating creator:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { updateCreator };



