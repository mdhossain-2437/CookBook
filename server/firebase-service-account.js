/**
 * Firebase Admin SDK Configuration
 * 
 * This file initializes the Firebase Admin SDK with environment variables
 * instead of a service account JSON file for better security.
 */

const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin SDK
const initializeFirebaseAdmin = () => {
  // Check if already initialized
  if (admin.apps.length) return admin;

  // Initialize with environment variables
  const app = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Replace \n with actual newlines in the private key
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });

  return app;
};

module.exports = { admin, initializeFirebaseAdmin };