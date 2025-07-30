import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import your screen components
import NewShelfScannerLoginScreen from './screens/login';
import NewShelfScannerJobListScreen from './screens/job list';
import NewShelfScannerInstructionsScreen from './screens/instructions';
import NewShelfScannerCameraScreen from './screens/camera';
import NewShelfScannerAIReviewScreen from './screens/AI review';
import NewShelfScannerHistoryScreen from './screens/history';

const Stack = createStackNavigator();

const NewShelfScannerApp = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={NewShelfScannerLoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="JobList" component={NewShelfScannerJobListScreen} />
        <Stack.Screen name="Instructions" component={NewShelfScannerInstructionsScreen} />
        <Stack.Screen name="Camera" component={NewShelfScannerCameraScreen} />
        <Stack.Screen name="AIReview" component={NewShelfScannerAIReviewScreen} />
        <Stack.Screen name="History" component={NewShelfScannerHistoryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default NewShelfScannerApp;