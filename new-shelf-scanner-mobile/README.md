# New Shelf Scanner Mobile App

## Project Description

The New Shelf Scanner Mobile App is a React Native application for contractors to perform shelf scanning jobs. It integrates with Firebase for authentication and data storage, and utilizes a Cloud Function with Google Vision API for processing images of shelves.

## Technologies Used

- React Native
- Firebase Authentication
- Firebase Firestore
- Firebase Storage
- Firebase Cloud Functions
- React Navigation
- Jest (for testing)
- React Native Testing Library (for UI tests)

## Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd new-shelf-scanner-mobile
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Firebase Configuration:**
    - Create a Firebase project in the Firebase Console.
    - Enable Firebase Authentication (Email/Password provider), Firestore, and Storage.
    - Update the `firebaseConfig` object in `src/firebase.js` with your Firebase project details.
    - **Ensure you have Firebase Functions set up and deployed (see Cloud Functions deployment instructions).**

4.  **Google Vision API:**
    - Enable the Google Cloud Vision API in your Google Cloud project (linked to your Firebase project).

## Running the App

To run the app on a simulator or physical device:

- **For iOS:**
  ```bash
  npx react-native run-ios
  ```

- **For Android:**
  ```bash
  npx react-native run-android
  ```

## Project Structure

```
new-shelf-scanner-mobile/
├── __tests__/
│   ├── App.test.js
│   └── LoginScreen.test.js
├── screens/
│   ├── AI review.js
│   ├── camera.js
│   ├── history.js
│   ├── instructions.js
│   ├── job list.js
│   └── login.js
├── .testplan.md
├── App.js
├── firebase.js
├── package.json
├── ... (other React Native project files)
```

## Testing

- **Automated Tests:** Run automated tests using Jest and React Native Testing Library.
  ```bash
  npm test
  ```
  Refer to the `__tests__` directory for test files and `.testplan.md` for the test plan.

- **Manual Testing:** Follow the manual test cases outlined in `.testplan.md`.

## Deployment

Deploying a React Native application to app stores involves several steps. Here is a general outline:

### iOS Deployment (App Store)

1.  **Set up Certificates and Provisioning Profiles:** Configure your Apple Developer account with the necessary certificates and provisioning profiles.
2.  **Configure App Identifiers:** Create an App ID for your application.
3.  **Build for Production:** Generate a production build of your iOS app using Xcode.
4.  **Archive the App:** Archive your app in Xcode.
5.  **Upload to App Store Connect:** Upload the archived app to App Store Connect.
6.  **Configure App Information:** Provide app details, screenshots, pricing, etc., in App Store Connect.
7.  **Submit for Review:** Submit your app to Apple for review.

### Android Deployment (Google Play Store)

1.  **Generate a Signed APK or App Bundle:** Generate a signed release APK or App Bundle using Android Studio or the React Native CLI.
2.  **Create a Google Play Developer Account:** If you don't have one, create a Google Play Developer account.
3.  **Create a New Application:** Create a new application in the Google Play Console.
4.  **Upload the APK or App Bundle:** Upload your signed APK or App Bundle to the Google Play Console.
5.  **Configure App Information:** Provide app details, screenshots, pricing, etc.
6.  **Publish the App:** Publish your app to the Google Play Store.

**Refer to the official React Native documentation and Apple/Google developer documentation for detailed and up-to-date instructions on deploying to app stores.**

## Contributing

(Add contributing guidelines here if applicable)

## License

(Add license information here)
