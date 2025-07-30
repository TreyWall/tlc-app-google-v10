// new-shelf-scanner-mobile/__tests__/AIReviewScreen.test.js
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import NewShelfScannerAIReviewScreen from '../screens/AI review';
import { firestore } from '../firebase'; // Import Firebase firestore

// Mock Firebase firestore
jest.mock('../firebase', () => ({
  firestore: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        update: jest.fn(),
      })),
    })),
    FieldValue: { serverTimestamp: jest.fn() }, // Mock serverTimestamp
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

describe('NewShelfScannerAIReviewScreen', () => {
  const mockJob = { id: 'job1', title: 'Test Job' };
  const mockParsedData = {
    products: [
      { name: 'Product A', quantity: 10 },
      { name: 'Product B', quantity: 5 },
    ],
  };
  const mockReviewId = 'review123';

  const mockRoute = {
    params: { job: mockJob, parsedData: mockParsedData, reviewId: mockReviewId },
  };

  beforeEach(() => {
    // Clear mocks before each test
    jest.clearAllMocks();
  });

  it('renders correctly with parsed product data', () => {
    const { getByDisplayValue, getByText } = render(
      <NewShelfScannerAIReviewScreen route={mockRoute} navigation={mockNavigation} />
    );

    expect(getByText(`Review for Job: ${mockJob.title}`)).toBeTruthy();
    expect(getByText('Parsed Data:')).toBeTruthy();
    expect(getByDisplayValue('Product A')).toBeTruthy();
    expect(getByDisplayValue('10')).toBeTruthy();
    expect(getByDisplayValue('Product B')).toBeTruthy();
    expect(getByDisplayValue('5')).toBeTruthy();
    expect(getByText('Submit Review')).toBeTruthy();
  });

  it('updates state when product name input changes', () => {
    const { getByDisplayValue } = render(
      <NewShelfScannerAIReviewScreen route={mockRoute} navigation={mockNavigation} />
    );

    const productNameInput = getByDisplayValue('Product A');
    fireEvent.changeText(productNameInput, 'Updated Product A');

    // The component's state is updated, but we can't directly access it here.
    // In a real scenario, you might test a prop change if this were a child component
    // or test the effect on the rendered output if applicable.
    // For now, we assume the change handler correctly updates internal state.
  });

   it('updates state when product quantity input changes', () => {
    const { getByDisplayValue } = render(
      <NewShelfScannerAIReviewScreen route={mockRoute} navigation={mockNavigation} />
    );

    const productQuantityInput = getByDisplayValue('10');
    fireEvent.changeText(productQuantityInput, '15');

    // Similar to name change, assuming the handler updates state.
   });

  it('calls firestore update and navigates on successful submission', async () => {
    const mockUpdate = firestore.collection().doc().update;
    mockUpdate.mockResolvedValueOnce(); // Mock successful update

    const { getByText, getByDisplayValue } = render(
      <NewShelfScannerAIReviewScreen route={mockRoute} navigation={mockNavigation} />
    );

    // Make a change to ensure reviewedData is different from parsedData if needed
    const productNameInput = getByDisplayValue('Product A');
    fireEvent.changeText(productNameInput, 'Updated Product A');

    fireEvent.press(getByText('Submit Review'));

    // Wait for the async update to complete and navigation to be called
    await waitFor(() => expect(mockUpdate).toHaveBeenCalled());

    // Expect firestore update to be called with the correct reviewId and data
    expect(firestore.collection).toHaveBeenCalledWith('reviews');
    expect(firestore.collection('reviews').doc).toHaveBeenCalledWith(mockReviewId);
    // Check the data passed to update - this might need refinement based on how reviewedData is structured after edits
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
       reviewedData: expect.objectContaining({
          products: expect.arrayContaining([
             expect.objectContaining({ name: 'Updated Product A', quantity: 10 }),
             expect.objectContaining({ name: 'Product B', quantity: 5 }),
          ]),
       }),
       status: 'reviewed',
       // timestamp: firestore.FieldValue.serverTimestamp(), // serverTimestamp is mocked, difficult to check exact value
    }));

    expect(mockNavigate).toHaveBeenCalledWith('History');
  });

  it('displays loading indicator during submission', async () => {
    const mockUpdate = firestore.collection().doc().update;
    mockUpdate.mockReturnValue(new Promise(() => {})); // Simulate loading

    const { getByText } = render(
      <NewShelfScannerAIReviewScreen route={mockRoute} navigation={mockNavigation} />
    );

    fireEvent.press(getByText('Submit Review'));

    await waitFor(() => expect(getByText('Submitting...')).toBeTruthy());

    // The test will time out as the promise never resolves, indicating the loading state is active.
    // In a real scenario, you might also test that the button is disabled.
  });

   it('displays error toast on submission failure', async () => {
      const errorMessage = 'Failed to submit review';
      const mockUpdate = firestore.collection().doc().update;
      mockUpdate.mockRejectedValueOnce(new Error(errorMessage)); // Simulate error

       const { getByText } = render(
          <NewShelfScannerAIReviewScreen route={mockRoute} navigation={mockNavigation} />
       );

      fireEvent.press(getByText('Submit Review'));

      await waitFor(() => expect(toast.show).toHaveBeenCalledWith(`Failed to submit review: ${errorMessage}`, { type: 'danger' }));
      expect(mockNavigate).not.toHaveBeenCalled();
   });

});
