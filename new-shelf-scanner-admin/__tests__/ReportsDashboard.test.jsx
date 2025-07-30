// new-shelf-scanner-admin/__tests__/ReportsDashboard.test.jsx
import React from 'react';
import { render, waitFor, screen } from '@testing-library/react';
import ReportsDashboard from '../src/ReportsDashboard';
import { firestore } from '../firebase'; // Import Firebase firestore

// Mock Firebase firestore
jest.mock('../firebase', () => ({
  firestore: {
    collection: jest.fn(() => ({
      where: jest.fn(() => ({
        where: jest.fn(() => ({
          orderBy: jest.fn(() => ({
            onSnapshot: jest.fn(), // Mock onSnapshot for real-time listener
          })),
        })),
      })),
      doc: jest.fn(() => ({
        get: jest.fn(), // Mock get for fetching job and contractor details
      })),
    })),
  },
}));

// Mock notistack's useSnackbar
jest.mock('notistack', () => ({
  useSnackbar: () => ({
    enqueueSnackbar: jest.fn(),
  }),
}));

describe('ReportsDashboard', () => {
  const mockCompletedReviewsData = [
    {
      id: 'review1',
      jobId: 'job1',
      contractorId: 'contractor1',
      status: 'admin_reviewed',
      timestamp: { toDate: () => new Date('2023-10-26T10:00:00Z') },
      reviewedData: { products: [{ name: 'Product C', quantity: 10 }] },
    },
    {
      id: 'review2',
      jobId: 'job2',
      contractorId: 'contractor2',
      status: 'reviewed',
      timestamp: { toDate: () => new Date('2023-10-25T10:00:00Z') },
      reviewedData: { products: [{ name: 'Product D', quantity: 5 }] },
    },
  ];

   const mockJobsData = [
     { id: 'job1', title: 'Job A' },
     { id: 'job2', title: 'Job B' },
   ];

   const mockContractorsData = [
     { id: 'contractor1', name: 'Contractor One' },
     { id: 'contractor2', name: 'Contractor Two' },
   ];

  // Helper to mock onSnapshot behavior for reviews collection
  const mockReviewsOnSnapshot = (reviewsSnapshot = { docs: [] }, error = null) => {
    firestore.collection().where().where().orderBy().onSnapshot.mockImplementationOnce(callback => {
      if (error) {
        callback(null, error);
      } else {
        callback(reviewsSnapshot);
      }
      return jest.fn(); // Return unsubscribe function
    });
  };

   // Helper to mock get behavior for job and contractor documents
   const mockGetDoc = (docId, collectionName, docData = null, exists = true) => {
       firestore.collection(collectionName).doc(docId).get.mockImplementation(() => {
           if (!exists) return Promise.resolve({ exists: false });
           return Promise.resolve({ exists: true, data: () => docData });
       });
   };

  beforeEach(() => {
    // Clear mocks and reset mock implementations before each test
    jest.clearAllMocks();
     mockReviewsOnSnapshot(); // Default to no reviews initially
     // Default mocks for fetching job and contractor details
      mockJobsData.forEach(job => mockGetDoc(job.id, 'jobs', job));
      mockContractorsData.forEach(contractor => mockGetDoc(contractor.id, 'users', contractor));
      // Mock for unknown job/contractor
      mockGetDoc('unknownJobId', 'jobs', null, false);
      mockGetDoc('unknownContractorId', 'users', null, false);
  });

  it('displays loading indicator initially', () => {
    render(<ReportsDashboard />);
    expect(screen.getByRole('progressbar')).toBeTruthy();
  });

  it('displays error message when fetching completed reviews fails', async () => {
    const errorMessage = 'Failed to fetch reports.';
    mockReviewsOnSnapshot(null, new Error(errorMessage));

    render(<ReportsDashboard />);

    await waitFor(() => expect(screen.getByText(errorMessage)).toBeTruthy());
  });

  it('displays empty message when no completed reviews are available', async () => {
     mockReviewsOnSnapshot({ docs: [] });

    render(<ReportsDashboard />);

    await waitFor(() => expect(screen.getByText('No completed reviews available.')).toBeTruthy();)
    expect(screen.getByRole('button', { name: 'Export to Google Sheets' })).toBeDisabled();
  });

  it('displays completed reviews in the table', async () => {
     mockReviewsOnSnapshot({ docs: mockCompletedReviewsData.map(review => ({ id: review.id, data: () => review })) });

    render(<ReportsDashboard />);

    await waitFor(() => expect(screen.getByText('Job A')).toBeTruthy());
    expect(screen.getByText('Contractor One')).toBeTruthy();
    expect(screen.getByText('admin_reviewed')).toBeTruthy();
    expect(screen.getByText('10/26/2023, 10:00:00 AM')).toBeTruthy(); // Formatted date/time
    expect(screen.getByText('Product C: 10')).toBeTruthy();

    await waitFor(() => expect(screen.getByText('Job B')).toBeTruthy());
    expect(screen.getByText('Contractor Two')).toBeTruthy();
    expect(screen.getByText('reviewed')).toBeTruthy();
    expect(screen.getByText('10/25/2023, 10:00:00 AM')).toBeTruthy(); // Formatted date/time
    expect(screen.getByText('Product D: 5')).toBeTruthy();

     expect(screen.getByRole('button', { name: 'Export to Google Sheets' })).toBeEnabled();
  });

   // Add a test for the exportToGoogleSheets button click if needed,
   // although the actual export logic is a placeholder currently.

});
