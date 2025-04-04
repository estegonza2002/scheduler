# Organization ID Cleanup Plan

## Overview

This document outlines the plan to eliminate all hardcoded organization IDs throughout the codebase. Hardcoded IDs create maintenance issues and potential bugs when switching between environments or organizations.

## User Stories

### Story 1: Verify Organization Context Functionality

**As a** developer,  
**I want** to ensure our organization context is fully functional,  
**So that** we have a reliable source of organization IDs throughout the application.

#### Tasks:

- [ ] Verify the `useOrganization` hook provides consistent access to organization data
- [ ] Confirm proper error handling for missing organization scenarios
- [ ] Test organization context with different user scenarios

---

### Story 2: Remove Hardcoded ID from Employee Detail Page

**As a** developer,  
**I want** to remove the hardcoded organization ID in EmployeeDetailPage,  
**So that** employee details properly use the current organization context.

#### Tasks:

- [ ] Fix `/src/pages/EmployeeDetailPage.tsx` (line 1392):
- [ ] Replace `const orgId = employeeData.organizationId || "org-1";` with proper context usage
- [ ] Add appropriate error handling for missing organization ID

---

### Story 3: Remove Hardcoded ID from Location Insights Page

**As a** developer,  
**I want** to remove the hardcoded organization ID in LocationInsightsPage,  
**So that** location insights always use the current organization.

#### Tasks:

- [ ] Fix `/src/pages/LocationInsightsPage.tsx` (line 93):
- [ ] Replace `const organizationId = "org-1"; // Default organization ID` with organization context
- [ ] Ensure proper loading state when organization context is initializing

---

### Story 4: Remove Hardcoded ID from Location Shift Page

**As a** developer,  
**I want** to remove the hardcoded organization ID in LocationShiftPage,  
**So that** shifts are associated with the correct organization.

#### Tasks:

- [ ] Fix `/src/pages/LocationShiftPage.tsx` (line 208):
- [ ] Replace `organizationId="org-1"` with dynamic context value
- [ ] Handle the case where organization ID might not be available

---

### Story 5: Remove Hardcoded ID from Edit Shift Page

**As a** developer,  
**I want** to remove the hardcoded organization ID in EditShiftPage,  
**So that** shift edits are properly associated with the current organization.

#### Tasks:

- [ ] Fix `/src/pages/EditShiftPage.tsx` (line 83):
- [ ] Replace `const organizationId = searchParams.get("organizationId") || "org-1";` with context-based fallback
- [ ] Verify shift edit functionality with organization context

---

### Story 6: Update API Fallback Mechanism

**As a** developer,  
**I want** to implement a better fallback approach in the API layer,  
**So that** we don't rely on hardcoded UUIDs.

#### Tasks:

- [ ] Fix `/src/api/real/api.ts` (line 462):
- [ ] Replace `data.organizationId = "79a0cd70-b7e6-4ea4-8b00-a88dfea38e25";` with appropriate error handling
- [ ] Consider implementing a proper error response when organization context is missing

---

### Story 7: Fix Hardcoded ID Check in Shift Creation Wizard

**As a** developer,  
**I want** to improve how ShiftCreationWizard checks for valid organization IDs,  
**So that** we aren't checking against a specific hardcoded value.

#### Tasks:

- [ ] Fix `/src/components/ShiftCreationWizard.tsx` (line 216):
- [ ] Replace `if (!organizationId || organizationId === "org-1") {` with more generic empty check
- [ ] Test shift creation flow with real organization context

---

### Story 8: Update Presence Channel Naming Approach

**As a** developer,  
**I want** to implement a better approach for presence channel naming,  
**So that** we don't use hardcoded fallbacks.

#### Tasks:

- [ ] Fix `/src/lib/presence.ts` (line 45):
- [ ] Replace `const channelId = \`presence-${employees[0]?.organizationId || "global"}\`;` with better fallback
- [ ] Test presence functionality with and without organization context

---

### Story 9: Create Organization Required Component

**As a** developer,  
**I want** to create a standardized component for missing organization scenarios,  
**So that** users have a consistent experience when organization context is required.

#### Tasks:

- [ ] Create a `OrganizationRequired` component that provides helpful UI when no organization exists
- [ ] Implement clear user guidance on how to resolve the missing organization issue
- [ ] Style the component according to application design guidelines

---

### Story 10: Implement Error Boundaries for Organization Context

**As a** developer,  
**I want** to add error boundaries around components requiring organization context,  
**So that** the application degrades gracefully when organization data is missing.

#### Tasks:

- [ ] Create an `OrganizationContextBoundary` component
- [ ] Implement error handling that catches missing organization errors
- [ ] Apply the boundary to critical components that require organization context

---

### Story 11: Documentation Update

**As a** developer,  
**I want** to document the patterns for accessing organization context,  
**So that** future development consistently uses the right approach.

#### Tasks:

- [ ] Update developer documentation with organization context usage patterns
- [ ] Add code comments and JSDoc where appropriate
- [ ] Create examples of proper organization context usage

---

## Progress Tracking

- [ ] Story 1 complete
- [ ] Story 2 complete
- [ ] Story 3 complete
- [ ] Story 4 complete
- [ ] Story 5 complete
- [ ] Story 6 complete
- [ ] Story 7 complete
- [ ] Story 8 complete
- [ ] Story 9 complete
- [ ] Story 10 complete
- [ ] Story 11 complete

## Implementation Notes

- Any component that needs organization ID should use the organization context
- No hardcoded IDs should remain in the codebase
- Appropriate error states should be shown when organization context is missing
- All changes should maintain backward compatibility
