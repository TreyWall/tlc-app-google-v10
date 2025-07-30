// new-shelf-scanner-mobile/screens/camera.js
import React, { useState, useRef } from 'react';
import { View, Text, Button, StyleSheet, Dimensions, ActivityIndicator, Alert } from 'react-native';
import firebase from '../firebase'; // Import firebase for functions
import 'firebase/storage'; // Import firebase storage
import { theme } from '../../theme'; // Import the theme object (adjust path as needed)
import { useToast } from 'react-native-toast-notifications'; // Import useToast hook
// import { Camera } from 'react-native-camera'; // Import your chosen camera library

const NewShelfScannerCameraScreen = ({ route, navigation }) => {
  const { job } = route.params; // Get job data from navigation parameters
  const cameraRef = useRef(null);
  const [imageData, setImageData] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); // State for upload progress
  const toast = useToast(); // Use the useToast hook

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        // ** Replace with your camera library's take picture logic **
        // const options = { quality: 0.5, base64: true };
        // const data = await cameraRef.current.takePictureAsync(options);
        // setImageData(data.uri); // Store image URI or base64 data
        console.log('Picture taken (placeholder)');
        setImageData('placeholder_image_uri'); // Placeholder
        toast.show('Picture taken!', { type: 'success' }); // Optional: show success toast after taking picture
      } catch (error) {
        console.error('Error taking picture:', error);
        let errorMessage = 'Error taking picture.';
        // ** Add more specific error handling based on your camera library's error codes **
        // Example (replace with actual error code checks):
        // if (error.code === 'camera/permission-denied') {
        //   errorMessage = 'Camera permission denied. Please enable it in settings.';
        // } else {
        //   errorMessage = `Error taking picture: ${error.message}`;
        // }
        toast.show(errorMessage, { type: 'danger' });
      }
    }
  };

  const retakePicture = () => {
    setImageData(null);
    setUploadProgress(0); // Reset upload progress
    toast.show('Picture retaken.', { type: 'info' }); // Optional: show info toast
  };

  const handleProceedToAIReview = async () => {
    if (imageData) {
      setUploading(true);
      setUploadProgress(0); // Reset progress at the start of upload

      try {
        // 1. Upload image to Firebase Storage
        const storageRef = firebase.storage().ref();
        const imageName = `shelf_images/${job.id}/${Date.now()}.jpg`; // Unique image name
        const imageRef = storageRef.child(imageName);

        // Convert image URI to Blob (might require an extra library like react-native-blob-util)
        // For now, we'll use a placeholder. You'll need to implement this based on your camera library output.
        // const response = await fetch(imageData);
        // const blob = await response.blob();

        // Placeholder Blob for demonstration
        const blob = new Blob(['placeholder image data'], { type: 'image/jpeg' });

        const uploadTask = imageRef.put(blob);

        // Track upload progress
        uploadTask.on('state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
            console.log('Upload is ' + progress + '% done');
          },
          (error) => {
            console.error('Error uploading image:', error);
            setUploading(false);
            let errorMessage = 'Image upload failed.';
            // Provide more specific error messages based on Storage error codes
            switch (error.code) {
              case 'storage/canceled':
                errorMessage = 'Image upload was canceled.';
                break;
              case 'storage/unauthorized':
                errorMessage = 'You are not authorized to upload images.';
                break;
              case 'storage/bucket-not-found':
                errorMessage = 'Storage bucket not found.';
                break;
              // Add more cases for other common storage errors if needed
              default:
                errorMessage = `Image upload failed: ${error.message}`; // Fallback
            }
            toast.show(errorMessage, { type: 'danger' });
          },
          async () => {
            // Upload completed successfully, get the download URL
            try {
              const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
              console.log('File available at', downloadURL);

              // 2. Call Cloud Function with download URL
              const parseShelfImage = firebase.functions().httpsCallable('parseShelfImage');
              const result = await parseShelfImage({ imageUrl: downloadURL, jobId: job.id });

              toast.show('Image processed!', { type: 'success' });
              navigation.navigate('AIReview', { job, parsedData: result.data.parsedData, reviewId: result.data.reviewId });

            } catch (cfError) {
              console.error('Error calling Cloud Function:', cfError);
              let errorMessage = 'Failed to process image.';
              // Provide more specific error messages for Cloud Function errors
              if (cfError.code) {
                errorMessage = `Error processing image: ${cfError.message}`; // Callable function error with code/message
              } else {
                 errorMessage = `Error processing image: ${cfError.message}`; // Other errors
              }
              toast.show(errorMessage, { type: 'danger' });
            }
            finally {
              setUploading(false);
              setUploadProgress(0); // Reset progress on success or error
            }
          }
        );

      } catch (error) {
        console.error('Error in handleProceedToAIReview:', error);
        toast.show(`An error occurred: ${error.message}`, { type: 'danger' });
        setUploading(false);
        setUploadProgress(0); // Reset progress on error
      }
    } else {
      toast.show('Please take a picture first.', { type: 'warning' });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Take Picture for Job: {job.title}</Text>
      <View style={styles.cameraContainer}>
        {/* ** Integrate your camera component here ** */}
        {/* Example with react-native-camera: */}
        {/* <Camera
          ref={cameraRef}
          style={styles.preview}
          type={Camera.Constants.Type.back}
          flashMode={Camera.Constants.FlashMode.off}
          androidCameraPermissionOptions={{
            title: 'Permission to use camera',
            message: 'We need your permission to use your camera',
            buttonPositive: 'Ok',
            buttonNegative: 'Cancel',
          }}
        /> */}
        {!imageData && ( // Show placeholder only if no image is taken
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>Camera Preview Placeholder</Text>
          </View>
        )}
        {imageData && (
           // Display captured image preview (replace with Image component)
           <Text>Image Preview Placeholder</Text>
        )}
      </View>

      {/* Display upload progress */}
      {uploading && uploadProgress > 0 && (
        <View style={styles.progressBarContainer}>
          <Text style={styles.progressText}>Uploading: {uploadProgress.toFixed(0)}%</Text>
          {/* You can add a progress bar component here */}
          {/* Example: <ProgressBar progress={uploadProgress / 100} width={200} /> */}
        </View>
      )}

      {imageData ? (
        <View style={styles.buttonContainer}>
          {uploading ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <>
              <Button title="Retake Picture" onPress={retakePicture} color={theme.colors.secondary} />
              <Button title="Proceed to AI Review" onPress={handleProceedToAIReview} color={theme.colors.primary} />
            </>
          )}
        </View>
      ) : (
        <View style={styles.buttonContainer}>
          <Button title="Take Picture" onPress={takePicture} color={theme.colors.primary} />
        </View>
      )}
    </View>
  );
};

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacingReactNative.medium,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: theme.typography.h4.fontSize,
    marginBottom: theme.spacingReactNative.medium,
    textAlign: 'center',
    fontWeight: theme.typography.h4.fontWeight,
    color: theme.colors.textPrimary,
  },
  cameraContainer: {
    flex: 1,
    marginBottom: theme.spacingReactNative.medium,
    overflow: 'hidden', // Important for borderRadius on some platforms
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.colors.surface, // Use surface color for placeholder
    justifyContent: 'center',
    alignItems: 'center',
  },
  preview: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
     fontSize: theme.typography.body1.fontSize,
     color: theme.colors.textSecondary,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: theme.spacingReactNative.medium,
  },
   progressBarContainer: {
    marginTop: theme.spacingReactNative.medium,
    alignItems: 'center',
   },
    progressText: {
     fontSize: theme.typography.body2.fontSize,
     color: theme.colors.textPrimary,
    },
});

export default NewShelfScannerCameraScreen;