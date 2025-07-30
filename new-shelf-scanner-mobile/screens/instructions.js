// new-shelf-scanner-mobile/screens/instructions.js
import React from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import { theme } from '../../theme'; // Import the theme object (adjust path as needed)

const NewShelfScannerInstructionsScreen = ({ route, navigation }) => {
  const { job } = route.params; // Get job data from navigation parameters

  const handleProceedToCamera = () => {
    navigation.navigate('Camera', { job }); // Navigate to Camera screen, passing job data
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Instructions for Job: {job.title}</Text>
      <ScrollView style={styles.instructionsContainer}>
        <Text style={styles.instructionsText}>{job.instructions}</Text>
      </ScrollView>
      <View style={styles.buttonContainer}>
        <Button title="Proceed to Camera" onPress={handleProceedToCamera} color={theme.colors.primary} />
      </View>
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
    fontSize: theme.typography.h4.fontSize,
    marginBottom: theme.spacingReactNative.medium,
    textAlign: 'center',
    fontWeight: theme.typography.h4.fontWeight,
    color: theme.colors.textPrimary,
  },
  instructionsContainer: {
    flex: 1,
    marginBottom: theme.spacingReactNative.large,
    padding: theme.spacingReactNative.medium,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.shape.borderRadius,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  instructionsText: {
    fontSize: theme.typography.body1.fontSize,
    lineHeight: theme.typography.body1.lineHeight,
    color: theme.colors.textSecondary,
  },
  buttonContainer: {
    marginTop: theme.spacingReactNative.medium,
  },
});

export default NewShelfScannerInstructionsScreen;