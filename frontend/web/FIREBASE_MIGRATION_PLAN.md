# Supabase to Firebase Migration Plan

This document outlines the steps to migrate the application backend from Supabase to Firebase.

## Phase 1: Setup and Configuration

1.  **Create Firebase Project:**
    - Set up a new project on the Firebase console ([https://console.firebase.google.com/](https://console.firebase.google.com/)).
    - Enable required services: Authentication, Firestore (or Realtime Database), Storage (if needed), Cloud Functions (if needed).
2.  **Install Firebase SDK:**
    - Add the Firebase JavaScript SDK to the project: `npm install firebase` or `yarn add firebase`.
3.  **Configure Firebase Client:**
    - Create a Firebase configuration file (e.g., `src/lib/firebase.ts`).
    - Initialize Firebase with project credentials (use environment variables for keys).
    - Export necessary Firebase service instances (auth, firestore, storage).
4.  **Update Environment Variables:**
    - Add Firebase project configuration keys (`apiKey`, `authDomain`, `projectId`, etc.) to `.env` files.
    - Remove Supabase environment variables (`SUPABASE_URL`, `SUPABASE_ANON_KEY`).

## Phase 2: Authentication Migration

1.  **Implement Firebase Auth:**
    - Set up Firebase authentication listeners (e.g., `onAuthStateChanged`) to manage user sessions.
    - Integrate Firebase Auth providers (Email/Password, Google, etc.) as needed.
2.  **Refactor Auth Context:**
    - Replace the existing `AuthContext` (`src/contexts/AuthContext.tsx`) logic.
    - Update the context provider to use Firebase Auth state and methods.
    - Update components using `useAuth` to reflect Firebase's API.
3.  **Rewrite Auth UI/Flows:**
    - Update components responsible for Login, Signup, Password Reset, Logout.
    - Replace Supabase Auth calls (`supabase.auth.signInWithPassword`, `supabase.auth.signUp`, etc.) with Firebase equivalents (`signInWithEmailAndPassword`, `createUserWithEmailAndPassword`, etc.).
    - **(Since there's no user data migration, existing users will need to re-signup).**

## Phase 3: Database Refactoring

1.  **Choose Database:**
    - _Decision Needed:_ Select Firestore (recommended for most cases) or Realtime Database.
2.  **Schema Design (Firestore/RealtimeDB):**
    - Design the schema in the chosen NoSQL database, considering document/collection structure, potential denormalization for performance, and indexing needs.
    - _(Note: Since there's no data migration, we are defining the schema from scratch based on application requirements)._
    - Update naming conventions to camelCase as per `naming-conventions.mdc`.
3.  **Refactor Data Access Code:**
    - Identify all files making Supabase database calls (check `src/lib/*.tsx`, page components like `src/pages/EmployeesPage.tsx`, etc.).
    - Replace Supabase client calls (`supabase.from(...).select()`, `.insert()`, `.update()`, `.delete()`) with Firebase SDK equivalents (`getDoc`, `addDoc`, `updateDoc`, `deleteDoc`, `query`, `onSnapshot`, etc.).
    - Define and use data structures and types in the frontend to match the new Firebase schema.

## Phase 4: Storage Refactoring (If Used)

1.  **Set Up Firebase Storage:**
    - Ensure Firebase Storage is enabled in the Firebase console.
    - Configure Storage rules for security.
2.  **Refactor Storage Code:**
    - Replace Supabase Storage calls (`supabase.storage.from(...).upload()`, `.download()`, `.getPublicUrl()`) with Firebase Storage equivalents (`ref`, `uploadBytes`, `getDownloadURL`, `deleteObject`).
    - Update UI components involved in file uploads/downloads/display.
    - _(Note: No existing file migration is needed)._

## Phase 5: Backend Functions Migration (If Used)

1.  **Identify Supabase Edge Functions:**
    - Review the `supabase/functions` directory.
2.  **Rewrite as Firebase Cloud Functions:**
    - Translate the logic of each Edge Function into Node.js using the Firebase Functions SDK (`firebase-functions`) and Admin SDK (`firebase-admin`).
    - Adapt triggers (HTTP, Firestore triggers, Auth triggers, etc.).
3.  **Deploy and Test Functions:**
    - Deploy functions using the Firebase CLI (`firebase deploy --only functions`).
    - Test function endpoints and triggers thoroughly.

## Phase 6: Cleanup and Testing

1.  **Remove Supabase Dependencies:**
    - Uninstall Supabase packages: `npm uninstall @supabase/supabase-js @supabase/auth-helpers-react @supabase/auth-ui-react` (or yarn equivalent).
    - Remove Supabase client initialization (`src/lib/supabase.ts`).
    - Delete any remaining Supabase-specific code, contexts, or utility functions.
2.  **Address Build/Runtime Issues:**
    - Fix any errors or warnings arising during the migration (like potential path alias issues noted previously).
    - Ensure Vite's HMR/Fast Refresh works correctly.
3.  **Comprehensive Testing:**
    - Perform end-to-end testing of all user flows:
      - Authentication (signup, login, logout, reset password)
      - Data CRUD operations (creating, reading, updating, deleting locations, employees, shifts, etc.)
      - File uploads/downloads (if applicable)
      - Any features relying on Cloud Functions
    - Test across different user roles (admin, employee).
    - Verify data consistency and correctness.

## Phase 7: Deployment

1.  **Configure Production Environment:**
    - Ensure production environment variables are updated with Firebase keys.
    - Set up production Firebase project configurations (database rules, storage rules, auth settings).
2.  **Deploy Application:**
    - Deploy the updated frontend application to the hosting provider.
3.  **Post-Deployment Monitoring:**
    - Monitor application logs and Firebase console for any issues.
