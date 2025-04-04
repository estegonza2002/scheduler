# Firebase Migration Plan (Updated)

This document outlines the steps to migrate the application backend from Supabase to Firebase.

**Phase 1: Setup & Configuration (✅ Completed)**

1.  **Firebase Project Setup:** Create project, enable services, get credentials. _(Assumed complete)_
2.  **Install Firebase SDK:** `npm install firebase` _(Done)_
3.  **Configure Firebase in App:** Initialize Firebase in `src/lib/firebase.ts` using environment variables. _(Done)_
4.  **Update Environment Variables:** Add Firebase keys to `.env` and ensure Supabase keys are planned for removal. _(✅ Completed)_

---

**Phase 2: Core Feature Migration (In Progress)**

5.  **Authentication Migration:**

    - **Goal:** Replace Supabase authentication with Firebase Authentication.
    - **Actions:**
      - Swap Supabase auth functions (login, signup, logout, session checks, `onAuthStateChanged`) with Firebase Auth equivalents (`signInWithEmailAndPassword`, `createUserWithEmailAndPassword`, `signOut`, `onAuthStateChanged`, etc.) in `src/lib/auth.tsx` (or relevant context/hooks) and related components (Login, Signup pages/modals). _(✅ Completed)_
      - Refactor `AuthContext` (`src/contexts/AuthContext.tsx` or similar) if it exists, or update relevant hooks (`useAuth`). _(✅ Completed - Refactored in `src/lib/auth.tsx`)_
      - Plan and execute migration for existing users (if applicable - current plan notes re-signup). _(✅ Completed - New system requires re-signup)_
      - Update all UI components related to user authentication state. _(🚧 In Progress - Login/Signup/Protected Routes updated; Role checks & other UI pending)_

6.  **Database Migration (Firestore):**

    - **Goal:** Replace Supabase database operations with Firestore.
    - **Actions:**
      - **Choose Database:** Firestore selected.
      - **Schema Design:** Map Supabase tables (`employees`, `shifts`, `locations`, etc.) to Firestore collections/documents. Update naming to `camelCase` per `naming-conventions.mdc`. _(✅ In Progress - Schema designed for users, organizations, members)_.
      - **Refactor Data Access Code:** Replace Supabase data fetching/manipulation code (`supabase.from(...)`) with Firestore SDK calls (`getDoc`, `addDoc`, `updateDoc`, `query`, `onSnapshot`, etc.) throughout the application (check `src/lib/`, `src/pages/`, `src/components/`). Update data structures/types.
        - `OrganizationsAPI` refactored. _(✅ Completed)_
        - `UserAPI` refactored. _(✅ Completed)_
        - `OrganizationMembersAPI` refactored (getAll, updateRole, getByUserIdAndOrgId, removeMember). _(✅ Completed)_
        - `OrganizationMembersAPI.inviteUser` partially implemented (creates pending Firestore record; email sending TODO). _(✅ In Progress)_
        - `EmployeesAPI` refactored. _(✅ Completed)_
        - `LocationsAPI` refactored. _(✅ Completed)_
        - `ShiftsAPI` refactored. _(✅ Completed)_
        - `NotificationsAPI` refactored. _(✅ Completed)_
        - `ShiftAssignmentsAPI` refactored. _(✅ Completed)_
        - `EmployeeLocationsAPI` refactored. _(✅ Completed)_
        - ~ConversationsAPI~ _(❌ To be removed)_
        - ~MessagesAPI~ _(❌ To be removed)_
        - etc. _(🚧 Pending - Check BillingAPI)_
      - Plan and execute migration for existing data (requires a script - current plan notes no data migration). _(🚧 Pending - No data migration planned)_.
      - Update UI components displaying or interacting with database data.

7.  **Storage Migration (If Used):**
    - **Goal:** Replace Supabase Storage with Firebase Cloud Storage.
    - **Actions:**
      - **Set Up Firebase Storage:** Ensure enabled, configure Storage rules.
      - Replace Supabase storage functions (upload, download, delete, `getPublicUrl`) with Firebase Storage equivalents (`ref`, `uploadBytes`, `getDownloadURL`, `deleteObject`, etc.) in relevant files/components.
      - Plan and execute migration for existing files (requires a script - current plan notes no file migration).
      - Update UI components related to file handling.

---

**Phase 3: Backend Functions Migration (If Used)**

8.  **Backend Functions Migration:**
    - **Goal:** Migrate Supabase Edge Functions to Firebase Cloud Functions.
    - **Actions:**
      - Identify Supabase Edge Functions (`supabase/functions`).
      - Rewrite as Firebase Cloud Functions (Node.js, Firebase SDKs).
      - Adapt triggers (HTTP, Firestore, Auth).
      - Deploy and test functions (`firebase deploy --only functions`).

---

**Phase 4: Security & Cleanup (Remaining)**

9.  **Implement Security Rules:**

    - **Goal:** Secure your Firebase data and files.
    - **Actions:**
      - Write Firestore Security Rules (replication of Supabase RLS).
      - Write Firebase Storage Security Rules.

10. **Cleanup:** (Referencing `cleanup.mdc`)
    - **Goal:** Remove Supabase dependencies and unused code/features.
    - **Actions:**
      - Uninstall Supabase SDKs (`npm uninstall @supabase/supabase-js ...`).
      - Delete `src/lib/supabase.ts`.
      - Remove Supabase environment variables from `.env` files.
      - Remove all remaining Supabase client usage and related code/contexts/utils.
      - Remove Conversation/Messaging feature code (APIs, types, UI components, related Supabase tables if any).
      - Delete any other unused files or debugging code.

---

**Phase 5: Testing (Remaining)**

11. **Comprehensive Testing:**
    - **Goal:** Ensure the application works correctly with Firebase.
    - **Actions:**
      - Perform end-to-end testing of all user flows (Auth, CRUD, Storage, Functions).
      - Test across different user roles.
      - Verify data consistency and security rule enforcement.
      - Address any build/runtime issues (like previous import errors).

---

**Phase 6: Deployment (Remaining)**

12. **Deployment:**
    - **Goal:** Deploy the fully migrated application.
    - **Actions:**
      - Configure production environment variables and Firebase settings.
      - Deploy frontend and any Cloud Functions.
      - Monitor post-deployment.
