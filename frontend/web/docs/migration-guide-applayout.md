# Migration Guide: PageLayout to AppLayout

This document outlines the process for migrating from the `PageLayout` components to the newer `AppLayout` components.

## Overview

We are migrating away from the `PageLayout` components in favor of the `AppLayout` components. This change is aimed at creating a more consistent UI experience and better integration with our application structure.

## Component Mapping

Here's how the old components map to the new ones:

| Old Component     | New Component         | Notes                                  |
| ----------------- | --------------------- | -------------------------------------- |
| `PageLayout`      | No direct replacement | Use `AppContent` directly              |
| `PageHeader`      | `AppHeader`           | Used for section header styling        |
| `PageTitle`       | `AppTitle`            | Main heading for pages                 |
| `PageDescription` | `AppDescription`      | Supplementary text below titles        |
| `PageContent`     | `AppContent`          | Main content container                 |
| `PageFooter`      | `AppFooter`           | Footer section with consistent styling |

## Migration Status

### Completed Pages

- ✅ PricingPage
- ✅ BillingPage
- ✅ MessagesPage
- ✅ ProfilePage
- ✅ EmployeesPage
- ✅ BrandingPage
- ✅ BusinessProfilePage
- ✅ DailyShiftsPage
- ✅ LocationsPage
- ✅ SchedulesPage
- ✅ MyShiftsPage
- ✅ NotificationsPage
- ✅ ShiftDetailsPage
- ✅ LocationInsightsPage
- ✅ LocationDetailPage
- ✅ AdminDashboardPage
- ✅ EmployeeDetailPage
- ✅ LocationEmployeesPage
- ✅ DashboardPage
- ✅ AccountPage
- ✅ ReportsPage
- ✅ EditShiftPage
- ✅ ShiftLogDetailsPage
- ✅ MyLocationsPage
- ✅ LocationShiftPage

### Pages Still Needing Migration

- ✅ LocationFinancialReportPage
- ✅ DesignSystemShowcasePage
- ✅ UsersManagementPage
- ⚠️ SettingsPage (not found in codebase)
- ⚠️ AnalyticsPage (not found in codebase)
- ⚠️ ShiftExchangePage (not found in codebase)
- ⚠️ AvailabilityPage (not found in codebase)
- ⚠️ TimesheetPage (not found in codebase)
- ⚠️ CreateEmployeePage (not found in codebase)

## Migration Steps

1. **Update imports**:

   ```tsx
   // Old
   import { PageLayout, PageContent } from "@/components/layout/PageLayout";

   // New
   import {
   	AppContent,
   	AppHeader,
   	AppTitle,
   	AppDescription,
   	AppFooter,
   } from "@/components/layout/AppLayout";
   ```

2. **Replace PageHeader component**:
   If you're using the PageHeader component with `title` and `description` props:

   ```tsx
   // Old
   <PageHeader
     title="Messages"
     description="Communicate with your team and manage conversations"
   />

   // New - Use AppHeader with AppTitle and AppDescription (Preferred Method)
   <AppHeader>
     <AppTitle>Messages</AppTitle>
     <AppDescription>Communicate with your team and manage conversations</AppDescription>
   </AppHeader>
   ```

   _Note: Always use the shadcn-based AppHeader components rather than custom div structures. This maintains consistency across the application and leverages the design system properly._

3. **Replace PageLayout and PageContent**:

   ```tsx
   // Old
   <PageLayout>
     <PageContent>{content}</PageContent>
   </PageLayout>

   // New
   <AppContent>{content}</AppContent>
   ```

4. **Update Footer sections**:

   ```tsx
   // Old
   <PageFooter>Footer content</PageFooter>

   // New
   <AppFooter>Footer content</AppFooter>
   ```

## Examples

### Simple Page

```tsx
// Old
<PageHeader
  title="Billing & Subscription"
  description="Manage your subscription plan and payment methods"
/>
<PageLayout>
  <PageContent>{renderContent()}</PageContent>
</PageLayout>

// New
<div className="mb-6">
  <h1 className="text-2xl font-bold tracking-tight">Billing & Subscription</h1>
  <p className="mt-2 text-muted-foreground">Manage your subscription plan and payment methods</p>
</div>
<AppContent>{renderContent()}</AppContent>
```

### Page with Complex Layout

```tsx
// Old
<PageLayout>
  <div className="flex">
    <div className="w-64 flex-shrink-0">
      {sidebar}
    </div>
    <PageContent className="flex-1">
      {content}
    </PageContent>
  </div>
</PageLayout>

// New
<div className="flex">
  <div className="w-64 flex-shrink-0">
    {sidebar}
  </div>
  <AppContent className="flex-1">
    {content}
  </AppContent>
</div>
```

## Additional Notes

- The `AppLayout` components use the same shadcn/UI Card components under the hood
- AppLayout components maintain the same className patterns for consistency
- These components have been designed to work well with our application structure
- The migration should be done page by page to ensure proper testing

This migration guide will be updated as needed during the implementation process.

## Migration Status Update

As of the latest update, all existing pages in the codebase have been successfully migrated from the old `PageLayout` components to the new `AppLayout` components. The remaining pages mentioned in the "Pages Still Needing Migration" section were not found in the current codebase and may be planned for future development.

When these pages are created, they should use the new `AppLayout` components from the start rather than the deprecated `PageLayout` components.
