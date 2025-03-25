# UI Standardization Plan

This document outlines the specific actions to standardize the UI across the Employee Shift Scheduler application and tracks progress.

## Phase 1: Create Common Components

We need to develop these common components that don't currently exist or need standardization:

| Component        | Status    | Notes                                                                       |
| ---------------- | --------- | --------------------------------------------------------------------------- |
| PageHeader       | Completed | Created reusable page header component with title, description, and actions |
| ContentContainer | Completed | Created wrapper component with consistent padding and max-width             |
| ContentSection   | Completed | Created component for dividing content into logical sections                |
| SearchInput      | Completed | Created standardized search input component                                 |
| FilterGroup      | Completed | Created component for organizing filter controls                            |
| EmptyState       | Completed | Created consistent empty state component                                    |
| LoadingState     | Completed | Created consistent loading state component                                  |
| ItemCard         | Completed | Created card component for grid layouts                                     |
| FormSection      | Completed | Created component for grouping related form fields                          |
| AlertCard        | Completed | Created component for displaying messages that need attention               |
| ConfirmDialog    | Completed | Created component for confirming destructive actions                        |

## Phase 2: Page Standardization

Update all pages to use new standard components and consistent layouts:

| Page                | Status    | Notes                                                                                            |
| ------------------- | --------- | ------------------------------------------------------------------------------------------------ |
| DashboardPage       | Completed | Updated to use PageHeader, ContentContainer, and ContentSection                                  |
| AdminDashboardPage  | Completed | Updated to use PageHeader, ContentContainer, and ContentSection                                  |
| EmployeesPage       | Completed | Updated to use PageHeader, ContentContainer, SearchInput, FilterGroup, and EmptyState components |
| LocationsPage       | Completed | Updated to use PageHeader, ContentContainer, SearchInput, FilterGroup, and EmptyState components |
| SchedulePage        | Completed | Updated to use PageHeader, ContentContainer, and ContentSection components                       |
| DailyShiftsPage     | Completed | Updated to use PageHeader, ContentContainer, and LoadingState components                         |
| ProfilePage         | Completed | Updated to use PageHeader, ContentContainer, and FormSection components                          |
| BusinessProfilePage | Completed | Updated to use PageHeader, ContentContainer, and FormSection components                          |
| BillingPage         | Completed | Updated to use PageHeader, ContentContainer, and ContentSection components                       |
| NotificationsPage   | Completed | Updated to use PageHeader and ContentContainer                                                   |
| MessagesPage        | Completed | Updated to use PageHeader and ContentContainer                                                   |
| EmployeeDetailPage  | Completed | Updated to use PageHeader, ContentContainer, and ContentSection components                       |
| LocationDetailPage  | Completed | Updated to use PageHeader, ContentContainer, and ContentSection components                       |
| ShiftDetailsPage    | Completed | Updated to use PageHeader, ContentContainer, and ContentSection components                       |
| EditShiftPage       | Completed | Updated to use PageHeader, ContentContainer, and FormSection components                          |
| LoginPage           | Completed | Updated to use ContentContainer with consistent styling                                          |
| SignUpPage          | Completed | Updated to use ContentContainer with consistent styling                                          |
| BusinessSignUpPage  | Completed | Updated to use ContentContainer and FormSection components                                       |

## Phase 3: Component Standardization

Update existing components to follow the standards:

| Component            | Status    | Notes                                                              |
| -------------------- | --------- | ------------------------------------------------------------------ |
| AppSidebar           | Completed | Updated with proper sidebar structure and organization             |
| ScheduleCalendar     | Completed | Applied consistent styling, loading, and empty states              |
| DailyShiftsView      | Completed | Applied consistent styling, filters, and empty states              |
| ShiftCreationForm    | Completed | Applied consistent form styling with FormSection                   |
| EmployeeForm         | Completed | Applied consistent form styling with FormSection                   |
| NotificationItem     | Completed | Applied consistent Card-based styling with improved UI             |
| OrganizationSelector | Completed | Updated with standardized UI components and layout                 |
| VersionSwitcher      | Completed | Enhanced with tooltips, badges, and improved dropdown              |
| AddEmployeeDialog    | Completed | Updated with improved layout, tooltips, and scrolling              |
| EditEmployeeDialog   | Completed | Updated with consistent dialog styling and success feedback        |
| DeleteEmployeeDialog | Completed | Enhanced with improved warning UI and loading feedback             |
| AddLocationDialog    | Completed | Updated with scrollable content and improved success state         |
| EditLocationDialog   | Completed | Updated with consistent styling and enhanced UX feedback           |
| DeleteLocationDialog | Completed | Enhanced with improved warning UI and detailed info display        |
| LocationDetailDialog | Completed | Updated with organized content sections and responsive layout      |
| EmployeeDetailDialog | Completed | Enhanced with scrollable content and improved information display  |
| BulkEmployeeUpload   | Completed | Enhanced with FormSection structure, tooltips, and success states  |
| ShiftCreationWizard  | Completed | Improved with ScrollArea, error handling, and better documentation |

## Phase 4: Header Standardization and UI Consistency

Address duplicate headers and ensure consistent UI patterns across the application:

| Task                                   | Status      | Notes                                                                              |
| -------------------------------------- | ----------- | ---------------------------------------------------------------------------------- |
| Header Audit                           | Completed   | Identified all instances of duplicate headers across the app                       |
| Header Standardization Plan            | Completed   | Created plan for header standardization in HeaderStandardizationPlan.md            |
| DialogHeader Component Creation        | Completed   | Created standardized DialogHeader component for all dialogs                        |
| Header Documentation                   | Completed   | Created HeaderComponentGuide.md with usage guidelines                              |
| AppLayout Header Update                | Completed   | Updated AppLayout to use a minimal header that doesn't conflict with PageHeader    |
| Dialog Component Updates               | In Progress | Started updating dialogs to use the new DialogHeader (AddEmployeeDialog completed) |
| Layout Component Restructuring         | In Progress | Updated AdminDashboardPage to prevent duplicate headers                            |
| Mobile Header Optimization             | Not Started | Optimize headers for mobile view with consistent patterns                          |
| Header-Content Spacing Standardization | Completed   | Created header spacing utility components and documentation                        |
| Global Header Implementation           | Completed   | Created layout context to pass header info from pages to AppLayout                 |
| Page Header Spacing Standardization    | In Progress | Started updating pages to use the new header spacing components                    |

## Progress Tracking

### Completed Items

- Created UI standards documentation
- Created component guide
- Created standardization plan
- Created PageHeader component
- Created ContentContainer component
- Created ContentSection component
- Created SearchInput component
- Created EmptyState component
- Created LoadingState component
- Created FilterGroup component
- Created FormSection component
- Created AlertCard component
- Created ItemCard component
- Created ConfirmDialog component
- Updated DashboardPage to use standardized components
- Updated EmployeesPage to use standardized components
- Updated LocationsPage to use standardized components
- Updated SchedulePage to use standardized components
- Updated DailyShiftsPage to use standardized components
- Updated ProfilePage to use standardized components
- Updated BusinessProfilePage to use standardized components
- Updated AdminDashboardPage to use standardized components
- Updated BillingPage to use standardized components
- Updated NotificationsPage to use standardized components
- Updated MessagesPage to use standardized components
- Updated EmployeeDetailPage to use standardized components
- Updated LocationDetailPage to use standardized components
- Updated ShiftDetailsPage to use standardized components
- Updated EditShiftPage to use standardized components
- Updated LoginPage to use standardized components
- Updated SignUpPage to use standardized components
- Updated BusinessSignUpPage to use standardized components
- Updated AppSidebar to follow standardized component structure
- Standardized ScheduleCalendar component
- Standardized DailyShiftsView component
- Standardized ShiftCreationForm component
- Standardized EmployeeForm component
- Standardized NotificationItem component
- Standardized OrganizationSelector component
- Standardized VersionSwitcher component
- Standardized AddEmployeeDialog component
- Standardized EditEmployeeDialog component
- Standardized DeleteEmployeeDialog component
- Standardized AddLocationDialog component
- Standardized EditLocationDialog component
- Standardized DeleteLocationDialog component
- Standardized LocationDetailDialog component
- Standardized EmployeeDetailDialog component
- Standardized BulkEmployeeUpload component
- Standardized ShiftCreationWizard component
- Completed header audit across the application
- Created header standardization plan document
- Created standardized DialogHeader component
- Created header component usage guide
- Updated AppLayout header to follow standards
- Updated AddEmployeeDialog to use new DialogHeader
- Modified AppLayout to use a minimal header approach
- Updated AdminDashboardPage to work with the streamlined header structure
- Updated EditLocationDialog to use the new DialogHeader component
- Created dialog migration guide for developers
- Updated EmployeeDetailDialog to use the new DialogHeader component
- Updated DeleteEmployeeDialog to use the new DialogHeader component
- Created dialog header checker tool (scripts/check-dialog-headers.js)
- Created header-content-spacing utility components for consistent spacing
- Created HeaderSpacingGuide.md with comprehensive documentation
- Updated DashboardPage to use standardized header spacing components
- Added CSS variables for consistent header spacing
- Updated ShiftDetailsPage to use standardized header spacing components
- Created HeaderSpacingUpdatePlan.md with step-by-step migration instructions
- Fixed duplicate header issue in AdminDashboardPage by removing extra PageHeader
- Created layout context to share header information between pages and AppLayout
- Updated AppLayout to display page titles, descriptions, and actions

### In Progress

- Dialog Component Updates - continuing to update remaining dialogs to use the new DialogHeader component
- Layout Component Restructuring - updating page layouts to work with the streamlined header approach
- Global Header Implementation - addressing duplicate headers across the application
- Page Header Spacing Standardization - updating all pages to use the new header spacing components

### Developer Tools

To help with the standardization process, we've created the following tools:

#### 1. Dialog Header Checker

A command-line utility to check dialog components for header standardization:

```bash
node scripts/check-dialog-headers.js
```

This tool scans the `components` directory for dialog components and reports:

- Which components have been standardized
- Which components need migration
- Components with no dialog header

Use this tool to track your progress in updating dialog headers.
