# Firestore Schema Documentation

This document outlines the structure of the Firestore database used by the application after migrating from Supabase. Field names use `camelCase`.

## Collections

### `organizations`

- **Purpose:** Stores details about each organization using the platform.
- **Document ID:** Auto-generated Firestore ID.
- **Fields:**
  - `createdAt` (Timestamp): Timestamp when the organization document was created.
  - `updatedAt` (Timestamp): Timestamp when the organization document was last updated.
  - `name` (String): The display name of the organization. (Required)
  - `description` (String, Optional): A brief description of the organization.
  - `logoUrl` (String, Optional): URL to the organization's logo image.
  - `ownerId` (String): Firebase UID of the user who owns the organization. (Required)
  - `subscriptionId` (String): Identifier for the subscription (e.g., from Stripe). Defaults to 'free_subscription'.
  - `subscriptionStatus` (String): Status of the subscription (e.g., 'active', 'trialing', 'canceled'). Defaults to 'active'.
  - `subscriptionPlan` (String): Name of the subscription plan (e.g., 'free', 'pro'). Defaults to 'free'.
  - `stripeCustomerId` (String, Optional): The organization's customer ID in Stripe.

### `users`

- **Purpose:** Stores application-specific user data, linked to Firebase Authentication users.
- **Document ID:** Firebase User UID (`auth.currentUser.uid`).
- **Fields:**
  - `createdAt` (Timestamp): Timestamp when the Firestore user document was created.
  - `email` (String): User's email address (from Firebase Auth). (Required)
  - `displayName` (String, Optional): User's display name (from Firebase Auth or combined first/last name).
  - `firstName` (String, Optional): User's first name.
  - `lastName` (String, Optional): User's last name.
  - `photoUrl` (String, Optional): URL to the user's profile picture (from Firebase Auth).
  - `currentOrganizationId` (String, Optional): The ID (document ID from `organizations`) of the organization the user is currently interacting with or last selected.
  - `organizationRoles` (Map<String, String>): Denormalized roles for quick access control checks.
    - _Key:_ Organization ID (document ID from `organizations`).
    - _Value:_ User's role within that organization ('owner', 'admin', 'member').

### `organizationMembers`

- **Purpose:** Explicitly lists the relationship between users and organizations, including their role. Useful for querying all members of an organization. Supplements `users.organizationRoles`.
- **Document ID:** Auto-generated Firestore ID (or potentially a composite ID like `{organizationId}_{userId}`).
- **Fields:**
  - `createdAt` (Timestamp): Timestamp when the membership record was created.
  - `organizationId` (String): The ID (document ID from `organizations`) of the organization. (Required)
  - `userId` (String): The ID (Firebase UID) of the user. (Required)
  - `role` (String): User's role within this specific organization ('owner', 'admin', 'member'). (Required)

### `employees`

- **Purpose:** Stores details about employees belonging to an organization. Can be linked to a `users` document if the employee is also an app user.
- **Document ID:** Auto-generated Firestore ID.
- **Fields:**
  - `createdAt` (Timestamp): Timestamp when the employee record was created.
  - `updatedAt` (Timestamp): Timestamp when the employee record was last updated.
  - `organizationId` (String): The ID (document ID from `organizations`) of the organization this employee belongs to. (Required)
  - `userId` (String, Optional): The Firebase UID if this employee corresponds to an authenticated app user.
  - `firstName` (String): Employee's first name. (Required)
  - `lastName` (String): Employee's last name. (Required)
  - `email` (String): Employee's email address. (Required)
  - `phone` (String, Optional): Employee's phone number.
  - `position` (String, Optional): Employee's job title or position.
  - `hireDate` (Timestamp, Optional): Date the employee was hired.
  - `address` (String, Optional): Employee's full address (consider breaking down if needed for specific queries).
  - `emergencyContact` (String, Optional): Emergency contact information.
  - `notes` (String, Optional): General notes about the employee.
  - `avatarUrl` (String, Optional): URL to the employee's profile picture.
  - `hourlyRate` (Number, Optional): Employee's hourly pay rate.
  - `status` (String): Employment status (e.g., 'active', 'inactive', 'invited', 'terminated'). (Required)
  - `isOnline` (Boolean, Optional): Indicates if the employee is currently marked as online.
  - `lastActive` (Timestamp, Optional): Timestamp of the employee's last activity.
  - `lastInviteSent` (Timestamp, Optional): Timestamp when the last invitation email was sent (if applicable).
  - `assignedLocationIds` (Array<String>): List of IDs (document IDs from `locations`) this employee is assigned to or works at.

### `locations`

- **Purpose:** Stores details about physical locations associated with an organization.
- **Document ID:** Auto-generated Firestore ID.
- **Fields:**
  - `createdAt` (Timestamp): Timestamp when the location record was created.
  - `updatedAt` (Timestamp): Timestamp when the location record was last updated.
  - `organizationId` (String): The ID (document ID from `organizations`) of the organization this location belongs to. (Required)
  - `name` (String): The display name of the location. (Required)
  - `addressLine1` (String): The primary street address. (Required)
  - `city` (String): The city. (Required)
  - `state` (String): The state or province. (Required)
  - `zipCode` (String, Optional): The postal code.
  - `country` (String): The country. (Required, can be defaulted)
  - `isActive` (Boolean, Optional): Indicates if the location is currently active or operational. Defaults to `true`.
  - `geoPosition` (GeoPoint, Optional): Geographical coordinates for mapping and geo-queries.
  - `imageUrl` (String, Optional): URL to an image of the location.

### `shifts`

- **Purpose:** Stores scheduled work shifts for users (employees or admins) within an organization, potentially at a specific location.
- **Document ID:** Auto-generated Firestore ID.
- **Fields:**
  - `createdAt` (Timestamp): Timestamp when the shift record was created.
  - `updatedAt` (Timestamp): Timestamp when the shift record was last updated.
  - `organizationId` (String): The ID (document ID from `organizations`) of the organization this shift belongs to. (Required)
  - `userId` (String): The Firebase UID of the user assigned to this shift. (Required)
  - `locationId` (String, Optional): The ID (document ID from `locations`) where the shift takes place.
  - `startTime` (Timestamp): The date and time the shift begins. (Required)
  - `endTime` (Timestamp): The date and time the shift ends. (Required)
  - `name` (String, Optional): A specific name for the shift (e.g., "Opening Shift").
  - `description` (String, Optional): Notes or details about the shift.
  - `status` (String): The status of the shift (e.g., 'draft', 'published', 'started', 'completed', 'cancelled', 'missed'). (Required)
  - `parentShiftId` (String, Optional): The ID of a template or recurring shift this instance is based on.
  - `scheduleId` (String, Optional): The ID of a broader schedule this shift belongs to (if applicable).
  - `isSchedule` (Boolean, Optional): Indicates if this record represents a template/schedule definition rather than an actual assigned shift.
  - `checkInTasks` (Map<String, Any>, Optional): A map representing tasks to be completed upon check-in. Structure TBD based on requirements.
  - `checkOutTasks` (Map<String, Any>, Optional): A map representing tasks to be completed upon check-out. Structure TBD based on requirements.
