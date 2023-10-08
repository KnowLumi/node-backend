const { creatorsCollection } = require('../schema/creatorSchema');
const multer = require('multer');
const admin = require('firebase-admin');



const storageMulter = multer.memoryStorage();
const upload = multer({ storage: storageMulter }).single('photo');

const createCreator = async (req, res) => {
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
            refId,
          } = req.body;
           console.log(req.body);
          // Create a new creator document using the updated schema
          const newCreator = {
      
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
            refId,
            photoUrl, // Add the photo URL here
            tmsCreate: Date.now(), // Add the current timestamp for tmsCreate
            tmsUpdate: Date.now(), // Add the current timestamp for tmsUpdate
          };

          // Add the new creator document to the 'creators' collection
          const creatorRef = await creatorsCollection.add(newCreator);

          res.status(201).json({ message: 'Creator created successfully', id: creatorRef.id });
        });

        // Pipe the file buffer to the storage stream
        stream.end(uploadedFile.buffer);
      } else {
        res.status(400).json({ error: 'No image file uploaded' });
      }
    });
  } catch (error) {
    console.error('Error creating creator:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllCreators = async (req, res) => {
  try {
    const creatorsSnapshot = await creatorsCollection.get();
    const creators = [];

    creatorsSnapshot.forEach((doc) => {
      const creatorData = doc.data();
      creators.push({
        idd: doc.id,
        ...creatorData,
      });
    });

    res.status(200).json({ creators });
  } catch (error) {
    console.error('Error getting creators:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateCreatorss = async (req, res) => {
  try {
    upload(req, res, async function (err) {
      if (err) {
        console.error('Error parsing form data:', err);
        return res.status(400).json({ error: 'Form data parsing failed' });
      }

      const id = req.params.id;
      const data = req.body;

      // Check if a file has been uploaded
      if (req.file) {
        const uploadedFile = req.file;
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
            const creatorDoc = await creatorsCollection.doc(id).get();
            console.log(creatorDoc);

            // Check if the data contains at least one field to update
            if (Object.keys(data).length === 0) {
              return res.status(400).json({ error: 'At least one field must be updated' });
            }

            // Update the creator document with the provided data
            await creatorDoc.ref.update(data);

            res.send('Success');
          } catch (error) {
            console.error('Error updating creator:', error);
            res.status(400).send(error);
          }
        });

        // Pipe the file buffer to the storage stream
        stream.end(uploadedFile.buffer);
      } else {
        // No new photo has been uploaded, proceed to update other fields
        try {
          const creatorDoc = await creatorsCollection.doc(id).get();
          console.log(creatorDoc);

          // Check if the data contains at least one field to update
          if (Object.keys(data).length === 0) {
            return res.status(400).json({ error: 'At least one field must be updated' });
          }

          // Update the creator document with the provided data
          await creatorDoc.ref.update(data);

          res.send('Success');
        } catch (error) {
          console.error('Error updating creator:', error);
          res.status(400).send(error);
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};


//delete creator by id 

const deleteCreator = async (req, res) => {
  try {
    const id = req.params.id;
    const creatorDoc = await creatorsCollection.doc(id).get();

    if (!creatorDoc.exists) {
      return res.status(404).json({ error: 'Creator not found' });
    }

    await creatorDoc.ref.delete();
    res.status(200).json({ message: 'Creator deleted successfully' });
  } catch (error) {
    console.error('Error deleting creator:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Function to get a creator by ID
const getCreatorById = async (req, res) => {
  try {
    const creatorId = req.params.id; // Get the creator ID from the request parameters

    // Query Firestore to get the creator document by ID
    const creatorDoc = await creatorsCollection.doc(creatorId).get();

    // Check if the creator document exists
    if (!creatorDoc.exists) {
      return res.status(404).json({ error: 'Creator not found' });
    }

    // Extract the creator data from the document
    const creatorData = creatorDoc.data();

    // Respond with the creator data
    res.status(200).json({ creator: { id: creatorDoc.id, ...creatorData } });
  } catch (error) {
    console.error('Error getting creator by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


module.exports = { createCreator ,getAllCreators,updateCreatorss,deleteCreator,getCreatorById};