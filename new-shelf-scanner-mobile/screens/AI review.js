// new-shelf-scanner-mobile/screens/AI review.js
import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, FlatList, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { firestore } from '../firebase';
import { theme } from '../../theme'; // Import the theme object (adjust path as needed)
import { useToast } from 'react-native-toast-notifications'; // Import useToast hook

const NewShelfScannerAIReviewScreen = ({ route, navigation }) => {
  const { job, parsedData, reviewId } = route.params; // Get job data, parsed data, and reviewId
  const [reviewedData, setReviewedData] = useState(parsedData);
  const [submitting, setSubmitting] = useState(false);
  const [currentReviewId] = useState(reviewId); // Use reviewId from params
  const toast = useToast(); // Use the useToast hook

  // If you navigate back to this screen or need to fetch the latest review data,
  // you might use this useEffect to fetch the review document by ID.
  // useEffect(() => {
  //   const fetchReview = async () => {
  //     if (currentReviewId) {
  //       try {
  //         const reviewDoc = await firestore.collection('reviews').doc(currentReviewId).get();
  //         if (reviewDoc.exists) {
  //           setReviewedData(reviewDoc.data().parsedData); // Assuming parsedData is a field in the document
  //         } else {
  //           console.warn('Review document not found:', currentReviewId);
  //           // Handle the case where the review document doesn't exist
  //           toast.show('Review not found.', { type: 'danger' });
  //         }
  //       } catch (error) {
  //         console.error('Error fetching review:', error);
  //         toast.show(`Error fetching review: ${error.message}`, { type: 'danger' });
  //       }
  //     }
  //   };
  //   fetchReview();
  // }, [currentReviewId]);

  const handleProductChange = (index, field, value) => {
    const newProducts = [...reviewedData.products];
    newProducts[index][field] = value;
    setReviewedData({ ...reviewedData, products: newProducts });
  };

  const handleSubmitReview = async () => {
    if (!currentReviewId) {
      toast.show('Review ID is missing.', { type: 'danger' });
      return;
    }

    setSubmitting(true);
    try {
      // Update the existing review document using the reviewId
      const reviewDocRef = firestore.collection('reviews').doc(currentReviewId);
      await reviewDocRef.update({
        reviewedData: reviewedData,
        status: 'reviewed', // Update status to 'reviewed'
        // Add other fields to update if necessary
      });

      toast.show('Review submitted successfully!', { type: 'success' });
      navigation.navigate('History'); // Navigate to History screen
    } catch (error) {
      console.error('Error submitting review:', error);
      let errorMessage = 'Failed to submit review.';
      // Provide more specific error messages based on Firestore error codes
      switch (error.code) {
        case 'permission-denied':
          errorMessage = 'You do not have permission to submit reviews.';
          break;
        case 'unavailable':
          errorMessage = 'Firestore is currently unavailable. Please try again later.';
          break;
        case 'internal':
          errorMessage = 'An internal error occurred while submitting the review. Please try again.';
          break;
        case 'not-found':
          errorMessage = 'The review document was not found.';
          break;
        // Add more cases for other common Firestore errors if needed
        default:
          errorMessage = `Failed to submit review: ${error.message}`; // Fallback
      }
      toast.show(errorMessage, { type: 'danger' });
    } finally {
      setSubmitting(false);
    }
  };

  const renderProductItem = ({ item, index }) => (
    <View style={styles.productItem}>
      <TextInput
        style={styles.productNameInput}
        value={item.name}
        onChangeText={(text) => handleProductChange(index, 'name', text)}
        placeholder="Product Name"
      />
      <TextInput
        style={styles.productQuantityInput}
        value={String(item.quantity)}
        onChangeText={(text) => handleProductChange(index, 'quantity', parseInt(text, 10) || 0)}
        placeholder="Quantity"
        keyboardType="number-pad"
      />
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.innerContainer}> {/* Add an inner container */}
        <Text style={styles.title}>Review for Job: {job.title}</Text>
        <Text style={styles.subtitle}>Parsed Data:</Text>

        {reviewedData && reviewedData.products && reviewedData.products.length > 0 ? (
          <FlatList
            data={reviewedData.products}
            renderItem={renderProductItem}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <Text style={styles.noDataText}>No product data parsed.</Text>
        )}

        <View style={styles.buttonContainer}>
           <Button
            title={submitting ? 'Submitting...' : 'Submit Review'}
            onPress={handleSubmitReview}
            disabled={submitting}
            color={theme.colors.primary}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
   innerContainer: { // Style for the inner container
    flex: 1,
    padding: theme.spacingReactNative.medium,
   },
  title: {
    fontSize: theme.typography.h4.fontSize,
    marginBottom: theme.spacingReactNative.medium,
    textAlign: 'center',
    fontWeight: theme.typography.h4.fontWeight,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: theme.typography.body1.fontSize,
    marginBottom: theme.spacingReactNative.small,
    fontWeight: theme.typography.body1.fontWeight,
    color: theme.colors.textSecondary,
  },
  listContent: {
     paddingBottom: theme.spacingReactNative.medium, // Add padding at the bottom of the list
  },
  productItem: {
    flexDirection: 'row',
    marginBottom: theme.spacingReactNative.small,
    padding: theme.spacingReactNative.small,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.shape.borderRadius,
    elevation: 2, // Consistent elevation
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  productNameInput: {
    flex: 2,
    borderBottomWidth: 1,
    borderColor: theme.colors.textSecondary,
    marginRight: theme.spacingReactNative.small,
    paddingHorizontal: theme.spacingReactNative.small / 2,
    fontSize: theme.typography.body1.fontSize,
  },
  productQuantityInput: {
    flex: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.textSecondary,
    paddingHorizontal: theme.spacingReactNative.small / 2,
    fontSize: theme.typography.body1.fontSize,
  },
  buttonContainer: {
     marginTop: theme.spacingReactNative.medium,
  },
  noDataText: {
     textAlign: 'center',
     marginTop: theme.spacingReactNative.medium,
     fontSize: theme.typography.body1.fontSize,
     color: theme.colors.textSecondary,
  }
});

export default NewShelfScannerAIReviewScreen;