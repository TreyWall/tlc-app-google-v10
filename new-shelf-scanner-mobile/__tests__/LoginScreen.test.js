// new-shelf-scanner-mobile/__tests__/LoginScreen.test.js
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import NewShelfScannerLoginScreen from '../screens/login';
import { auth } from '../firebase'; // Import Firebase auth

// Mock Firebase auth
jest.mock('../firebase', () => ({
  auth: {
    signInWithEmailAndPassword: jest.fn(),
  },
}));

// Mock navigation
const mockNavigate = jest.fn();
const mockNavigation = { navigate: mockNavigate };

describe('NewShelfScannerLoginScreen', () => {
  beforeEach(() => {
    // Clear mocks before each test
    auth.signInWithEmailAndPassword.mockClear();
    mockNavigate.mockClear();
  });

  it('renders correctly with email, password inputs and login button', () => {
    const { getByPlaceholderText, getByText } = render(<NewShelfScannerLoginScreen navigation={mockNavigation} />);

    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('Login')).toBeTruthy();
  });

  it('calls signInWithEmailAndPassword and navigates on successful login', async () => {
    auth.signInWithEmailAndPassword.mockResolvedValueOnce({}); // Mock successful login

    const { getByPlaceholderText, getByText } = render(<NewShelfScannerLoginScreen navigation={mockNavigation} />);

    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.press(getByText('Login'));

    // Wait for the async login to complete
    await Promise.resolve(); 

    expect(auth.signInWithEmailAndPassword).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(mockNavigate).toHaveBeenCalledWith('JobList');
  });

  it('displays an alert on failed login', async () => {
    const errorMessage = 'Invalid credentials';
    auth.signInWithEmailAndPassword.mockRejectedValueOnce(new Error(errorMessage)); // Mock failed login

    // Mock Alert
    jest.spyOn(Alert, 'alert');

    const { getByPlaceholderText, getByText } = render(<NewShelfScannerLoginScreen navigation={mockNavigation} />);

    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'wrongpassword');
    fireEvent.press(getByText('Login'));

    // Wait for the async login to complete and alert to be called
    await Promise.resolve();

    expect(auth.signInWithEmailAndPassword).toHaveBeenCalledWith('test@example.com', 'wrongpassword');
    expect(Alert.alert).toHaveBeenCalledWith('Login Failed', errorMessage);
    expect(mockNavigate).not.toHaveBeenCalled();

    // Restore Alert mock
    jest.restoreAllMocks();
  });
});