// new-shelf-scanner-mobile/__tests__/JobListScreen.test.js
import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import NewShelfScannerJobListScreen from '../screens/job list';
import { firestore, auth } from '../firebase'; // Import Firebase firestore and auth

// Mock Firebase firestore and auth
jest.mock('../firebase', () => ({
  firestore: {
    collection: jest.fn(() => ({
      where: jest.fn(() => ({
        where: jest.fn(() => ({
          orderBy: jest.fn(() => ({
            onSnapshot: jest.fn(), // Mock onSnapshot for real-time listener
            get: jest.fn(), // Keep get for potential one-time fetches if needed
          })),
        })),
      })),
    })),
  },
  auth: {
    currentUser: { uid: 'testContractorId' }, // Mock a logged-in user
  },
}));

// Mock navigation
const mockNavigate = jest.fn();
const mockNavigation = { navigate: mockNavigate };

// Mock useToast
jest.mock('react-native-toast-notifications', () => ({
  useToast: () => ({
    show: jest.fn(),
  }),
}));

describe('NewShelfScannerJobListScreen', () => {
  const mockJobsData = [
    { id: 'job1', title: 'Job 1', location: 'Location A', contractorId: 'testContractorId', status: 'assigned' },
    { id: 'job2', title: 'Job 2', location: 'Location B', contractorId: 'testContractorId', status: 'assigned' },
  ];

  beforeEach(() => {
    // Clear mocks and reset onSnapshot before each test
    jest.clearAllMocks();
    firestore.collection().where().where().orderBy().onSnapshot.mockClear();
  });

  it('displays loading indicator initially', () => {
    // Initially, onSnapshot callback is not called, so loading is true
    const { getByText } = render(<NewShelfScannerJobListScreen navigation={mockNavigation} />);
    expect(getByText('Loading jobs...')).toBeTruthy();
  });

  it('displays jobs after data is fetched', async () => {
    // Mock onSnapshot to immediately call the callback with data
    const mockOnSnapshot = firestore.collection().where().where().orderBy().onSnapshot;
    mockOnSnapshot.mockImplementationOnce(callback => {
      const snapshot = { docs: mockJobsData.map(job => ({ id: job.id, data: () => job })) };
      callback(snapshot);
      return jest.fn(); // Return unsubscribe function
    });

    const { getByText } = render(<NewShelfScannerJobListScreen navigation={mockNavigation} />);

    // Wait for the data to be rendered
    await waitFor(() => expect(getByText('Job 1')).toBeTruthy());
    expect(getByText('Location A')).toBeTruthy();
    await waitFor(() => expect(getByText('Job 2')).toBeTruthy());
    expect(getByText('Location B')).toBeTruthy();
  });

  it('displays empty message when no jobs are available', async () => {
     const mockOnSnapshot = firestore.collection().where().where().orderBy().onSnapshot;
     mockOnSnapshot.mockImplementationOnce(callback => {
       const snapshot = { docs: [] }; // No jobs
       callback(snapshot);
       return jest.fn(); // Return unsubscribe function
     });

     const { getByText } = render(<NewShelfScannerJobListScreen navigation={mockNavigation} />);

     await waitFor(() => expect(getByText('No jobs available at the moment.')).toBeTruthy());
  });

  it('displays error message when fetching data fails', async () => {
     const errorMessage = 'Failed to fetch jobs.';
     const mockOnSnapshot = firestore.collection().where().where().orderBy().onSnapshot;
     mockOnSnapshot.mockImplementationOnce((callback, errorCallback) => {
       errorCallback(new Error(errorMessage)); // Simulate error
       return jest.fn(); // Return unsubscribe function
     });

     const { getByText } = render(<NewShelfScannerJobListScreen navigation={mockNavigation} />);

     await waitFor(() => expect(getByText(errorMessage)).toBeTruthy());
  });

  it('navigates to Instructions screen when a job item is pressed', async () => {
     const mockOnSnapshot = firestore.collection().where().where().orderBy().onSnapshot;
     mockOnSnapshot.mockImplementationOnce(callback => {
       const snapshot = { docs: mockJobsData.map(job => ({ id: job.id, data: () => job })) };
       callback(snapshot);
       return jest.fn(); // Return unsubscribe function
     });

    const { getByText } = render(<NewShelfScannerJobListScreen navigation={mockNavigation} />);

    // Wait for the jobs to be rendered
    await waitFor(() => expect(getByText('Job 1')).toBeTruthy());

    // Press the first job item
    fireEvent.press(getByText('Job 1'));

    // Expect navigation to Instructions screen with the correct job data
    expect(mockNavigate).toHaveBeenCalledWith('Instructions', { job: mockJobsData[0] });
  });

});
