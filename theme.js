// theme.js

export const theme = {
  colors: {
    primary: '#FF5722', // Deep Orange (vibrant)
    secondary: '#4CAF50', // Green (complementary vibrant)
    accent: '#FFC107', // Amber (energetic accent)
    background: '#F5F5F5', // Light Grey background
    surface: '#FFFFFF', // White surface for cards, etc.
    error: '#F44336', // Red error color
    textPrimary: '#212121', // Dark text
    textSecondary: '#757575', // Grey text
  },
  typography: {
    fontFamily: 'Roboto, sans-serif', // Example font family
    h1: { fontSize: 32, fontWeight: 'bold' },
    h2: { fontSize: 28, fontWeight: 'bold' },
    h3: { fontSize: 24, fontWeight: 'bold' },
    body1: { fontSize: 16, lineHeight: 24 },
    body2: { fontSize: 14, lineHeight: 20 },
  },
  spacing: (factor) => `${8 * factor}px`, // Example spacing function (for web)
  // For React Native, spacing would typically be numbers
  spacingReactNative: {
     small: 8,
     medium: 16,
     large: 24,
     // Add more spacing values as needed
  },
  shape: {
    borderRadius: 8,
  },
};

// Example usage (Web - MUI):
// import { createTheme } from '@mui/material/styles';
// import { theme } from './theme';
// const muiTheme = createTheme({
//   palette: {
//     primary: { main: theme.colors.primary },
//     secondary: { main: theme.colors.secondary },
//     error: { main: theme.colors.error },
//     background: { default: theme.colors.background, paper: theme.colors.surface },
//     text: { primary: theme.colors.textPrimary, secondary: theme.colors.textSecondary },
//   },
//   typography: theme.typography,
//   spacing: 8, // MUI uses a spacing factor
//   shape: theme.shape,
// });

// Example usage (React Native):
// import { theme } from './theme';
// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: theme.colors.background,
//     padding: theme.spacingReactNative.medium,
//   },
// });