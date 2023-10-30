const admin = require('firebase-admin');
const serviceAccount = require('../key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'knowlumi-app.appspot.com', // Replace with your Firebase Storage bucket name
  // Add other configuration options as needed
});

const db = admin.firestore();
const storage = admin.storage();

const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization header missing or invalid' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Verify the 'uid' claim to ensure the token is valid
    if (decodedToken.uid) {
      req.user = decodedToken;
      return next();
    }

    return res.status(401).json({ message: 'Unauthorized' });
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

module.exports = { db, storage, verifyFirebaseToken };
