// new-shelf-scanner-mobile/screens/SignupScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { auth, firestore } from '../firebase'; // Import auth and firestore
import { theme } from '../../theme';
import { useToast } from 'react-native-toast-notifications';

const NewShelfScannerSignupScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // State for contractor name
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({}); // State to manage validation errors
  const toast = useToast();

  const validateForm = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}$/i.test(email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) { // Basic password length validation
       newErrors.password = 'Password must be at least 6 characters.';
    }
     if (!name) {
       newErrors.name = 'Name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) {
      // Optionally, show a generic error toast for validation failure
      // toast.show('Please fix the errors in the form.', { type: 'warning' });
      return;
    }

    setLoading(true);
    try {
      // 1. Create Firebase Authentication user
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // 2. Store additional user information in Firestore
      await firestore.collection('users').doc(user.uid).set({
        name: name,
        email: email, // Store email for easy lookup
        role: 'contractor', // Assign default role
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      toast.show('Signup successful!', { type: 'success' });
      // Optionally navigate to a confirmation screen or directly to job list
      navigation.navigate('JobList'); // Navigate to Job List after signup
    } catch (err) {
      console.error('Signup error:', err);
      let errorMessage = 'An unknown error occurred.';
      // Provide more specific error messages based on Firebase Auth error codes
      switch (err.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'The email address is already in use.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address format.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password signup is not enabled.'; // Ensure email/password sign-in is enabled in Firebase console
          break;
        case 'auth/weak-password':
           errorMessage = 'Password is too weak.';
           break;
        // Add more cases for other common auth errors if needed
        default:
          errorMessage = `Signup failed: ${err.message}`; // Fallback
      }
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
        <Text style={styles.title}>Contractor Signup</Text>

        <TextInput
          style={[styles.input, errors.name && styles.inputError]}
          placeholder="Name"
          onChangeText={(text) => {
            setName(text);
            if (errors.name) { setErrors({ ...errors, name: null }); }
          }}
          value={name}
          autoCapitalize="words"
        />
         {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          placeholder="Email"
          onChangeText={(text) => {
            setEmail(text);
            if (errors.email) { setErrors({ ...errors, email: null }); }
          }}
          value={email}
          keyboardType="email-address"
          autoCapitalize="none"
        />
         {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

        <TextInput
          style={[styles.input, errors.password && styles.inputError, { marginBottom: theme.spacingReactNative.large }]} // Adjusted margin bottom
          placeholder="Password"
          onChangeText={(text) => {
            setPassword(text);
             if (errors.password) { setErrors({ ...errors, password: null }); }
          }}
          value={password}
          secureTextEntry
        />
         {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

        <Button
          title={loading ? 'Signing Up...' : 'Sign Up'}
          onPress={handleSignup}
          disabled={loading}
          color={theme.colors.primary}
        />
         <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginLink}>
           <Text style={styles.loginText}>Already have an account? Login</Text>
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
   inputError: {
     borderColor: theme.colors.error, // Red border for error
   },
  errorText: {
    fontSize: theme.typography.body2.fontSize,
    color: theme.colors.error,
    marginTop: -theme.spacingReactNative.small,
    marginBottom: theme.spacingReactNative.small,
    paddingHorizontal: theme.spacingReactNative.small,
  },
   loginLink: {
      marginTop: theme.spacingReactNative.medium,
      alignSelf: 'center',
   },
    loginText: {
     fontSize: theme.typography.body2.fontSize,
     color: theme.colors.primary,
     textDecorationLine: 'underline',
    }
});

export default NewShelfScannerSignupScreen;
