# Global Header Implementation Checklist

## Core Implementation

1. [x] Create HeaderProvider context in `src/lib/header-context.tsx`
2. [x] Implement useHeader() hook for updating header content
3. [x] Update AppLayout.tsx to include global header using context
4. [x] Remove layout-context.tsx header management (deprecated)

## Page Migrations

5. [x] Update EmployeesPage to use the new useHeader() hook
6. [x] Update LocationsPage to use the new useHeader() hook
7. [x] Update DailyShiftsPage to use the new useHeader() hook
8. [x] Update ProfilePage to use the new useHeader() hook
9. [x] Update BillingPage to use the new useHeader() hook
10. [x] Update BrandingPage to use the new useHeader() hook
11. [x] Update BusinessProfilePage to use the new useHeader() hook
12. [x] Update SchedulesPage to use the new useHeader() hook
13. [x] Update MyShiftsPage to use the new useHeader() hook
14. [x] Update NotificationsPage to use the new useHeader() hook
15. [x] Update ShiftDetailsPage to use the new useHeader() hook
16. [x] Update LocationInsightsPage to use the new useHeader() hook
17. [x] Update LocationDetailPage to use the new useHeader() hook
18. [x] Update AdminDashboardPage to use the new useHeader() hook
19. [x] Update EmployeeDetailPage to use the new useHeader() hook
20. [x] Update LocationEmployeesPage to use the new useHeader() hook
21. [x] Update DashboardPage to use the new useHeader() hook
22. [x] Update AccountPage to use the new useHeader() hook
23. [x] Update ReportsPage to use the new useHeader() hook
24. [x] Update EditShiftPage to use the new useHeader() hook
25. [x] Update ShiftLogDetailsPage to use the new useHeader() hook
26. [x] Update MyLocationsPage to use the new useHeader() hook
27. [x] Update LocationShiftPage to use the new useHeader() hook
28. [x] Update LocationFinancialReportPage to use the new useHeader() hook
29. [x] Update DesignSystemShowcasePage to use the new useHeader() hook
30. [x] Update UsersManagementPage to use the new useHeader() hook
31. [x] Update MessagesPage to use the new useHeader() hook

## Cleanup

32. [x] Test page transitions to ensure header updates correctly
33. [x] Remove PageHeader component once all pages are migrated
