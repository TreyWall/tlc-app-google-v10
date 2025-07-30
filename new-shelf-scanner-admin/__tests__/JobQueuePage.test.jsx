// new-shelf-scanner-admin/__tests__/JobQueuePage.test.jsx
import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import JobQueuePage from '../src/JobQueuePage';
import { firestore } from '../firebase'; // Import Firebase firestore

// Mock Firebase firestore
jest.mock('../firebase', () => ({
  firestore: {
    collection: jest.fn(() => ({
      where: jest.fn(() => ({
        where: jest.fn(() => ({
          orderBy: jest.fn(() => ({
            onSnapshot: jest.fn(), // Mock onSnapshot for real-time listener
            get: jest.fn(), // Mock get for fetching contractors
          })),
        })),
      })),
      doc: jest.fn(() => ({
        update: jest.fn(), // Mock update for assigning contractor
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

describe('JobQueuePage', () => {
  const mockJobsData = [
    { id: 'job1', title: 'Job 1', location: 'Location A', status: 'pending', createdAt: new Date() },
    { id: 'job2', title: 'Job 2', location: 'Location B', status: 'assigned', contractorId: 'contractor1', createdAt: new Date() },
  ];

  const mockContractorsData = [
    { id: 'contractor1', name: 'Contractor One', role: 'contractor' },
    { id: 'contractor2', name: 'Contractor Two', role: 'contractor' },
  ];

  // Helper to mock onSnapshot behavior
  const mockOnSnapshot = (jobsSnapshot = { docs: [] }, error = null) => {
    firestore.collection().where().where().orderBy().onSnapshot.mockImplementationOnce(callback => {
      if (error) {
        callback(null, error);
      } else {
        callback(jobsSnapshot);
      }
      return jest.fn(); // Return unsubscribe function
    });
  };

   // Helper to mock get behavior for contractors
   const mockGetContractors = (contractorsSnapshot = { docs: [] }, error = null) => {
      firestore.collection().where().get.mockImplementationOnce(() => {
          if (error) {
              return Promise.reject(error);
          } else {
              return Promise.resolve(contractorsSnapshot);
          }
      });
   };

  beforeEach(() => {
    // Clear mocks and reset mock implementations before each test
    jest.clearAllMocks();
     mockOnSnapshot(); // Default to no jobs initially
     mockGetContractors(); // Default to no contractors initially
  });

  it('displays loading indicator initially', () => {
    render(<JobQueuePage />);
    expect(screen.getByRole('progressbar')).toBeTruthy();
  });

   it('displays error message when fetching jobs fails', async () => {
      const errorMessage = 'Failed to fetch real-time jobs.';
       mockOnSnapshot(null, new Error(errorMessage));
        mockGetContractors({ docs: mockContractorsData.map(c => ({ id: c.id, data: () => c })) }); // Mock successful contractor fetch

      render(<JobQueuePage />);

       await waitFor(() => expect(screen.getByText(errorMessage)).toBeTruthy());
   });

   it('displays error message when fetching contractors fails', async () => {
       const errorMessage = 'Failed to fetch contractors.';
       mockOnSnapshot({ docs: mockJobsData.map(job => ({ id: job.id, data: () => job })) }); // Mock successful job fetch
       mockGetContractors(null, new Error(errorMessage));

       render(<JobQueuePage />);

       await waitFor(() => expect(screen.getByText(errorMessage)).toBeTruthy());
   });

  it('displays empty message when no jobs are in the queue', async () => {
     mockOnSnapshot({ docs: [] });
      mockGetContractors({ docs: mockContractorsData.map(c => ({ id: c.id, data: () => c })) });

    render(<JobQueuePage />);

    await waitFor(() => expect(screen.getByText('No jobs in the queue.')).toBeTruthy());
  });

  it('displays jobs and contractors in the table', async () => {
      mockOnSnapshot({ docs: mockJobsData.map(job => ({ id: job.id, data: () => job })) });
      mockGetContractors({ docs: mockContractorsData.map(c => ({ id: c.id, data: () => c })) });

    render(<JobQueuePage />);

    await waitFor(() => expect(screen.getByText('Job 1')).toBeTruthy());
    expect(screen.getByText('Location A')).toBeTruthy();
    expect(screen.getByText('pending')).toBeTruthy();
    expect(screen.getByText('Unassigned')).toBeTruthy();

    await waitFor(() => expect(screen.getByText('Job 2')).toBeTruthy());
    expect(screen.getByText('Location B')).toBeTruthy();
    expect(screen.getByText('assigned')).toBeTruthy();
    expect(screen.getByText('Contractor One')).toBeTruthy();
  });

  it('assigns contractor when selected from dropdown', async () => {
      const mockUpdate = firestore.collection().doc().update;
      mockUpdate.mockResolvedValueOnce(); // Mock successful update

       mockOnSnapshot({ docs: mockJobsData.map(job => ({ id: job.id, data: () => job })) });
       mockGetContractors({ docs: mockContractorsData.map(c => ({ id: c.id, data: () => c })) });

    render(<JobQueuePage />);

    await waitFor(() => expect(screen.getByLabelText('Assign')).toBeTruthy());

    const assignDropdown = screen.getByLabelText('Assign');
    fireEvent.mouseDown(assignDropdown); // Open the select dropdown

    // Wait for the menu items to appear and click on a contractor
    await waitFor(() => screen.getByText('Contractor Two'));
    fireEvent.click(screen.getByText('Contractor Two'));

    // Expect firestore update to be called with the correct data
    expect(firestore.collection).toHaveBeenCalledWith('jobs');
    expect(firestore.collection('jobs').doc).toHaveBeenCalledWith('job1'); // Assuming 'Job 1' is the unassigned one
    expect(mockUpdate).toHaveBeenCalledWith({
      contractorId: 'contractor2',
      status: 'assigned',
    });

     await waitFor(() => expect(useSnackbar().enqueueSnackbar).toHaveBeenCalledWith('Job job1 assigned successfully!', { variant: 'success' }));
  });

   it('displays loading indicator during assignment', async () => {
      const mockUpdate = firestore.collection().doc().update;
      mockUpdate.mockReturnValue(new Promise(() => {})); // Simulate loading

      mockOnSnapshot({ docs: mockJobsData.map(job => ({ id: job.id, data: () => job })) });
      mockGetContractors({ docs: mockContractorsData.map(c => ({ id: c.id, data: () => c })) });

       render(<JobQueuePage />);

       await waitFor(() => expect(screen.getByLabelText('Assign')).toBeTruthy());

       const assignDropdown = screen.getByLabelText('Assign');
       fireEvent.mouseDown(assignDropdown);

       await waitFor(() => screen.getByText('Contractor Two'));
       fireEvent.click(screen.getByText('Contractor Two'));

       await waitFor(() => expect(screen.getAllByRole('progressbar').length).toBeGreaterThan(0)); // Check for loading indicator(s)
   });

   it('displays error snackbar on assignment failure', async () => {
      const errorMessage = 'Failed to assign contractor.';
      const mockUpdate = firestore.collection().doc().update;
      mockUpdate.mockRejectedValueOnce(new Error(errorMessage)); // Simulate error

       mockOnSnapshot({ docs: mockJobsData.map(job => ({ id: job.id, data: () => job })) });
       mockGetContractors({ docs: mockContractorsData.map(c => ({ id: c.id, data: () => c })) });

       render(<JobQueuePage />);

       await waitFor(() => expect(screen.getByLabelText('Assign')).toBeTruthy());

       const assignDropdown = screen.getByLabelText('Assign');
       fireEvent.mouseDown(assignDropdown);

       await waitFor(() => screen.getByText('Contractor Two'));
       fireEvent.click(screen.getByText('Contractor Two'));

       await waitFor(() => expect(useSnackbar().enqueueSnackbar).toHaveBeenCalledWith(errorMessage, { variant: 'error' }));
   });
});
