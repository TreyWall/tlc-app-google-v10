// new-shelf-scanner-mobile/__tests__/App.test.js
import 'react-native';
import React from 'react';
import App from '../App';

// Note: import explicitly from the rn-test-renderer package
import renderer from 'react-test-renderer';

it('renders correctly', () => {
  renderer.create(<App />);
});