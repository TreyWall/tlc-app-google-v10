// new-shelf-scanner-mobile/__tests__/InstructionsScreen.test.js
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import NewShelfScannerInstructionsScreen from '../screens/instructions';

// Mock navigation
const mockNavigate = jest.fn();
const mockNavigation = { navigate: mockNavigate };

describe('NewShelfScannerInstructionsScreen', () => {
  const mockJob = {
    id: 'job1',
    title: 'Test Job',
    location: 'Test Location',
    instructions: 'Step 1: Do this.
Step 2: Do that.',
  };

  beforeEach(() => {
    // Clear mocks before each test
    mockNavigate.mockClear();
  });

  it('renders correctly with job title and instructions', () => {
    const mockRoute = { params: { job: mockJob } };
    const { getByText } = render(<NewShelfScannerInstructionsScreen route={mockRoute} navigation={mockNavigation} />);

    expect(getByText(`Instructions for Job: ${mockJob.title}`)).toBeTruthy();
    expect(getByText(mockJob.instructions)).toBeTruthy();
  });

  it('navigates to Camera screen with job data when button is pressed', () => {
    const mockRoute = { params: { job: mockJob } };
    const { getByText } = render(<NewShelfScannerInstructionsScreen route={mockRoute} navigation={mockNavigation} />);

    fireEvent.press(getByText('Proceed to Camera'));

    expect(mockNavigate).toHaveBeenCalledWith('Camera', { job: mockJob });
  });
});
