# CSS Audit Report

Generated on: 3/27/2025, 8:29:30 AM

## Summary

- [ ] All components use ShadCN UI components
- [ ] No inline styles detected
- [ ] No custom CSS imports
- [ ] No styled-components usage
- [ ] All classNames use Tailwind classes

## Issues Found

### Inline Styles (6 files)

- [ ] src/components/onboarding/OnboardingModal.tsx (1 instances)

  - `style={{ width: `${progressPercentage}`

- [ ] src/components/ui/charts.tsx (1 instances)

  - `style={{ backgroundColor: colors[index % colors.length] }`

- [ ] src/components/ui/loading.tsx (1 instances)

  - `style={{ animationDelay: `${i \* 200}`

- [ ] src/components/ui/progress.tsx (1 instances)

  - `style={{ transform: `translateX(-${100 - (value || 0)}`

- [ ] src/pages/BrandingPage.tsx (3 instances)

  - `style={{ backgroundColor: field.value }`
  - `style={{ backgroundColor: field.value }`
  - `style={{ backgroundColor: field.value }`

- [ ] src/pages/ProfilePage.tsx (3 instances)
  - `style={{ backgroundColor: field.value }`
  - `style={{ backgroundColor: field.value }`
  - `style={{ backgroundColor: field.value }`

### CSS Imports (1 files)

- [ ] src/main.tsx (1 imports)
  - `import "./index.css"`

### Style Tags (0 files)

✅ No style tags detected

### Styled Components (0 files)

✅ No styled-components usage detected

### Non-Tailwind Classes (125 files)

- [ ] src/App.tsx (1 instances)

  - `className="min-h-screen flex items-center justify-center"`

- [ ] src/components/AddEmployeeDialog.tsx (3 instances)

  - `className="mr-2 h-4 w-4"`
  - `className="h-4 w-4 mr-2"`
  - `className="h-4 w-4 mr-2"`

- [ ] src/components/AddLocationDialog.tsx (15 instances)

  - `className="h-4 w-4 mr-2"`
  - `className="flex items-center justify-between"`
  - `className="flex items-center"`
  - and 12 more...

- [ ] src/components/AppSidebar.tsx (15 instances)

  - `className="h-5 w-5"`
  - `className="h-5 w-5"`
  - `className="h-5 w-5"`
  - and 12 more...

- [ ] src/components/BulkEmployeeUpload.tsx (25 instances)

  - `className="flex items-center justify-between mb-2"`
  - `className="h-3 w-3"`
  - `className="my-2"`
  - and 22 more...

- [ ] src/components/BulkLocationImport.tsx (10 instances)

  - `className="space-y-4"`
  - `className="space-y-6"`
  - `className="h-4 w-4 animate-spin"`
  - and 7 more...

- [ ] src/components/DailyShiftsCard.tsx (6 instances)

  - `className="pb-2"`
  - `className="flex items-center justify-between"`
  - `className="h-4 w-4"`
  - and 3 more...

- [ ] src/components/DeleteEmployeeDialog.tsx (2 instances)

  - `className="h-4 w-4 mr-2"`
  - `className="sm:mr-2"`

- [ ] src/components/DeleteLocationDialog.tsx (5 instances)

  - `className="h-5 w-5 mr-2"`
  - `className="flex items-center"`
  - `className="font-medium"`
  - and 2 more...

- [ ] src/components/EditEmployeeDialog.tsx (4 instances)

  - `className="h-4 w-4 mr-2"`
  - `className="flex items-center"`
  - `className="flex items-center"`
  - and 1 more...

- [ ] src/components/EditLocationDialog.tsx (14 instances)

  - `className="space-y-4"`
  - `className="relative"`
  - `className="pl-9"`
  - and 11 more...

- [ ] src/components/EmployeeAssignmentSheet.tsx (7 instances)

  - `className="space-y-4"`
  - `className="mb-4"`
  - `className="space-y-1"`
  - and 4 more...

- [ ] src/components/EmployeeDetailDialog.tsx (19 instances)

  - `className="ml-2"`
  - `className="space-y-6 py-2"`
  - `className="h-16 w-16"`
  - and 16 more...

- [ ] src/components/EmployeeForm.tsx (15 instances)

  - `className="space-y-6"`
  - `className="flex items-center"`
  - `className="flex items-center"`
  - and 12 more...

- [ ] src/components/EmployeeSheet.tsx (3 instances)

  - `className="h-4 w-4 mr-2"`
  - `className="h-4 w-4 mr-2"`
  - `className="mt-1.5"`

- [ ] src/components/ExportDropdown.tsx (4 instances)

  - `className="mr-2 h-4 w-4"`
  - `className="mr-2 h-4 w-4"`
  - `className="mr-2 h-4 w-4"`
  - and 1 more...

- [ ] src/components/GooglePlacesAutocomplete.tsx (6 instances)

  - `className="w-full justify-between"`
  - `className="flex items-center"`
  - `className="truncate"`
  - and 3 more...

- [ ] src/components/LocationAssignmentSheet.tsx (8 instances)

  - `className="space-y-4"`
  - `className="mb-6"`
  - `className="w-full"`
  - and 5 more...

- [ ] src/components/LocationCreationSheet.tsx (12 instances)

  - `className="space-y-4"`
  - `className="space-y-4"`
  - `className="space-y-4"`
  - and 9 more...

- [ ] src/components/LocationDetailDialog.tsx (11 instances)

  - `className="flex items-center justify-between"`
  - `className="flex items-center"`
  - `className="ml-2"`
  - and 8 more...

- [ ] src/components/LocationEditSheet.tsx (12 instances)

  - `className="space-y-4"`
  - `className="mt-6"`
  - `className="space-y-4"`
  - and 9 more...

- [ ] src/components/LocationEmployeeInsights.tsx (9 instances)

  - `className="space-y-6"`
  - `className="h-4 w-4"`
  - `className="pt-2 px-4 pb-4"`
  - and 6 more...

- [ ] src/components/LocationFinanceInsights.tsx (11 instances)

  - `className="space-y-6"`
  - `className="h-4 w-4"`
  - `className="pt-2 px-4 pb-4"`
  - and 8 more...

- [ ] src/components/LocationFinancialReport.tsx (23 instances)

  - `className="space-y-8"`
  - `className="h-3 w-3 mr-1"`
  - `className="h-3 w-3 mr-1"`
  - and 20 more...

- [ ] src/components/LocationShiftAnalytics.tsx (19 instances)

  - `className="space-y-6"`
  - `className="h-4 w-4"`
  - `className="pt-2 px-4 pb-4"`
  - and 16 more...

- [ ] src/components/LocationShiftInsights.tsx (9 instances)

  - `className="space-y-6"`
  - `className="h-4 w-4"`
  - `className="pt-2 px-4 pb-4"`
  - and 6 more...

- [ ] src/components/LocationSubNav.tsx (1 instances)

  - `className="h-4 w-4 mr-2"`

- [ ] src/components/NavUser.tsx (9 instances)

  - `className="mr-2"`
  - `className="block truncate font-medium"`
  - `className="ml-2 h-4 w-4 shrink-0 opacity-50"`
  - and 6 more...

- [ ] src/components/NotificationItem.tsx (7 instances)

  - `className="h-3 w-3 mr-1"`
  - `className="sr-only"`
  - `className="w-40"`
  - and 4 more...

- [ ] src/components/NotificationSheet.tsx (2 instances)

  - `className="h-5 w-5"`
  - `className="px-2.5"`

- [ ] src/components/OrganizationSelector.tsx (6 instances)

  - `className="h-6 w-6"`
  - `className="py-12"`
  - `className="h-6 w-6"`
  - and 3 more...

- [ ] src/components/ScheduleCalendar.tsx (11 instances)

  - `className="w-full truncate justify-start font-normal"`
  - `className="truncate"`
  - `className="pb-3"`
  - and 8 more...

- [ ] src/components/ScheduleCreationForm.tsx (11 instances)

  - `className="space-y-4"`
  - `className="space-y-2"`
  - `className="space-y-2"`
  - and 8 more...

- [ ] src/components/ScheduleView.tsx (7 instances)

  - `className="flex justify-between items-center mb-6"`
  - `className="flex space-x-2"`
  - `className="flex justify-between items-center mb-4"`
  - and 4 more...

- [ ] src/components/SearchForm.tsx (2 instances)

  - `className="sr-only"`
  - `className="relative"`

- [ ] src/components/ShiftCreationForm.tsx (8 instances)

  - `className="ml-auto h-4 w-4 opacity-50"`
  - `className="flex items-center"`
  - `className="flex items-center"`
  - and 5 more...

- [ ] src/components/ShiftCreationWizard.tsx (1 instances)

  - `className="mx-6 mb-4"`

- [ ] src/components/VersionSwitcher.tsx (7 instances)

  - `className="h-5 w-5"`
  - `className="font-semibold"`
  - `className=""`
  - and 4 more...

- [ ] src/components/auth/LoginForm.tsx (2 instances)

  - `className="space-y-4"`
  - `className="w-full"`

- [ ] src/components/auth/ProtectedRoute.tsx (2 instances)

  - `className="min-h-screen flex items-center justify-center"`
  - `className="flex items-center justify-center"`

- [ ] src/components/auth/SignUpForm.tsx (2 instances)

  - `className="space-y-4"`
  - `className="w-full"`

- [ ] src/components/calendars.tsx (1 instances)

  - `className="size-3"`

- [ ] src/components/layout/AppLayout.tsx (1 instances)

  - `className="w-64"`

- [ ] src/components/layout/app-navbar.tsx (8 instances)

  - `className="container flex h-14 items-center"`
  - `className="mr-4"`
  - `className="hidden md:flex"`
  - and 5 more...

- [ ] src/components/messages/ChatView.tsx (7 instances)

  - `className="h-10 w-10"`
  - `className="font-medium"`
  - `className="space-y-4"`
  - and 4 more...

- [ ] src/components/messages/MessageList.tsx (6 instances)

  - `className="relative"`
  - `className="pl-8"`
  - `className="h-10 w-10"`
  - and 3 more...

- [ ] src/components/messages/NewConversationModal.tsx (22 instances)

  - `className="sm:max-w-[425px]"`
  - `className="w-full"`
  - `className="mt-4"`
  - and 19 more...

- [ ] src/components/onboarding/OnboardingModal.tsx (30 instances)

  - `className="w-full max-w-xs"`
  - `className="ml-2 h-4 w-4"`
  - `className="py-6"`
  - and 27 more...

- [ ] src/components/onboarding/OnboardingReminder.tsx (2 instances)

  - `className="flex items-center justify-between w-full"`
  - `className="h-3 w-3 ml-1"`

- [ ] src/components/shift/AssignEmployeeDialog.tsx (15 instances)

  - `className="sm:max-w-[600px]"`
  - `className="py-4"`
  - `className="relative mb-4"`
  - and 12 more...

- [ ] src/components/shift/CheckInTasksDialog.tsx (12 instances)

  - `className="sm:max-w-[500px]"`
  - `className="py-4"`
  - `className="space-y-4"`
  - and 9 more...

- [ ] src/components/shift/CheckOutTasksDialog.tsx (12 instances)

  - `className="sm:max-w-[500px]"`
  - `className="py-4"`
  - `className="space-y-4"`
  - and 9 more...

- [ ] src/components/shift/EmployeesSection.tsx (11 instances)

  - `className="mb-6"`
  - `className="flex items-center justify-between mb-4"`
  - `className="h-4 w-4 mr-1"`
  - and 8 more...

- [ ] src/components/shift/ShiftCard.tsx (2 instances)

  - `className="flex justify-between items-center"`
  - `className="h-3 w-3 mr-1"`

- [ ] src/components/shift/ShiftDetails.tsx (4 instances)

  - `className="flex justify-center items-center h-[50vh]"`
  - `className="min-w-[150px]"`
  - `className="w-full pb-12"`
  - and 1 more...

- [ ] src/components/shift/ShiftHeader.tsx (9 instances)

  - `className="h-4 w-4 mx-1"`
  - `className="h-4 w-4 mx-1"`
  - `className="h-3 w-3 mr-1"`
  - and 6 more...

- [ ] src/components/shift/ShiftInformation.tsx (1 instances)

  - `className="flex justify-between font-medium items-center"`

- [ ] src/components/shift/ShiftNotes.tsx (13 instances)

  - `className="mb-6"`
  - `className="flex items-center justify-between mb-4"`
  - `className="h-4 w-4"`
  - and 10 more...

- [ ] src/components/shift/ShiftNotesDialog.tsx (17 instances)

  - `className="sm:max-w-[600px]"`
  - `className="py-4"`
  - `className="h-8 w-8"`
  - and 14 more...

- [ ] src/components/shift/ShiftReport.tsx (18 instances)

  - `className="space-y-6"`
  - `className="h-4 w-4"`
  - `className="pt-2 px-4 pb-4"`
  - and 15 more...

- [ ] src/components/shift/ShiftStatus.tsx (3 instances)

  - `className="h-3 w-3 mr-1"`
  - `className="h-3 w-3 mr-1"`
  - `className="h-3 w-3 mr-1"`

- [ ] src/components/shift/ShiftTasks.tsx (17 instances)

  - `className="mb-6"`
  - `className="flex items-center justify-between mb-4"`
  - `className="mb-4"`
  - and 14 more...

- [ ] src/components/shift-wizard/EmployeeAssignmentStep.tsx (15 instances)

  - `className="font-medium truncate"`
  - `className="h-4 w-4"`
  - `className="sr-only"`
  - and 12 more...

- [ ] src/components/shift-wizard/LocationSelectionStep.tsx (10 instances)

  - `className="flex items-center justify-between"`
  - `className="font-medium"`
  - `className="mb-4"`
  - and 7 more...

- [ ] src/components/shift-wizard/ShiftDetailsStep.tsx (11 instances)

  - `className="font-medium truncate"`
  - `className="h-4 w-4"`
  - `className="sr-only"`
  - and 8 more...

- [ ] src/components/shift-wizard/WizardProgressBar.tsx (3 instances)

  - `className="mb-4"`
  - `className="flex justify-between mb-2"`
  - `className="h-1.5"`

- [ ] src/components/ui/alert-card.tsx (10 instances)

  - `className="h-5 w-5"`
  - `className="h-5 w-5"`
  - `className="h-5 w-5"`
  - and 7 more...

- [ ] src/components/ui/alert.tsx (1 instances)

  - `className="h-4 w-4"`

- [ ] src/components/ui/avatar-with-status.tsx (1 instances)

  - `className="relative inline-block"`

- [ ] src/components/ui/breadcrumb.tsx (2 instances)

  - `className="h-4 w-4"`
  - `className="sr-only"`

- [ ] src/components/ui/breadcrumbs.tsx (5 instances)

  - `className="h-4 w-4"`
  - `className="h-4 w-4"`
  - `className="sr-only"`
  - and 2 more...

- [ ] src/components/ui/calendar-day-card.tsx (2 instances)

  - `className="flex items-center justify-between mb-1"`
  - `className="space-y-1 mt-1"`

- [ ] src/components/ui/charts.tsx (7 instances)

  - `className="space-y-1"`
  - `className="relative"`
  - `className="flex items-end justify-between h-[200px]"`
  - and 4 more...

- [ ] src/components/ui/checkbox.tsx (1 instances)

  - `className="h-4 w-4"`

- [ ] src/components/ui/command.tsx (1 instances)

  - `className="mr-2 h-4 w-4 shrink-0 opacity-50"`

- [ ] src/components/ui/content-section.tsx (6 instances)

  - `className="mb-4"`
  - `className="flex items-center justify-between"`
  - `className="mt-4"`
  - and 3 more...

- [ ] src/components/ui/data-table.tsx (9 instances)

  - `className="flex items-center py-2"`
  - `className="max-w-sm"`
  - `className="flex items-center space-x-6"`
  - and 6 more...

- [ ] src/components/ui/dialog-header.tsx (3 instances)

  - `className="flex items-center justify-between"`
  - `className="h-8 w-8"`
  - `className="h-4 w-4"`

- [ ] src/components/ui/dialog.tsx (2 instances)

  - `className="h-4 w-4"`
  - `className="sr-only"`

- [ ] src/components/ui/dropdown-menu.tsx (5 instances)

  - `className="ml-auto"`
  - `className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center"`
  - `className="h-4 w-4"`
  - and 2 more...

- [ ] src/components/ui/employee-status-badge.tsx (1 instances)

  - `className="relative"`

- [ ] src/components/ui/empty-state.tsx (1 instances)

  - `className="mt-6"`

- [ ] src/components/ui/filter-group.tsx (3 instances)

  - `className="h-3.5 w-3.5 mr-1"`
  - `className="h-3.5 w-3.5"`
  - `className="h-3.5 w-3.5 mr-1"`

- [ ] src/components/ui/formula-explainer.tsx (10 instances)

  - `className="h-4 w-4"`
  - `className="sr-only"`
  - `className="max-h-[85vh]"`
  - and 7 more...

- [ ] src/components/ui/item-card.tsx (5 instances)

  - `className="h-40 w-full overflow-hidden"`
  - `className="h-full w-full object-cover"`
  - `className="flex h-full w-full items-center justify-center"`
  - and 2 more...

- [ ] src/components/ui/loading-state.tsx (1 instances)

  - `className="flex space-x-2"`

- [ ] src/components/ui/loading.tsx (1 instances)

  - `className="flex space-x-1"`

- [ ] src/components/ui/navbar.tsx (10 instances)

  - `className="container flex h-14 items-center"`
  - `className="mr-4"`
  - `className="hidden md:flex"`
  - and 7 more...

- [ ] src/components/ui/page-header.tsx (4 instances)

  - `className="-ml-1"`
  - `className="h-8 w-8"`
  - `className="h-5 w-5"`
  - and 1 more...

- [ ] src/components/ui/radio-group.tsx (1 instances)

  - `className="flex items-center justify-center"`

- [ ] src/components/ui/search-input.tsx (3 instances)

  - `className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"`
  - `className="absolute inset-y-0 right-0 flex items-center pr-3"`
  - `className="sr-only"`

- [ ] src/components/ui/select.tsx (3 instances)

  - `className="h-4 w-4 opacity-50"`
  - `className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center"`
  - `className="h-4 w-4"`

- [ ] src/components/ui/sheet.tsx (2 instances)

  - `className="h-4 w-4"`
  - `className="sr-only"`

- [ ] src/components/ui/sidebar.tsx (3 instances)

  - `className="sr-only"`
  - `className="sr-only"`
  - `className="flex items-center justify-center w-full"`

- [ ] src/components/ui/table.tsx (1 instances)

  - `className="relative w-full overflow-x-auto"`

- [ ] src/components/ui/toast.tsx (2 instances)

  - `className="h-5 w-5 shrink-0"`
  - `className="font-medium"`

- [ ] src/pages/AdminDashboardPage.tsx (28 instances)

  - `className="space-y-6"`
  - `className="py-12"`
  - `className="h-3 w-3 ml-1"`
  - and 25 more...

- [ ] src/pages/BillingPage.tsx (45 instances)

  - `className="flex justify-center items-center min-h-screen"`
  - `className="mb-4"`
  - `className="flex justify-between items-center mb-2"`
  - and 42 more...

- [ ] src/pages/BrandingPage.tsx (14 instances)

  - `className="space-y-6"`
  - `className="relative w-full h-full flex items-center justify-center"`
  - `className="max-h-32 max-w-full object-contain"`
  - and 11 more...

- [ ] src/pages/BusinessProfilePage.tsx (23 instances)

  - `className="flex justify-center items-center min-h-screen"`
  - `className="w-full"`
  - `className="mb-6 w-full sm:w-auto"`
  - and 20 more...

- [ ] src/pages/BusinessSignUpPage.tsx (11 instances)

  - `className="space-y-6"`
  - `className="space-y-4"`
  - `className="space-y-2"`
  - and 8 more...

- [ ] src/pages/DailyShiftsPage.tsx (28 instances)

  - `className="h-5 w-5 mr-2"`
  - `className="cursor-pointer hover:shadow-md transition-all border"`
  - `className="pb-1 px-3 pt-3"`
  - and 25 more...

- [ ] src/pages/DashboardPage.tsx (28 instances)

  - `className="flex items-center justify-center py-12"`
  - `className="h-5 w-5 mr-2"`
  - `className="h-5 w-5 mr-2"`
  - and 25 more...

- [ ] src/pages/DesignSystemShowcasePage.tsx (61 instances)

  - `className="mb-8"`
  - `className="mt-6"`
  - `className="mt-6"`
  - and 58 more...

- [ ] src/pages/EditShiftPage.tsx (12 instances)

  - `className="mb-2"`
  - `className="h-4 w-4 mr-1"`
  - `className="h-4 w-4 mr-1"`
  - and 9 more...

- [ ] src/pages/EmployeeDetailPage.tsx (31 instances)

  - `className="flex items-center justify-between"`
  - `className="flex items-center justify-between"`
  - `className="flex items-center justify-between"`
  - and 28 more...

- [ ] src/pages/EmployeeEarningsPage.tsx (35 instances)

  - `className="py-12"`
  - `className="max-w-4xl mx-auto"`
  - `className="mr-2 h-4 w-4"`
  - and 32 more...

- [ ] src/pages/EmployeesPage.tsx (33 instances)

  - `className="pl-0"`
  - `className="ml-2 h-4 w-4"`
  - `className="font-medium"`
  - and 30 more...

- [ ] src/pages/ForgotPasswordPage.tsx (4 instances)

  - `className="flex justify-center items-center"`
  - `className="space-y-4"`
  - `className="w-full"`
  - and 1 more...

- [ ] src/pages/LocationDetailPage.tsx (10 instances)

  - `className="h-4 w-4"`
  - `className="h-4 w-4 mr-2"`
  - `className="py-12"`
  - and 7 more...

- [ ] src/pages/LocationEmployeesPage.tsx (9 instances)

  - `className="py-12"`
  - `className="mt-2"`
  - `className="h-4 w-4 mr-2"`
  - and 6 more...

- [ ] src/pages/LocationFinancialReportPage.tsx (14 instances)

  - `className="py-12"`
  - `className="mt-2"`
  - `className="h-4 w-4 mr-2"`
  - and 11 more...

- [ ] src/pages/LocationInsightsPage.tsx (6 instances)

  - `className="py-12"`
  - `className="mt-2"`
  - `className="mb-4"`
  - and 3 more...

- [ ] src/pages/LocationShiftPage.tsx (7 instances)

  - `className="py-12"`
  - `className="mt-2"`
  - `className="space-y-8 mt-6"`
  - and 4 more...

- [ ] src/pages/LocationsPage.tsx (34 instances)

  - `className="pl-0"`
  - `className="ml-2 h-4 w-4"`
  - `className="font-medium"`
  - and 31 more...

- [ ] src/pages/LoginPage.tsx (1 instances)

  - `className="flex justify-center items-center"`

- [ ] src/pages/MessagesPage.tsx (4 instances)

  - `className="h-4 w-4 mr-2"`
  - `className="w-full"`
  - `className="h-[calc(100vh-8rem)] max-h-[calc(100vh-8rem)] overflow-hidden"`
  - and 1 more...

- [ ] src/pages/NotificationsPage.tsx (20 instances)

  - `className="h-4 w-4 mr-2"`
  - `className="h-4 w-4 mr-2"`
  - `className="pl-8"`
  - and 17 more...

- [ ] src/pages/ProfilePage.tsx (80 instances)

  - `className="mb-3 hover:shadow-sm transition-all"`
  - `className="flex justify-between items-start"`
  - `className="font-medium"`
  - and 77 more...

- [ ] src/pages/ResetPasswordPage.tsx (5 instances)

  - `className="flex justify-center items-center"`
  - `className="w-full"`
  - `className="w-full"`
  - and 2 more...

- [ ] src/pages/SchedulePage.tsx (11 instances)

  - `className="h-4 w-4"`
  - `className="h-4 w-4"`
  - `className="h-8"`
  - and 8 more...

- [ ] src/pages/ShiftLogDetailsPage.tsx (11 instances)

  - `className="space-y-4"`
  - `className="flex items-center space-x-2"`
  - `className="relative md:w-64"`
  - and 8 more...

- [ ] src/pages/ShiftsPage.tsx (45 instances)

  - `className="space-y-8"`
  - `className="pb-2"`
  - `className="pb-2"`
  - and 42 more...

- [ ] src/pages/SignUpPage.tsx (1 instances)

  - `className="flex justify-center items-center"`

- [ ] src/tests/Button.a11y.test.jsx (1 instances)
  - `className="mr-2 h-4 w-4"`

### Components Not Using ShadCN (9 files)

- [ ] src/App.tsx
- [ ] src/components/LocationSubNav.tsx
- [ ] src/components/layout/SecondaryLayout.tsx
- [ ] src/hooks/use-mobile.tsx
- [ ] src/lib/auth.tsx
- [ ] src/lib/layout-context.tsx
- [ ] src/lib/notification-context.tsx
- [ ] src/lib/onboarding-context.tsx
- [ ] src/pages/ShiftDetailsPage.tsx

## Recommendations

1. Replace inline styles with Tailwind utility classes
2. Remove custom CSS imports and migrate to Tailwind
3. Use ShadCN UI components for all UI elements
4. Refactor custom component styles to use Tailwind
