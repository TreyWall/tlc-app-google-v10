// new-shelf-scanner-mobile/screens/PasswordResetScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { auth } from '../firebase';
import { theme } from '../../theme';
import { useToast } from 'react-native-toast-notifications';

const NewShelfScannerPasswordResetScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  const handlePasswordReset = async () => {
    if (!email) {
      // Basic validation
      setError('Email is required');
      toast.show('Please enter your email address.', { type: 'warning' });
      return;
    }

    setLoading(true);
    setError(null); // Clear previous errors

    try {
      await auth.sendPasswordResetEmail(email);
      toast.show('Password reset email sent. Check your inbox.', { type: 'success' });
      // Optionally navigate back to login after a delay or on user action
      // navigation.navigate('Login');
    } catch (err) {
      console.error('Password reset error:', err);
      let errorMessage = 'Failed to send password reset email.';
      // Provide more specific error messages based on Firebase Auth error codes
      switch (err.code) {
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address format.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No user found with this email address.';
          break;
        // Add more cases for other common auth errors if needed
        default:
          errorMessage = `Failed to send reset email: ${err.message}`; // Fallback
      }
      setError(errorMessage);
      toast.show(errorMessage, { type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Reset Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          onChangeText={setEmail}
          value={email}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {error && <Text style={styles.errorText}>{error}</Text>}
        <Button
          title={loading ? 'Sending...' : 'Send Reset Email'}
          onPress={handlePasswordReset}
          disabled={loading}
          color={theme.colors.primary}
        />
         {/* Optionally add a button to navigate back to login */}
          <Button
            title="Back to Login"
            onPress={() => navigation.navigate('Login')}
            color="#cccccc" // A neutral color for a secondary action button
            disabled={loading}
          />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
   innerContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacingReactNative.large,
   },
  title: {
    fontSize: theme.typography.h4.fontSize,
    marginBottom: theme.spacingReactNative.large,
    textAlign: 'center',
    fontWeight: theme.typography.h4.fontWeight,
    color: theme.colors.textPrimary,
  },
  input: {
    height: 50,
    borderColor: theme.colors.textSecondary,
    borderWidth: 1,
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacingReactNative.medium,
    paddingHorizontal: theme.spacingReactNative.small,
    backgroundColor: theme.colors.surface,
    fontSize: theme.typography.body1.fontSize,
  },
  errorText: {
    fontSize: theme.typography.body2.fontSize,
    color: theme.colors.error,
    marginBottom: theme.spacingReactNative.medium,
    textAlign: 'center',
  },
});

export default NewShelfScannerPasswordResetScreen;
