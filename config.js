const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'knowlumi-app.appspot.com', // Replace with your Firebase Storage bucket name
  // Add other configuration options as needed
});

const db = admin.firestore();
const storage = admin.storage();

module.exports = { db, storage };
