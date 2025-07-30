// new-shelf-scanner-mobile/screens/login.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Dimensions, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { auth } from '../firebase';
import { theme } from '../../theme'; // Import the theme object (adjust path as needed)
import { useToast } from 'react-native-toast-notifications'; // Import useToast hook

const NewShelfScannerLoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({}); // State to manage validation errors
  const toast = useToast(); // Use the useToast hook

  const validateForm = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}$/i.test(email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      // Optionally, show a generic error toast for validation failure
      // toast.show('Please fix the errors in the form.', { type: 'warning' });
      return;
    }

    setLoading(true);
    try {
      await auth.signInWithEmailAndPassword(email, password);
      // Display success toast
      toast.show('Login successful!', { type: 'success' });
      // Navigate to the job list screen upon successful login
      navigation.navigate('JobList'); // Assuming 'JobList' is the name of your job list screen route
    } catch (error) {
      let errorMessage = 'An unknown error occurred.';
      // Provide more specific error messages based on Firebase Auth error codes
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No user found with this email.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address format.';
          break;
         case 'auth/too-many-requests':
          errorMessage = 'Too many login attempts. Please try again later.';
          break;
        // Add more cases for other common auth errors if needed
        default:
          errorMessage = `Login Failed: ${error.message}`; // Fallback to the original error message
      }
      // Display error toast with the specific message
      toast.show(errorMessage, { type: 'danger' });
      console.error('Admin login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('PasswordReset'); // Navigate to the Password Reset screen
  };

  const handleSignup = () => {
    navigation.navigate('Signup'); // Navigate to the Signup screen
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.innerContainer}> {/* Add an inner container */}
        <Text style={styles.title}>
          New Shelf Scanner Login
        </Text>
        <TextInput
          style={[styles.input, errors.email && styles.inputError]} // Apply error style
          placeholder="Email"
          onChangeText={(text) => {
            setEmail(text);
            // Clear email error when user starts typing
            if (errors.email) {
              setErrors({ ...errors, email: null });
            }
          }}
          value={email}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>} {/* Display error message */}

        <TextInput
          style={[styles.input, errors.password && styles.inputError, { marginBottom: theme.spacingReactNative.large }]} // Apply error style and adjusted margin bottom
          placeholder="Password"
          onChangeText={(text) => {
            setPassword(text);
            // Clear password error when user starts typing
             if (errors.password) {
                setErrors({ ...errors, password: null });
             }
          }}
          value={password}
          secureTextEntry
        />
         {errors.password && <Text style={styles.errorText}>{errors.password}</Text>} {/* Display error message */}

        <Button title={loading ? 'Logging in...' : 'Login'} onPress={handleLogin} disabled={loading} color={theme.colors.primary} />

        <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPasswordLink}>
           <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSignup} style={styles.signupLink}> {/* Added Signup Link */}
           <Text style={styles.signupText}>Don't have an account? Sign Up</Text>
        </TouchableOpacity>
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
    justifyContent: 'center',
    padding: theme.spacingReactNative.large,
  },
  title: {
    fontSize: theme.typography.h2.fontSize,
    marginBottom: theme.spacingReactNative.large,
    textAlign: 'center',
    fontWeight: theme.typography.h2.fontWeight,
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
   inputError: {
     borderColor: theme.colors.error, // Red border for error
   },
  errorText: {
    fontSize: theme.typography.body2.fontSize,
    color: theme.colors.error, // Red color for error text
    marginTop: -theme.spacingReactNative.small, // Adjust margin to position below input
    marginBottom: theme.spacingReactNative.small,
    paddingHorizontal: theme.spacingReactNative.small,
  },
  forgotPasswordLink: {
     marginTop: theme.spacingReactNative.medium,
     alignSelf: 'center',
  },
   forgotPasswordText: {
     fontSize: theme.typography.body2.fontSize,
     color: theme.colors.primary, // Use primary color for link
     textDecorationLine: 'underline',
   },
   signupLink: { // Added style for Signup Link
      marginTop: theme.spacingReactNative.small,
      alignSelf: 'center',
   },
   signupText: { // Added style for Signup Text
      fontSize: theme.typography.body2.fontSize,
      color: theme.colors.primary, // Use primary color for link
      textDecorationLine: 'underline',
   },
});

export default NewShelfScannerLoginScreen;