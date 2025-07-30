# New Shelf Scanner Admin Dashboard

## Project Description

The New Shelf Scanner Admin Dashboard is a React application that provides administrators with a interface to manage shelf scanning jobs, review results from the mobile app, and generate reports. It integrates with Firebase for authentication, Firestore for data management, and Cloud Functions for backend processing.

## Technologies Used

- React
- Firebase Authentication
- Firebase Firestore
- Firebase Cloud Functions
- (Add any UI libraries used, e.g., Material UI, Ant Design)

## Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd new-shelf-scanner-admin
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Firebase Configuration:**
    - Create a Firebase project in the Firebase Console (the same project as the mobile app).
    - Enable Firebase Authentication (Email/Password provider), Firestore, and Storage.
    - **Set up Firebase Hosting and Cloud Functions.**
    - Create a `.env.local` file in the `new-shelf-scanner-admin/` directory and add your Firebase project configuration as environment variables (see `.env.local.example` if provided, otherwise refer to `.env.local` that was created earlier).

4.  **Firebase Security Rules and Indexes:**
    - Deploy the Firestore security rules defined in `firebase.rules`.
    - Deploy the Firestore indexes defined in `firestore.indexes.json`.

## Running the App Locally

To run the admin dashboard locally:

1.  **Start Firebase Emulators:** In your Firebase project directory, start the necessary emulators.
    ```bash
    firebase emulators:start --only auth,firestore,functions,hosting
    ```

2.  **Run the React app:** In the `new-shelf-scanner-admin/` directory:
    ```bash
    npm start # Or your build tool's command (e.g., npm run dev for Vite)
    ```

## Project Structure

```
new-shelf-scanner-admin/
├── src/
│   ├── LoginPage.jsx
│   ├── JobQueuePage.jsx
│   ├── JobReviewPage.jsx
│   └── ReportsDashboard.jsx
├── .github/workflows/
│   └── deploy.yml
├── __tests__/
│   └── firestore.test.js
├── .env.local
├── firebase.json
├── firebase.rules
├── firestore.indexes.json
├── package.json
├── ... (other React project files)
```

## Testing

- **Firestore Security Rules Tests:** Run tests for your Firestore security rules using the Firebase Test SDK.
  ```bash
  npm test # If configured in package.json
  ```
  Refer to the `__tests__/firestore.test.js` file.

- **Component Tests:** (Add instructions for running React component tests if you write them)

## Deployment (Firebase Hosting)

The admin dashboard is automatically deployed to Firebase Hosting via GitHub Actions on pushes to the `main` branch.

1.  **Set up GitHub Secrets:** Ensure you have added your Firebase Service Account and Firebase configuration environment variables as GitHub Secrets in your repository settings.
2.  **Push to Main Branch:** Push your code changes to the `main` branch to trigger the CI/CD workflow.

(Refer to `.github/workflows/deploy.yml` for the workflow configuration.)

## Cloud Functions Deployment

To deploy your Cloud Functions to Firebase:

1.  **Navigate to the functions directory:**
    ```bash
    cd new-shelf-scanner-functions
    ```

2.  **Install functions dependencies:**
    ```bash
    npm install
    ```

3.  **Deploy functions:** In your Firebase project directory, use the Firebase CLI.
    ```bash
    firebase deploy --only functions
    ```

**Ensure you have the Firebase CLI installed and are logged in to your Firebase account (`firebase login`) and have selected the correct Firebase project (`firebase use <project_id>`).**

## Contributing

(Add contributing guidelines here if applicable)

## License

(Add license information here)
