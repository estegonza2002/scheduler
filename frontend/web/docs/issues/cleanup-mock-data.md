# Clean Up Mock Data and Fix TypeScript Errors

## Overview

Several components are still using mock data and have TypeScript errors that need to be addressed. This cleanup is necessary after removing the mock API implementation.

## Components Requiring Updates

### 1. ScheduleCalendar.tsx

- [x] Fix TypeScript property name mismatches:
  - `startTime` → `start_time`
  - `endTime` → `end_time`
  - `locationId` → `location_id`
  - `employeeId` needs to be mapped to correct property
- [x] Remove duplicate `organizationId` declaration
- [x] Update shift filtering logic to use correct property names
- [x] Remove hardcoded location color schemes

### 2. ShiftLogDetailsPage.tsx

- [x] Replace mock shifts with real data from API
- [x] Update filtering and display logic to use real data
- [x] Remove hardcoded statuses and locations

### 3. Messages Components

#### ChatView.tsx

- [x] Replace mock conversations with real data
- [x] Implement real-time message updates
- [x] Remove hardcoded message data

#### MessageList.tsx

- [x] Replace mock conversation data with API integration
- [x] Implement proper conversation grouping
- [x] Remove hardcoded conversation types

#### NewConversationModal.tsx

- [x] Replace mock users data with real user data from API
- [x] Replace mock groups data with real groups
- [x] Implement proper user selection and validation

### 4. BillingPage.tsx

- [x] Add clear indicators for mock data
- [x] Update mock data IDs to be clearly identifiable as mock
- [x] Add TODOs and documentation for future Stripe integration
- [ ] Replace mock invoice data with real billing data (Blocked - See issues/stripe-integration.md)
- [ ] Implement proper invoice fetching and display (Blocked - See issues/stripe-integration.md)
- [ ] Remove hardcoded organization references (Blocked - See issues/stripe-integration.md)

### 5. LocationsPage.tsx

- [x] Remove mock organization data references
- [x] Implement proper organization context/selection
- [x] Update location management to use real data consistently

### 6. AdminDashboardPage.tsx

- [x] Add clear indicators for mock data
- [x] Update mock data to be clearly identifiable as mock
- [x] Add TODOs and documentation for future analytics integration
- [ ] Replace mock weekly stats data with real analytics (Blocked - See issues/analytics-integration.md)
- [ ] Implement real-time dashboard metrics (Blocked - See issues/analytics-integration.md)
- [ ] Remove hardcoded revenue and staffing data (Blocked - See issues/analytics-integration.md)

### 7. DailyShiftsPage.tsx

- [x] Replace hardcoded demonstration data with real shift data
- [x] Ensure proper data fetching from ShiftsAPI
- [x] Add loading states and error handling

### 8. LocationDetailPage.tsx

- [x] Remove fallback mock employee IDs
- [x] Implement proper employee selection logic
- [x] Add error handling for missing employee data

### 9. Presence Service (presence.ts)

- [x] Replace mock presence service with real-time implementation
- [x] Integrate with WebSocket or similar for live updates
- [x] Add proper presence status tracking
- [x] Implement proper error handling for connection issues

### 10. OnboardingModal.tsx

- [x] Replace mock schedule ID with real API integration
- [x] Add proper schedule creation/selection logic
- [x] Implement error handling for schedule operations

### 11. LocationFinanceInsights.tsx

- [x] Replace simulated base revenue calculations
- [x] Integrate with real financial data from API
- [x] Add proper revenue calculation logic
- [x] Implement historical data comparison

### 12. Notification Context (notification-context.tsx)

- [x] Remove fallback mock user IDs
- [x] Implement proper user context handling
- [x] Add error states for missing user data
- [x] Ensure proper user session management

## Implementation Notes

1. Each component should use the real API implementations from `src/api/real/api.ts`
2. All TypeScript interfaces should be properly implemented with no type errors
3. Error handling should be implemented for API calls
4. Loading states should be added where appropriate
5. Empty states should be provided when no data is available

## Dependencies

- Real API implementation must be complete and tested
- Organization context must be properly implemented
- User authentication must be properly integrated

## Testing Requirements

- [ ] Verify all components work with real data
- [ ] Ensure proper error handling
- [ ] Test loading states
- [ ] Test empty states
- [ ] Verify TypeScript compilation with no errors
- [ ] Test with different user roles and permissions

## Additional Considerations

- Consider implementing feature flags for gradual rollout
- Document any API requirements or changes needed
- Update relevant tests to use real data instead of mocks
- Consider performance implications of real API calls
- Implement proper caching where necessary

## Progress Summary

We've completed cleanup for 10 out of 12 components. The remaining 2 components (BillingPage and AdminDashboardPage) have partial cleanups with some tasks blocked pending integration with external systems (Stripe and analytics).

## Related Issues

- #xxx Remove Mock API Implementation
- #xxx Implement Real-time Updates
- #xxx User Authentication Integration
- #xxx Stripe Integration for Billing System
- #xxx Analytics System Integration
