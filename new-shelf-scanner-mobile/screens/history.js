// new-shelf-scanner-mobile/screens/history.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { firestore, auth } from '../firebase'; // Import auth to get current user
import { theme } from '../../theme'; // Import the theme object (adjust path as needed)
import { useToast } from 'react-native-toast-notifications'; // Import useToast hook

const NewShelfScannerHistoryScreen = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast(); // Use the useToast hook

  useEffect(() => {
    const fetchHistory = async () => {
      const currentUser = auth.currentUser; // Get the currently logged-in user

      if (!currentUser) {
        setError('User not logged in.');
        setLoading(false);
        // Optionally, show a toast indicating the user needs to log in
        // toast.show('Please log in to view your history.', { type: 'info' });
        return;
      }

      const contractorId = currentUser.uid; // Use the user's UID as contractorId

      try {
        // Fetch reviews for the logged-in contractor
        const historyCollection = await firestore.collection('reviews')
          .where('status', '==', 'reviewed')
          .where('contractorId', '==', contractorId) // Filter by contractorId
          .orderBy('timestamp', 'desc') // Order by timestamp (most recent first)
          .get();

        const historyData = historyCollection.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Fetch job details for each review
        const historyWithJobDetails = await Promise.all(historyData.map(async (review) => {
          if (review.jobId) {
            const jobDoc = await firestore.collection('jobs').doc(review.jobId).get();
            return { ...review, jobTitle: jobDoc.exists ? jobDoc.data().title : 'Unknown Job' };
          } else {
            return { ...review, jobTitle: 'Unknown Job' };
          }
        }));

        setHistory(historyWithJobDetails);
      } catch (err) {
        console.error('Error fetching history:', err);
        let errorMessage = 'Failed to fetch history.';
        // Provide more specific error messages based on Firestore error codes
        switch (err.code) {
          case 'permission-denied':
            errorMessage = 'You do not have permission to view your history.';
            break;
          case 'unavailable':
            errorMessage = 'Firestore is currently unavailable. Please try again later.';
            break;
          case 'internal':
            errorMessage = 'An internal error occurred while fetching history. Please try again.';
            break;
          // Add more cases for other common Firestore errors if needed
          default:
            errorMessage = `Failed to fetch history: ${err.message}`; // Fallback
        }
        setError(errorMessage);
        toast.show(errorMessage, { type: 'danger' });
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [toast]); // Add toast as a dependency

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading history...</Text>
      </View>
    );
  }

  if (error && !loading) { // Only display error text if not loading
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const renderHistoryItem = ({ item }) => (
    <View style={styles.historyItem}>
      <Text style={styles.jobTitle}>{item.jobTitle}</Text>
      {item.timestamp && (
         <Text style={styles.reviewDate}>Submitted: {item.timestamp.toDate().toDateString()}</Text>
      )}
      {/* Display a summary of the reviewed data */}
      {item.reviewedData && item.reviewedData.products && (
        <View style={styles.productsSummary}>
          <Text style={styles.productsSummaryTitle}>Products:</Text>
          {item.reviewedData.products.map((product, index) => (
            <Text key={index} style={styles.productText}>- {product.name}: {product.quantity}</Text>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Job History</Text>
      {history.length > 0 ? (
        <FlatList
          data={history}
          renderItem={renderHistoryItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <Text style={styles.noHistoryText}>No history available.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacingReactNative.medium,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: theme.typography.h3.fontSize,
    marginBottom: theme.spacingReactNative.medium,
    textAlign: 'center',
    fontWeight: theme.typography.h3.fontWeight,
    color: theme.colors.textPrimary,
  },
   listContent: {
    paddingBottom: theme.spacingReactNative.medium, // Add some padding at the bottom of the list
  },
  historyItem: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacingReactNative.medium,
    marginBottom: theme.spacingReactNative.small,
    borderRadius: theme.shape.borderRadius,
    elevation: 3, // Consistent elevation
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  jobTitle: {
    fontSize: theme.typography.body1.fontSize,
    fontWeight: theme.typography.body1.fontWeight,
    marginBottom: theme.spacingReactNative.small / 2,
    color: theme.colors.primary, // Using primary color for job title
  },
  reviewDate: {
    fontSize: theme.typography.body2.fontSize,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacingReactNative.small,
  },
  productsSummary: {
    marginTop: theme.spacingReactNative.medium,
    borderTopWidth: 1,
    borderColor: theme.colors.textSecondary, // Using a theme color for border
    paddingTop: theme.spacingReactNative.medium,
  },
   productsSummaryTitle: {
      fontSize: theme.typography.body1.fontSize,
      fontWeight: theme.typography.body1.fontWeight,
      marginBottom: theme.spacingReactNative.small / 2,
      color: theme.colors.textPrimary,
   },
  productText: {
    fontSize: theme.typography.body2.fontSize,
    marginBottom: theme.spacingReactNative.small / 2,
    color: theme.colors.textSecondary,
  },
   loadingText: {
    textAlign: 'center',
    marginTop: theme.spacingReactNative.medium,
    fontSize: theme.typography.body1.fontSize,
    color: theme.colors.textPrimary,
  },
  errorText: {
    textAlign: 'center',
    marginTop: theme.spacingReactNative.medium,
    fontSize: theme.typography.body1.fontSize,
    color: theme.colors.error,
  },
  noHistoryText: {
    textAlign: 'center',
    marginTop: theme.spacingReactNative.medium,
    fontSize: theme.typography.body1.fontSize,
    color: theme.colors.textSecondary,
  },
});

export default NewShelfScannerHistoryScreen;