// new-shelf-scanner-mobile/screens/job list.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { firestore, auth } from '../firebase'; // Import auth to filter by contractorId
import { theme } from '../../theme'; // Import the theme object (adjust path as needed)
import { useToast } from 'react-native-toast-notifications'; // Import useToast hook

const NewShelfScannerJobListScreen = ({ navigation }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast(); // Use the useToast hook

  useEffect(() => {
    const currentUser = auth.currentUser; // Get the currently logged-in user

    if (!currentUser) {
      setError('User not logged in.');
      setLoading(false);
      return;
    }

    const contractorId = currentUser.uid; // Use the user's UID as contractorId

    // Set up real-time listener for jobs
    const unsubscribe = firestore.collection('jobs')
      .where('contractorId', '==', contractorId)
      .where('status', '==', 'assigned') // Listen to assigned jobs
      .orderBy('createdAt', 'asc')
      .onSnapshot(snapshot => {
        const jobsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setJobs(jobsData);
        setLoading(false); // Set loading to false once initial data is received
      }, err => {
        console.error('Error fetching real-time jobs:', err);
        let errorMessage = 'Failed to fetch jobs.';
        // Provide more specific error messages based on Firestore error codes
        switch (err.code) {
          case 'permission-denied':
            errorMessage = 'You do not have permission to view jobs.';
            break;
          case 'unavailable':
            errorMessage = 'Firestore is currently unavailable. Please try again later.';
            break;
          case 'internal':
            errorMessage = 'An internal error occurred while fetching jobs. Please try again.';
            break;
          // Add more cases for other common Firestore errors if needed
          default:
            errorMessage = `Failed to fetch jobs: ${err.message}`; // Fallback
        }
        setError(errorMessage);
        toast.show(errorMessage, { type: 'danger' });
        setLoading(false);
      });

    // Unsubscribe from listener when component unmounts
    return () => unsubscribe();
  }, [toast]); // Add toast as a dependency

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading jobs...</Text>
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

  const renderJobItem = ({ item }) => (
    <TouchableOpacity
      style={styles.jobItem}
      onPress={() => navigation.navigate('Instructions', { job: item })}
    >
      <Text style={styles.jobTitle}>{item.title}</Text>
      <Text style={styles.jobLocation}>{item.location}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Jobs</Text>
      {jobs.length > 0 ? (
        <FlatList
          data={jobs}
          renderItem={renderJobItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <Text style={styles.noJobsText}>No jobs available at the moment.</Text>
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
  jobItem: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacingReactNative.medium,
    marginBottom: theme.spacingReactNative.small,
    borderRadius: theme.shape.borderRadius,
    elevation: 3, // Increased elevation for more prominent shadow
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
  jobLocation: {
    fontSize: theme.typography.body2.fontSize,
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
  noJobsText: {
    textAlign: 'center',
    marginTop: theme.spacingReactNative.medium,
    fontSize: theme.typography.body1.fontSize,
    color: theme.colors.textSecondary,
  },
});

export default NewShelfScannerJobListScreen;