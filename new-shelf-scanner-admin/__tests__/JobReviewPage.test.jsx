// new-shelf-scanner-admin/__tests__/JobReviewPage.test.jsx
import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import JobReviewPage from '../src/JobReviewPage';
import { firestore } from '../firebase'; // Import Firebase firestore

// Mock Firebase firestore
jest.mock('../firebase', () => ({
  firestore: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        onSnapshot: jest.fn(), // Mock onSnapshot for real-time listener
        update: jest.fn(), // Mock update for saving admin review
      })),
      where: jest.fn(() => ({
        orderBy: jest.fn(() => ({
           onSnapshot: jest.fn(), // Mock onSnapshot for real-time listener
        })),
      })),
    })),
    FieldValue: { serverTimestamp: jest.fn() }, // Mock serverTimestamp
  },
}));

// Mock notistack's useSnackbar
jest.mock('notistack', () => ({
  useSnackbar: () => ({
    enqueueSnackbar: jest.fn(),
  }),
}));

// Mock react-router-dom's useParams
jest.mock('react-router-dom', () => ({
  useParams: jest.fn(),
}));

import { useParams } from 'react-router-dom';

describe('JobReviewPage', () => {
  const mockJobId = 'job123';
  const mockJobData = { id: mockJobId, title: 'Test Job', location: 'Test Location', status: 'assigned' };
  const mockReviewsData = [
    {
      id: 'review1',
      jobId: mockJobId,
      contractorId: 'contractor1',
      timestamp: { toDate: () => new Date('2023-10-26T10:00:00Z') },
      parsedData: { products: [{ name: 'Product X', quantity: 5 }] },
      imageUrl: 'http://example.com/image.jpg',
    },
  ];

  // Helper to mock onSnapshot behavior for job document
  const mockJobOnSnapshot = (jobSnapshot = { exists: false }, error = null) => {
    firestore.collection().doc().onSnapshot.mockImplementationOnce(callback => {
      if (error) {
        callback(null, error);
      } else {
        callback(jobSnapshot);
      }
      return jest.fn(); // Return unsubscribe function
    });
  };

   // Helper to mock onSnapshot behavior for reviews collection
   const mockReviewsOnSnapshot = (reviewsSnapshot = { docs: [] }, error = null) => {
      firestore.collection().where().orderBy().onSnapshot.mockImplementationOnce(callback => {
          if (error) {
              callback(null, error);
          } else {
              callback(reviewsSnapshot);
          }
          return jest.fn(); // Return unsubscribe function
      });
   };

  beforeEach(() => {
    // Clear mocks and reset mock implementations before each test
    jest.clearAllMocks();
    useParams.mockReturnValue({ jobId: mockJobId });
     mockJobOnSnapshot({ exists: true, data: () => mockJobData }); // Default mock for fetching job
     mockReviewsOnSnapshot({ docs: mockReviewsData.map(review => ({ id: review.id, data: () => review })) }); // Default mock for fetching reviews
  });

  it('displays loading indicator initially', () => {
    // Ensure initial state shows loading before snapshots are called
    useParams.mockReturnValue({ jobId: 'someJobId' }); // Use a different ID initially to prevent immediate snapshot
    render(<JobReviewPage />);
    expect(screen.getByRole('progressbar')).toBeTruthy();
  });

   it('displays error message when job is not found', async () => {
       mockJobOnSnapshot({ exists: false }); // Simulate job not found
       mockReviewsOnSnapshot({ docs: [] }); // No reviews

      render(<JobReviewPage />);

       await waitFor(() => expect(screen.getByText('Job not found.')).toBeTruthy());
   });

   it('displays error message when fetching job data fails', async () => {
       const errorMessage = 'Failed to fetch job data.';
       mockJobOnSnapshot(null, new Error(errorMessage));
        mockReviewsOnSnapshot({ docs: [] });

       render(<JobReviewPage />);

       await waitFor(() => expect(screen.getByText(errorMessage)).toBeTruthy());
   });

    it('displays error message when fetching reviews fails', async () => {
       const errorMessage = 'Failed to fetch reviews.';
       mockJobOnSnapshot({ exists: true, data: () => mockJobData });
       mockReviewsOnSnapshot(null, new Error(errorMessage));

       render(<JobReviewPage />);

       await waitFor(() => expect(useSnackbar().enqueueSnackbar).toHaveBeenCalledWith(errorMessage, { variant: 'error' }));
       // Expect job details to still be displayed if job fetch was successful
        await waitFor(() => expect(screen.getByText(`Job Review: ${mockJobData.title}`)).toBeTruthy());
    });


  it('displays job details and reviews', async () => {
    render(<JobReviewPage />);

    await waitFor(() => expect(screen.getByText(`Job Review: ${mockJobData.title}`)).toBeTruthy());
    expect(screen.getByText(`Location: ${mockJobData.location}`)).toBeTruthy();
    expect(screen.getByText(`Status: ${mockJobData.status}`)).toBeTruthy();

    await waitFor(() => expect(screen.getByText('Review ID: review1')).toBeTruthy());
    expect(screen.getByText('Reviewed by Contractor ID: contractor1')).toBeTruthy();
    expect(screen.getByText('Submitted At: 10/26/2023, 10:00:00 AM')).toBeTruthy(); // Check formatted date/time

    expect(screen.getByLabelText('Product Name')).toHaveValue('Product X');
    expect(screen.getByLabelText('Quantity')).toHaveValue(5);
  });

  it('updates state when admin review input changes', async () => {
     render(<JobReviewPage />);

     await waitFor(() => expect(screen.getByLabelText('Product Name')).toBeTruthy());

     const productNameInput = screen.getByLabelText('Product Name');
     fireEvent.change(productNameInput, { target: { value: 'Updated Product X' } });

     // Verify the input value changes (reflecting state update)
     expect(productNameInput).toHaveValue('Updated Product X');
  });

   it('calls firestore update with admin reviewed data on save', async () => {
       const mockUpdate = firestore.collection().doc().update;
       mockUpdate.mockResolvedValueOnce(); // Mock successful update

      render(<JobReviewPage />);

      await waitFor(() => expect(screen.getByLabelText('Product Name')).toBeTruthy());

      const productNameInput = screen.getByLabelText('Product Name');
      fireEvent.change(productNameInput, { target: { value: 'Updated Product X' } });

      const quantityInput = screen.getByLabelText('Quantity');
      fireEvent.change(quantityInput, { target: { value: '10' } });

      fireEvent.click(screen.getByText('Save Admin Review'));

       await waitFor(() => expect(mockUpdate).toHaveBeenCalled());

       // Expect firestore update to be called with the correct reviewId and adminReviewedData
      expect(firestore.collection).toHaveBeenCalledWith('reviews');
      expect(firestore.collection('reviews').doc).toHaveBeenCalledWith('review1');
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
          adminReviewedData: {
              products: [
                  { name: 'Updated Product X', quantity: 10 },
              ],
          },
          adminReviewedAt: firestore.FieldValue.serverTimestamp(),
          status: 'admin_reviewed',
      }));

       await waitFor(() => expect(useSnackbar().enqueueSnackbar).toHaveBeenCalledWith('Review review1 updated successfully!', { variant: 'success' }));
   });

   it('displays validation errors before saving', async () => {
       render(<JobReviewPage />);

       await waitFor(() => expect(screen.getByLabelText('Product Name')).toBeTruthy());

       const productNameInput = screen.getByLabelText('Product Name');
       fireEvent.change(productNameInput, { target: { value: '' } }); // Empty name to trigger validation

       fireEvent.click(screen.getByText('Save Admin Review'));

       await waitFor(() => expect(screen.getByText('Product name is required')).toBeTruthy());
       expect(useSnackbar().enqueueSnackbar).toHaveBeenCalledWith('Please fix validation errors before saving.', { variant: 'warning' });
   });

    it('displays loading indicator during saving', async () => {
        const mockUpdate = firestore.collection().doc().update;
        mockUpdate.mockReturnValue(new Promise(() => {})); // Simulate loading

        render(<JobReviewPage />);

        await waitFor(() => expect(screen.getByLabelText('Product Name')).toBeTruthy());
        const productNameInput = screen.getByLabelText('Product Name');
        fireEvent.change(productNameInput, { target: { value: 'Updated Product X' } });

        fireEvent.click(screen.getByText('Save Admin Review'));

        await waitFor(() => expect(screen.getAllByRole('progressbar').length).toBeGreaterThan(0)); // Check for loading indicator(s)
    });

    it('displays error snackbar on saving failure', async () => {
        const errorMessage = 'Failed to save admin review.';
        const mockUpdate = firestore.collection().doc().update;
        mockUpdate.mockRejectedValueOnce(new Error(errorMessage)); // Simulate error

        render(<JobReviewPage />);

        await waitFor(() => expect(screen.getByLabelText('Product Name')).toBeTruthy());
        const productNameInput = screen.getByLabelText('Product Name');
        fireEvent.change(productNameInput, { target: { value: 'Updated Product X' } });

        fireEvent.click(screen.getByText('Save Admin Review'));

        await waitFor(() => expect(useSnackbar().enqueueSnackbar).toHaveBeenCalledWith(errorMessage, { variant: 'error' }));
    });

});
