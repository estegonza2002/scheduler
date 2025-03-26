# Skeleton Loader Removal Plan

This document tracks the plan to remove skeleton loaders across the application and replace them with more appropriate loading indicators.

## Core Component Modifications

- [x] `src/components/ui/loading-state.tsx` - Modify to remove the "skeleton" type option and update implementation
- [x] `src/components/ui/skeleton.tsx` - Consider removing entirely after all usages are eliminated

## Pages

### High Priority Pages

- [x] `src/pages/DashboardPage.tsx` - Contains custom skeleton implementation
- [x] `src/pages/EmployeesPage.tsx` - Uses LoadingState with skeleton type
- [x] `src/pages/ProfilePage.tsx` - Replaced custom skeleton loaders with LoadingState
- [x] `src/pages/LocationsPage.tsx` - Uses LoadingState with skeleton type
- [x] `src/pages/EmployeeDetailPage.tsx` - Uses LoadingState with skeleton type
- [x] `src/pages/EmployeeEarningsPage.tsx` - Uses LoadingState with skeleton type

### Medium Priority Pages

- [x] `src/pages/LocationFinancialReportPage.tsx` - Uses LoadingState with skeleton type
- [x] `src/pages/LocationEmployeesPage.tsx` - Uses LoadingState with skeleton type
- [x] `src/pages/LocationInsightsPage.tsx` - Uses LoadingState with skeleton type
- [x] `src/pages/LocationDetailPage.tsx` - Uses LoadingState with skeleton type
- [x] `src/pages/EditShiftPage.tsx` - Uses LoadingState with skeleton type
- [x] `src/pages/LocationShiftPage.tsx` - Uses LoadingState with skeleton type

### Other Pages with Loading States

- [x] `src/pages/BusinessProfilePage.tsx` - Replaced custom spinner with LoadingState
- [x] `src/pages/BillingPage.tsx` - Replaced custom spinner with LoadingState
- [x] `src/pages/BrandingPage.tsx` - Has isLoading states
- [x] `src/pages/ResetPasswordPage.tsx` - Has isLoading states
- [x] `src/pages/SchedulePage.tsx` - Imports LoadingState
- [x] `src/pages/AdminDashboardPage.tsx` - Uses Skeleton component

## Components

- [x] `src/components/ShiftCreationForm.tsx` - Uses LoadingState with skeleton type
- [x] `src/components/OrganizationSelector.tsx` - Uses LoadingState with skeleton type
- [x] `src/components/ScheduleCalendar.tsx` - Already uses spinner type
- [x] `src/components/ui/sidebar.tsx` - Replaced SidebarMenuSkeleton with spinner
- [x] `src/components/EmployeeForm.tsx` - Removed unused LoadingState import

## Implementation Strategy

1. For each component/page:

   - Replace skeleton loaders with spinner or dots type in the LoadingState component
   - Remove `skeletonCount`, `skeletonHeight`, and `skeletonClassName` props
   - For custom skeleton implementations, replace with appropriate loading indicators

2. After all replacements:
   - Update the LoadingState component to remove the skeleton type option
   - Consider removing the Skeleton component if no longer needed

## Progress Tracking

- Total files to modify: 24
- Files completed: 24
- Progress: 100% of high and medium priority items

## Final Steps

- [x] Remove `src/components/ui/skeleton.tsx` entirely, as it's no longer needed for loading states
- [x] Remove all imports of the Skeleton component across the application
- [x] The component has been completely removed from the application

## Notes

- When replacing skeleton loaders, prefer using the "spinner" type for form submissions and data fetching
- For list views, consider using the "dots" type for a more subtle loading indicator
- Review each implementation to ensure the loading state does not cause layout shifts
