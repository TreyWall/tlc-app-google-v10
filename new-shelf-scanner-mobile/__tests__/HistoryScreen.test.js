// new-shelf-scanner-mobile/__tests__/HistoryScreen.test.js
import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import NewShelfScannerHistoryScreen from '../screens/history';
import { firestore, auth } from '../firebase'; // Import Firebase firestore and auth

// Mock Firebase firestore and auth
jest.mock('../firebase', () => ({
  firestore: {
    collection: jest.fn(() => ({
      where: jest.fn(() => ({
        where: jest.fn(() => ({
          orderBy: jest.fn(() => ({
            get: jest.fn(),
          })),
        })),
      })),
      doc: jest.fn(() => ({
        get: jest.fn(),
      })),
    })),
  },
  auth: {
    currentUser: { uid: 'testContractorId' }, // Mock a logged-in user
  },
}));

// Mock useToast
jest.mock('react-native-toast-notifications', () => ({
  useToast: () => ({
    show: jest.fn(),
  }),
}));

describe('NewShelfScannerHistoryScreen', () => {
  const mockReviewsData = [
    { id: 'review1', jobId: 'job1', contractorId: 'testContractorId', status: 'reviewed', timestamp: { toDate: () => new Date('2023-10-26') }, reviewedData: { products: [{ name: 'Product C', quantity: 10 }] } },
    { id: 'review2', jobId: 'job2', contractorId: 'testContractorId', status: 'reviewed', timestamp: { toDate: () => new Date('2023-10-25') }, reviewedData: { products: [{ name: 'Product D', quantity: 5 }] } },
  ];

   const mockJobsData = [
     { id: 'job1', title: 'Job A' },
     { id: 'job2', title: 'Job B' },
   ];

  beforeEach(() => {
    // Clear mocks and reset get before each test
    jest.clearAllMocks();
    firestore.collection().where().where().orderBy().get.mockClear();
     firestore.collection().doc().get.mockClear();

     // Default mock for fetching reviews
     firestore.collection().where().where().orderBy().get.mockResolvedValue({
        docs: mockReviewsData.map(review => ({ id: review.id, data: () => review })),
     });

     // Default mock for fetching job details
      mockJobsData.forEach(job => {
         firestore.collection('jobs').doc(job.id).get.mockResolvedValue({ exists: true, data: () => job });
      });
      // Mock for unknown jobs
      firestore.collection('jobs').doc('unknownJobId').get.mockResolvedValue({ exists: false });
  });

  it('displays loading indicator initially', () => {
    // Initially, the async fetchHistory is running, so loading is true
    const { getByText } = render(<NewShelfScannerHistoryScreen />);
    expect(getByText('Loading history...')).toBeTruthy();
  });

  it('displays history items after data is fetched', async () => {
    const { getByText } = render(<NewShelfScannerHistoryScreen />);

    // Wait for the data to be rendered
    await waitFor(() => expect(getByText('Job A')).toBeTruthy());
    expect(getByText('Submitted: Oct 26 2023')).toBeTruthy(); // Check formatted date
    expect(getByText('- Product C: 10')).toBeTruthy();

    await waitFor(() => expect(getByText('Job B')).toBeTruthy());
    expect(getByText('Submitted: Oct 25 2023')).toBeTruthy(); // Check formatted date
    expect(getByText('- Product D: 5')).toBeTruthy();
  });

  it('displays empty message when no history is available', async () => {
      firestore.collection().where().where().orderBy().get.mockResolvedValue({ docs: [] }); // No reviews

      const { getByText } = render(<NewShelfScannerHistoryScreen />);

      await waitFor(() => expect(getByText('No history available.')).toBeTruthy());
  });

  it('displays error message when fetching history fails', async () => {
     const errorMessage = 'Failed to fetch history.';
      firestore.collection().where().where().orderBy().get.mockRejectedValueOnce(new Error(errorMessage)); // Simulate error

      const { getByText } = render(<NewShelfScannerHistoryScreen />);

      await waitFor(() => expect(getByText(errorMessage)).toBeTruthy());
      expect(toast.show).toHaveBeenCalledWith(`Failed to fetch history: ${errorMessage}`, { type: 'danger' });
  });

});
