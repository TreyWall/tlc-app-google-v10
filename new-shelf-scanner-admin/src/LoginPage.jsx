// new-shelf-scanner-admin/src/LoginPage.jsx
import React, { useState } from 'react';
import { auth } from '../firebase'; // Assuming firebase initialization is in ../firebase.js or similar
import { TextField, Button, Typography, Container, Box, useTheme, Link } from '@mui/material';
import { useSnackbar } from 'notistack'; // Import useSnackbar hook

const LoginPage = () => {
  const theme = useTheme(); // Access the theme object
  const { enqueueSnackbar } = useSnackbar(); // Use the useSnackbar hook
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({}); // State to manage validation errors
  const [showResetForm, setShowResetForm] = useState(false); // State to toggle password reset form
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

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

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      // Optionally, show a generic error snackbar for validation failure
      // enqueueSnackbar('Please fix the errors in the form.', { variant: 'warning' });
      return;
    }

    setLoading(true);
    try {
      await auth.signInWithEmailAndPassword(email, password);
      // Display success notification
      enqueueSnackbar('Login successful!', { variant: 'success' });
      // TODO: Navigate to the admin dashboard (Job Queue Page) upon successful login
      console.log('Admin logged in!');
      // Example navigation (replace with your actual routing logic)
      // history.push('/job-queue');
    } catch (err) {
      console.error('Admin login failed:', err);
      let errorMessage = 'An unknown error occurred.';
      // Provide more specific error messages based on Firebase Auth error codes
      switch (err.code) {
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
          errorMessage = `Login Failed: ${err.message}`; // Fallback to the original error message
      }
      // Display error snackbar with the specific message
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSendPasswordReset = async () => {
     if (!resetEmail) {
         enqueueSnackbar('Please enter your email address.', { variant: 'warning' });
         return;
     }

    setResetLoading(true);
    try {
      await auth.sendPasswordResetEmail(resetEmail);
      enqueueSnackbar('Password reset email sent. Check your inbox.', { variant: 'success' });
      setShowResetForm(false); // Hide the form on success
      setResetEmail(''); // Clear the email field
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
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: theme.spacing(8),
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: theme.spacing(3),
          border: '1px solid #ccc',
          borderRadius: theme.shape.borderRadius,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Typography component="h1" variant="h5">
          Admin Login
        </Typography>

        {!showResetForm ? (
          // Login Form
          <Box component="form" onSubmit={handleLogin} noValidate sx={{ mt: theme.spacing(1) }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) {
                  setErrors({ ...errors, email: null });
                }
              }}
              error={!!errors.email}
              helperText={errors.email}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                 if (errors.password) {
                    setErrors({ ...errors, password: null });
                 }
              }}
              error={!!errors.password}
              helperText={errors.password}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: theme.spacing(3),
                mb: theme.spacing(2),
                '&:active': {
                  backgroundColor: theme.palette.primary.dark,
                },
              }}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
            <Link component="button" variant="body2" onClick={() => setShowResetForm(true)} sx={{ alignSelf: 'center' }}>
              Forgot Password?
            </Link>
          </Box>
        ) : (
          // Password Reset Form
          <Box sx={{ mt: theme.spacing(1), width: '100%' }}>
             <Typography variant="h6" gutterBottom>Reset Your Password</Typography>
             <TextField
                margin="normal"
                required
                fullWidth
                id="reset-email"
                label="Email Address"
                name="reset-email"
                autoComplete="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
             />
              <Button
                fullWidth
                variant="contained"
                sx={{ mt: theme.spacing(2), mb: theme.spacing(1) }}
                onClick={handleSendPasswordReset}
                disabled={resetLoading}
              >
                {resetLoading ? 'Sending...' : 'Send Reset Email'}
              </Button>
               <Link component="button" variant="body2" onClick={() => setShowResetForm(false)} sx={{ alignSelf: 'center' }}>
                 Back to Login
               </Link>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default LoginPage;