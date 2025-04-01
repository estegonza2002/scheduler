Multi-Organization UX Enablement

🧭 Role + Org Path Selection

Story 1: Show Role + Org Path Page for New Users
As a new user after signing up or authenticating with Google, I want to be shown a screen to choose whether to start a new org or join an existing one, so I can proceed with the correct flow.

**Implementation Tasks:**

- [ ] Create new RoleSelectionPage component
- [ ] Modify AuthCallbackPage to detect new users (no role or metadata)
- [ ] Add route for /role-selection in App.tsx
- [ ] Create UI with two clear options (create org vs join org)
- [ ] Add navigation logic to appropriate next steps

**Testing:** Create a new user account and verify they're redirected to the role selection page after authentication.

**Design Notes:** Use clear iconography and minimal text to make the choice between creating vs. joining immediately obvious.

Story 2: Handle Users with No current_organization_id
As a returning user with no current org selected, I want to be routed to the org decision screen, so I'm not dropped into a broken or blank state.

**Implementation Tasks:**

- [ ] Add check in auth flow for missing current_organization_id
- [ ] Add redirection logic to organization selection page
- [ ] Handle edge case of users who had organizations but lost access
- [ ] Add error states and recovery options

**Testing:** Manually remove the current_organization_id from a test user's metadata and verify they're redirected to the organization selection page.

**Design Notes:** Include helpful error messages that explain why the user is seeing this screen rather than their expected dashboard.

Story 3: Save Org Choice to Metadata
As a user, when I select an organization, I want my current org to be saved to user metadata, so the app context stays consistent.

**Implementation Tasks:**

- [ ] Ensure updateUserMetadata function properly saves current_organization_id
- [ ] Add success/error handling for metadata updates
- [ ] Create utility function for standardized org switching
- [ ] Add validation to ensure org exists and user has access

**Testing:** Select an organization, reload the app, and verify the selected organization is still active in the UI.

**Design Notes:** Add subtle visual feedback (toast notification or animation) when organization context changes to confirm the switch was successful.

⸻

🧭 Org Selection for Existing Members

Story 4: Show Org Selection If Multiple Orgs Exist
As a user who belongs to more than one organization, I want to see a screen where I can select which org to enter after login, so I can control my current workspace.

**Implementation Tasks:**

- [ ] Create OrganizationSelectionPage component
- [ ] Modify auth flow to check for multiple memberships
- [ ] Display organization cards with relevant info (name, role, etc.)
- [ ] Add selection and navigation functionality

**Testing:** Add a test user to multiple organizations and verify they're presented with the organization selection screen after login.

**Design Notes:** Use card design with sufficient visual hierarchy to differentiate between organizations and highlight key information like role and last access date.

Story 5: Persist Org Choice Across Sessions
As a user, I want my selected org to persist across sessions, so I don't need to reselect it every time I log in.

**Implementation Tasks:**

- [ ] Ensure user metadata is loaded on authentication
- [ ] Apply org context from metadata on app initialization
- [ ] Handle fallback if saved org is no longer accessible
- [ ] Add validation logic for org access permissions

**Testing:** Select an organization, log out and log back in, and verify the last selected organization is automatically loaded.

**Design Notes:** Include subtle indicator of which organization is currently active throughout the app interface for consistent context awareness.

⸻

🧷 Organization Selector UI

Story 6: Display Org Selector in Header
As a user, I want to be able to switch organizations from the app header, so I can move between orgs without logging out.

**Implementation Tasks:**

- [ ] Create OrganizationSwitcher dropdown component
- [ ] Add component to AppHeader
- [ ] Implement organization list with selection functionality
- [ ] Style according to app design system
- [ ] Add loading states and error handling

**Testing:** Verify the organization switcher appears in the header and successfully changes the active organization when selected.

**Design Notes:** Design the dropdown to be compact yet readable, with organization names, logos (if available), and clear active state indication.

Story 7: Display Org Roles in Selector Dropdown
As a user, I want to see my role next to each org in the dropdown, so I understand my access level.

**Implementation Tasks:**

- [ ] Modify organization query to include user role
- [ ] Add role badges/indicators to organization list items
- [ ] Add tooltips explaining role permissions
- [ ] Style role indicators according to design system

**Testing:** Verify that organizations in the dropdown display the correct role for the current user with appropriate styling.

**Design Notes:** Use color-coded badges or subtle icons to indicate different role types without overwhelming the organization selector interface.

Story 8: Default to Current Org on Page Load
As a user, I want the app to automatically set the org context to the last used organization, so I don't start in a broken state.

**Implementation Tasks:**

- [ ] Ensure OrganizationProvider initializes with saved organization
- [ ] Add loading state while organization context is initializing
- [ ] Implement fallback/recovery for invalid saved organizations
- [ ] Add console warnings for debugging organization context issues

**Testing:** Refresh the application and verify the correct organization is automatically loaded without user intervention.

**Design Notes:** Create a smooth loading experience that maintains brand consistency while the organization context is being established.

⸻

🚫 Edge Case Handling

Story 9: Block Employees from Creating Orgs Without Confirmation
As an employee user, I want to be warned if I try to create an organization, so I understand it may create a new context.

**Implementation Tasks:**

- [ ] Add role check before organization creation
- [ ] Create confirmation dialog for employees creating organizations
- [ ] Add clear messaging explaining implications
- [ ] Implement cancel and proceed options with proper navigation

**Testing:** Log in as a user with employee role in an existing organization and verify a confirmation dialog appears when attempting to create a new organization.

**Design Notes:** Design the warning dialog with clear but non-intimidating language that explains the implications without discouraging legitimate organization creation.

Story 10: Allow Admins to Join as Employees with a Warning
As an admin user, if I choose to join as an employee, I want a confirmation dialog explaining I already manage another org.

**Implementation Tasks:**

- [ ] Add role check when joining an organization
- [ ] Create confirmation dialog for admins joining as employees
- [ ] Add messaging explaining the context switch implications
- [ ] Implement proceed and cancel options

**Testing:** As an admin of one organization, attempt to join another organization and verify the warning dialog appears with appropriate messaging.

**Design Notes:** Use informative dialog design with clear options and neutral language that informs without judgment about the role change implications.

Story 11: Handle Users with No Org Membership
As a user who has no orgs, I want to be clearly informed and prompted to create or join one, so I can proceed.

**Implementation Tasks:**

- [ ] Create NoOrganizationsPage component
- [ ] Add check for users with no organization memberships
- [ ] Implement options to create or join an organization
- [ ] Add clear guidance and messaging

**Testing:** Create a user with no organization memberships and verify they see the appropriate guidance page with options to create or join an organization.

**Design Notes:** Design an empty state that feels welcoming rather than error-like, with positive messaging and clear calls to action.

Story 12: Validate Org Invite or Join Code
As a user joining an existing org, I want to validate the invite code or request access, so only authorized users join organizations.

**Implementation Tasks:**

- [ ] Create OrganizationJoinPage component
- [ ] Implement invite code validation
- [ ] Add success/error states for joining attempts
- [ ] Create request access flow for users without invite codes
- [ ] Add confirmation step before joining

**Testing:** Test both valid and invalid invite codes to verify the validation works correctly and users can only join with proper authorization.

**Design Notes:** Create a stepped form with clear validation states and helpful error messages that guide users through the joining process.

⸻

## Progress Tracking

### 🧭 Role + Org Path Selection

- [ ] Story 1: Show Role + Org Path Page for New Users
- [ ] Story 2: Handle Users with No current_organization_id
- [ ] Story 3: Save Org Choice to Metadata

### 🧭 Org Selection for Existing Members

- [ ] Story 4: Show Org Selection If Multiple Orgs Exist
- [ ] Story 5: Persist Org Choice Across Sessions

### 🧷 Organization Selector UI

- [ ] Story 6: Display Org Selector in Header
- [ ] Story 7: Display Org Roles in Selector Dropdown
- [ ] Story 8: Default to Current Org on Page Load

### 🚫 Edge Case Handling

- [ ] Story 9: Block Employees from Creating Orgs Without Confirmation
- [ ] Story 10: Allow Admins to Join as Employees with a Warning
- [ ] Story 11: Handle Users with No Org Membership
- [ ] Story 12: Validate Org Invite or Join Code
