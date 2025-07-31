// new-shelf-scanner-functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const vision = require('@google-cloud/vision');
const client = new vision.ImageAnnotatorClient();

exports.parseShelfImage = functions.https.onCallable(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const imageUrl = data.imageUrl;
  const jobId = data.jobId;
  const contractorId = context.auth.uid; // Get contractor ID from authentication context

  if (!imageUrl || !jobId || !contractorId) {
    throw new functions.https.HttpsError('invalid-argument', 'imageUrl, jobId, and authenticated user are required.');
  }

  try {
    // Call Google Vision API for text detection
    const [result] = await client.textDetection(imageUrl);
    const detections = result.textAnnotations;
    const fullText = detections && detections.length > 0 ? detections[0].description : '';

    // ** Improved Placeholder Parsing Logic **
    // This is still a basic example. A robust solution would need more sophisticated logic
    // potentially combining OCR with object detection and more complex text processing.
    const parsedData = { products: [] };
    const lines = fullText.split(`\n`).filter(line => line.trim() !== '');

    lines.forEach(line => {
      // Attempt to find a quantity number at the end of the line
      const quantityMatch = line.match(/s(d+)$/);
      let name = line.trim();
      let quantity = 0;

      if (quantityMatch && quantityMatch[1]) {
        quantity = parseInt(quantityMatch[1], 10);
        name = line.substring(0, quantityMatch.index).trim(); // Extract name before the quantity
      }

       if (name) { // Only add if a product name is found
         parsedData.products.push({ name, quantity });
       }
    });
    // ** End Improved Placeholder Parsing Logic **

    // Store parsed results in Firestore
    const newReviewRef = await admin.firestore().collection('reviews').add({
      jobId: jobId,
      contractorId: contractorId, // Store contractor ID
      parsedData: parsedData,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      status: 'pending', // Initial status
      imageUrl: imageUrl, // Store image URL for reference
      // Add other relevant fields
    });

    // Return parsed data and the new review ID to the mobile app
    return { parsedData: parsedData, reviewId: newReviewRef.id };

  } catch (error) {
    console.error('Error processing image:', error);
    throw new functions.https.HttpsError('internal', 'Error processing image.', error.message);
  }
});
