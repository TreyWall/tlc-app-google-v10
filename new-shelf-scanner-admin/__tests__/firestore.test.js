// new-shelf-scanner-admin/__tests__/firestore.test.js
const firebase = require('@firebase/testing');
const fs = require('fs');

const projectId = 'shelf-scanner-test'; // Use a unique projectId for testing
const firebasePort = 8080; // Default Firestore emulator port
const coverageUrl = `http://localhost:${firebasePort}/emulator/v1/projects/${projectId}:ruleCoverage.html`;

// Load the security rules
const rules = fs.readFileSync('../firebase.rules', 'utf8');

// Helper function to get an authenticated Firestore instance
function authedApp(auth) {
  return firebase.initializeTestApp({
    projectId: projectId,
    auth: auth,
  }).firestore();
}

// Helper function to get an unauthenticated Firestore instance
function unauthedApp() {
  return firebase.initializeTestApp({
    projectId: projectId,
  }).firestore();
}

describe('Firestore Security Rules', () => {
  beforeAll(async () => {
    // Load the rules into the emulator
    await firebase.loadFirestoreRules({
      projectId: projectId,
      rules: rules,
    });
  });

  beforeEach(async () => {
    // Clear the database before each test
    await firebase.clearFirestoreData({
      projectId: projectId,
    });
  });

  afterAll(async () => {
    // Clean up firebase apps
    await Promise.all(firebase.apps().map(app => app.delete()));
    console.log(`View rule coverage at ${coverageUrl}`);
  });

  it('should deny unauthenticated reads to the users collection', async () => {
    const db = unauthedApp();
    const usersCollection = db.collection('users');
    await firebase.assertFails(usersCollection.get());
  });

  it('should allow authenticated users to read their own user document', async () => {
    const userId = 'user123';
    const db = authedApp({ uid: userId });
    const userDoc = db.collection('users').doc(userId);
    
    // Create the user document first (this would typically happen during signup)
    await authedApp({ uid: userId }).collection('users').doc(userId).set({ role: 'contractor' });

    await firebase.assertSucceeds(userDoc.get());
  });

  // Add more test cases for other rules and collections (jobs, reviews) and roles (admin, contractor)

});