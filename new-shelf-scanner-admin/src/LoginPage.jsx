// new-shelf-scanner-admin/src/LoginPage.jsx
import React, { useState } from 'react';
import { auth } from '../firebase'; // Assuming firebase initialization is in ../firebase.js or similar
import { TextField, Button, Typography, Container, Box, useTheme } from '@mui/material';
import { useSnackbar } from 'notistack'; // Import useSnackbar hook

const LoginPage = () => {
  const theme = useTheme(); // Access the theme object
  const { enqueueSnackbar } = useSnackbar(); // Use the useSnackbar hook
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({}); // State to manage validation errors

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
      // Display error notification
      enqueueSnackbar(`Login Failed: ${err.message}`, { variant: 'error' });
      console.error('Admin login failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: theme.spacing(8), // Use theme spacing
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: theme.spacing(3), // Use theme spacing
          border: '1px solid #ccc', // Keep border for now, can be themed
          borderRadius: theme.shape.borderRadius, // Use theme border radius
          backgroundColor: theme.palette.background.paper, // Use theme surface color
        }}
      >
        <Typography component="h1" variant="h5">
          Admin Login
        </Typography>
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
              // Clear email error when user starts typing
              if (errors.email) {
                setErrors({ ...errors, email: null });
              }
            }}
            error={!!errors.email} // Set error prop based on errors state
            helperText={errors.email} // Display error message
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
               // Clear password error when user starts typing
              if (errors.password) {
                 setErrors({ ...errors, password: null });
              }
            }}
            error={!!errors.password} // Set error prop based on errors state
            helperText={errors.password} // Display error message
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: theme.spacing(3),
              mb: theme.spacing(2),
              '&:active': { // Style for active state
                backgroundColor: theme.palette.primary.dark, // Darker shade on press
              },
            }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;