// new-shelf-scanner-admin/src/JobReviewPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // Assuming you are using react-router-dom for routing
import { firestore } from '../firebase'; // Assuming firebase initialization is in ../firebase.js or similar
import {
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Box,
  CircularProgress,
  Card,
  CardContent,
  CardMedia,
  useTheme,
} from '@mui/material';
import { useSnackbar } from 'notistack'; // Import useSnackbar hook

const JobReviewPage = () => {
  const theme = useTheme(); // Access the theme object
  const { enqueueSnackbar } = useSnackbar(); // Use the useSnackbar hook
  const { jobId } = useParams(); // Get jobId from route parameters
  const [job, setJob] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({}); // State to manage validation errors
  const [savingReviewId, setSavingReviewId] = useState(null); // State to track review being saved

  useEffect(() => {
    if (!jobId) {
      setLoading(false);
      setError('Job ID is missing.');
      enqueueSnackbar('Job ID is missing.', { variant: 'error' });
      return;
    }

    // Set up real-time listener for the job document
    const unsubscribeJob = firestore.collection('jobs').doc(jobId)
      .onSnapshot(docSnapshot => {
        if (docSnapshot.exists) {
          setJob({ id: docSnapshot.id, ...docSnapshot.data() });
        } else {
          setError('Job not found.');
          enqueueSnackbar('Job not found.', { variant: 'error' });
        }
        setLoading(false); // Set loading to false once initial job data is received
      }, err => {
        console.error('Error fetching real-time job:', err);
        setError('Failed to fetch real-time job data.');
        enqueueSnackbar(`Failed to fetch job data: ${err.message}`, { variant: 'error' });
        setLoading(false);
      });

    // Set up real-time listener for reviews related to this job
    const unsubscribeReviews = firestore.collection('reviews')
      .where('jobId', '==', jobId)
      .orderBy('timestamp', 'asc')
      .onSnapshot(snapshot => {
        const reviewsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setReviews(reviewsData);
         // Note: We don't set loading here, as it's handled by the job listener
      }, err => {
        console.error('Error fetching real-time reviews:', err);
        // You might want to handle review fetching errors separately if they are not critical
        enqueueSnackbar(`Failed to fetch reviews: ${err.message}`, { variant: 'error' });
      });

    // Unsubscribe from listeners when component unmounts
    return () => {
      unsubscribeJob();
      unsubscribeReviews();
    };
  }, [jobId, enqueueSnackbar]); // Add dependencies

  const handleAdminReviewChange = (reviewIndex, productIndex, field, value) => {
    const newReviews = [...reviews];
    // Ensure adminReviewedData and products array exist
    if (!newReviews[reviewIndex].adminReviewedData) {
      newReviews[reviewIndex].adminReviewedData = { products: [] };
    }
    if (!newReviews[reviewIndex].adminReviewedData.products[productIndex]) {
         newReviews[reviewIndex].adminReviewedData.products[productIndex] = { ...newReviews[reviewIndex].parsedData?.products?.[productIndex] };
    }

    // Update the specific field
    newReviews[reviewIndex].adminReviewedData.products[productIndex][field] = value;

    setReviews(newReviews);

    // Clear validation error for this field when it changes
    const errorKey = `${reviewIndex}-${productIndex}-${field}`;
    if (validationErrors[errorKey]) {
      setValidationErrors(prevErrors => {
        const updatedErrors = { ...prevErrors };
        delete updatedErrors[errorKey];
        return updatedErrors;
      });
    }
  };

  const validateReview = (review, reviewIndex) => {
    const errors = {};
    if (review.adminReviewedData && review.adminReviewedData.products) {
      review.adminReviewedData.products.forEach((product, productIndex) => {
        if (!product.name) {
          errors[`${reviewIndex}-${productIndex}-name`] = 'Product name is required';
        }
        if (product.quantity === undefined || product.quantity < 0 || isNaN(product.quantity)) {
           errors[`${reviewIndex}-${productIndex}-quantity`] = 'Quantity must be a non-negative number';
        }
      });
    }
    return errors;
  };

  const saveAdminReview = async (reviewId, reviewData, reviewIndex) => {
    const errors = validateReview(reviews[reviewIndex], reviewIndex);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(prevErrors => ({ ...prevErrors, ...errors }));
      enqueueSnackbar('Please fix validation errors before saving.', { variant: 'warning' });
      return;
    }

    setSavingReviewId(reviewId); // Set the review being saved
    try {
      // Update the existing review document using the reviewId
      const reviewDocRef = firestore.collection('reviews').doc(reviewId);
      await reviewDocRef.update({
        adminReviewedData: reviewData,
        adminReviewedAt: firestore.FieldValue.serverTimestamp(),
        status: 'admin_reviewed', // Update status
        // Add other fields to update if necessary
      });

      enqueueSnackbar(`Review ${reviewId} updated successfully!`, { variant: 'success' });
      // The real-time listener for reviews will update the local state
    } catch (err) {
      console.error('Error saving admin review:', err);
      enqueueSnackbar(`Failed to save admin review: ${err.message}`, { variant: 'error' });
    } finally {
      setSavingReviewId(null); // Reset the saving review state
    }
  };


  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: theme.spacing(4) }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!job) {
    return (
      <Box sx={{ mt: theme.spacing(4) }}>
         <Typography>Job not found.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: theme.spacing(3) }}>
      <Typography variant="h4" gutterBottom>
        Job Review: {job.title}
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Location: {job.location}
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Status: {job.status}
      </Typography>

      <Typography variant="h5" sx={{ mt: theme.spacing(4), mb: theme.spacing(2) }}>Reviews</Typography>
      {reviews.length === 0 ? (
        <Typography>No reviews for this job yet.</Typography>
      ) : (
        <Grid container spacing={theme.spacing(3)}>
          {reviews.map((review, reviewIndex) => (
            <Grid item xs={12} sm={6} md={4} key={review.id}>
              <Card>
                 {review.imageUrl && (
                    <CardMedia
                      component="img"
                      height="200"
                      image={review.imageUrl}
                      alt="Shelf Image"
                      sx={{ objectFit: 'contain', p: theme.spacing(1) }}
                    />
                 )}
                <CardContent>
                  <Typography variant="h6" gutterBottom>Review ID: {review.id}</Typography>
                  <Typography variant="body2" color="text.secondary">Reviewed by Contractor ID: {review.contractorId}</Typography>
                  <Typography variant="body2" color="text.secondary">Submitted At: {review.timestamp?.toDate().toLocaleString()}</Typography>

                  <Typography variant="h6" sx={{ mt: theme.spacing(2), mb: theme.spacing(1) }}>Parsed Data (Contractor's Review)</Typography>
                  {/* Display and allow editing of parsedData or adminReviewedData */}
                  {review.parsedData && review.parsedData.products && (
                    <Box>
                       {review.parsedData.products.map((product, productIndex) => (
                          <Box key={productIndex} sx={{ mb: theme.spacing(2) }}>
                             <TextField
                               fullWidth
                               label="Product Name"
                               value={(review.adminReviewedData?.products?.[productIndex]?.name) || product.name}
                               onChange={(e) => handleAdminReviewChange(reviewIndex, productIndex, 'name', e.target.value)}
                               margin="dense"
                               error={!!validationErrors[`${reviewIndex}-${productIndex}-name`]} // Set error prop
                               helperText={validationErrors[`${reviewIndex}-${productIndex}-name`]} // Display error message
                             />
                              <TextField
                               fullWidth
                               label="Quantity"
                               type="number"
                               value={(review.adminReviewedData?.products?.[productIndex]?.quantity) || product.quantity}
                                onChange={(e) => handleAdminReviewChange(reviewIndex, productIndex, 'quantity', parseInt(e.target.value, 10) || 0)}
                                margin="dense"
                                error={!!validationErrors[`${reviewIndex}-${productIndex}-quantity`]} // Set error prop
                                helperText={validationErrors[`${reviewIndex}-${productIndex}-quantity`]} // Display error message
                              />
                          </Box>
                       ))}
                    </Box>
                  )}

                  <Box sx={{ position: 'relative', mt: theme.spacing(2) }}>
                    <Button
                      variant="contained"
                      onClick={() => saveAdminReview(review.id, reviews[reviewIndex].adminReviewedData || reviews[reviewIndex].parsedData, reviewIndex)}
                      disabled={savingReviewId === review.id} // Disable while saving
                      sx={{
                         '&:active': { // Style for active state
                            backgroundColor: theme.palette.primary.dark, // Darker shade on press
                         },
                      }}
                    >
                      Save Admin Review
                    </Button>
                    {savingReviewId === review.id && (
                      <CircularProgress size={24} sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        marginTop: '-12px',
                        marginLeft: '-12px',
                      }} />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default JobReviewPage;