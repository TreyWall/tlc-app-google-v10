// new-shelf-scanner-admin/src/ReportsDashboard.jsx
import React, { useEffect, useState } from 'react';
import { firestore } from '../firebase'; // Assuming firebase initialization is in ../firebase.js or similar
// import { functions } from '../firebase'; // Import firebase functions if using callable function for export
import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  CircularProgress,
  Alert,
  useTheme,
} from '@mui/material';
import { useSnackbar } from 'notistack'; // Import useSnackbar hook

const ReportsDashboard = () => {
  const theme = useTheme(); // Access the theme object
  const { enqueueSnackbar } = useSnackbar(); // Use the useSnackbar hook
  const [completedReviews, setCompletedReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Set up real-time listener for completed reviews
    const unsubscribeReviews = firestore.collection('reviews')
      .where('status', 'in', ['reviewed', 'admin_reviewed']) // Listen to completed reviews
      .orderBy('timestamp', 'desc')
      .onSnapshot(async snapshot => { // Use async here to await inner promises
        const reviewsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

         // Fetch associated job and contractor details for the real-time data
         const completedReviewsWithDetails = await Promise.all(reviewsData.map(async (review) => {
            const jobDoc = review.jobId ? await firestore.collection('jobs').doc(review.jobId).get() : null;
            const contractorDoc = review.contractorId ? await firestore.collection('users').doc(review.contractorId).get() : null;
            return {
                ...review,
                jobTitle: jobDoc?.exists ? jobDoc.data().title : 'Unknown Job',
                contractorName: contractorDoc?.exists ? contractorDoc.data().name : 'Unknown Contractor',
            };
         }));

        setCompletedReviews(completedReviewsWithDetails);
        setLoading(false); // Set loading to false once initial data is received
      }, err => {
        console.error('Error fetching real-time completed reviews:', err);
        let errorMessage = 'Failed to fetch reports.';
        // Provide more specific error messages based on Firestore error codes
        switch (err.code) {
          case 'permission-denied':
            errorMessage = 'You do not have permission to view reports.';
            break;
          case 'unavailable':
            errorMessage = 'Firestore is currently unavailable. Please try again later.';
            break;
          case 'internal':
            errorMessage = 'An internal error occurred while fetching reports. Please try again.';
            break;
          // Add more cases for other common Firestore errors if needed
          default:
            errorMessage = `Failed to fetch reports: ${err.message}`; // Fallback
        }
        setError(errorMessage);
        enqueueSnackbar(errorMessage, { variant: 'error' });
        setLoading(false);
      });

    // Unsubscribe from listener when component unmounts
    return () => unsubscribeReviews();
  }, [enqueueSnackbar]); // Add enqueueSnackbar as a dependency

  const exportToGoogleSheets = async () => {
    // ** Implement Google Sheets export functionality here **
    // This could involve:
    // 1. Formatting the completedReviews data into a suitable format for Google Sheets.
    // 2. Using the Google Sheets API to write the data to a spreadsheet.
    //    - Recommended: Use a Cloud Function to interact with the Google Sheets API securely.

    console.log('Export to Google Sheets clicked (placeholder)');
    alert('Google Sheets export functionality to be implemented.');

    // Example using a callable Cloud Function (requires implementing the function):
    // try {
    //   const exportDataFunction = functions.httpsCallable('exportReportsToSheets');
    //   const response = await exportDataFunction({ data: completedReviews });
    //   console.log('Export successful:', response.data);
    //   alert('Data exported to Google Sheets.');
    // } catch (error) {
    //   console.error('Error exporting data:', error);
    //   alert('Failed to export data.');
    // }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: theme.spacing(4) }}>
        <CircularProgress />
      </Box>
    );
  }

  // We can remove the error display here since we are using snackbar notifications
  // if (error) {
  //   return (
  //     <Box sx={{ mt: theme.spacing(4) }}>
  //       <Alert severity="error">{error}</Alert>
  //     </Box>
  //   );
  // }

  return (
    <Box sx={{ p: theme.spacing(3) }}>
      <Typography variant="h4" gutterBottom>
        Reports Dashboard
      </Typography>

      <Typography variant="h5" sx={{ mt: theme.spacing(4), mb: theme.spacing(2) }}>Completed Reviews</Typography>
      {completedReviews.length === 0 ? (
        <Typography>No completed reviews available.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="completed reviews table">
            <TableHead>
              <TableRow>
                <TableCell>Job Title</TableCell>
                <TableCell>Contractor</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Submission Date</TableCell>
                <TableCell>Reviewed Data</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {completedReviews.map(review => (
                <TableRow
                  key={review.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {review.jobTitle}
                  </TableCell>
                  <TableCell>{review.contractorName}</TableCell>
                  <TableCell>{review.status}</TableCell>
                  <TableCell>{review.timestamp?.toDate().toLocaleString()}</TableCell>
                  <TableCell>
                    {/* Display a summary of the reviewed data */}
                    {review.reviewedData && review.reviewedData.products && (
                      <ul>
                        {review.reviewedData.products.map((product, index) => (
                          <li key={index}>{product.name}: {product.quantity}</li>
                        ))}
                      </ul>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Button variant="contained" sx={{ mt: theme.spacing(3) }} onClick={exportToGoogleSheets} disabled={completedReviews.length === 0}>
        Export to Google Sheets
      </Button>
    </Box>
  );
};

export default ReportsDashboard;