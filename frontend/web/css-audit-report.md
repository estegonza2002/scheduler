# CSS Audit Report

Generated on: 3/23/2025, 12:53:47 AM

## Summary

- [ ] All components use ShadCN UI components
- [ ] No inline styles detected
- [ ] No custom CSS imports
- [ ] No styled-components usage
- [ ] All classNames use Tailwind classes

## Issues Found

### Inline Styles (0 files)

✅ No inline styles detected

### CSS Imports (1 files)

- [ ] src/main.tsx (1 imports)
  - `import "./index.css"`

### Style Tags (0 files)

✅ No style tags detected

### Styled Components (0 files)

✅ No styled-components usage detected

### Non-Tailwind Classes (69 files)

- [ ] src/App.tsx (1 instances)
  - `className="min-h-screen flex items-center justify-center"`

- [ ] src/components/AddEmployeeDialog.tsx (5 instances)
  - `className="mr-2 h-4 w-4"`
  - `className="sm:max-w-[550px]"`
  - `className="mt-4"`
  - and 2 more...

- [ ] src/components/AddLocationDialog.tsx (5 instances)
  - `className="h-4 w-4 mr-2"`
  - `className="sm:max-w-[425px]"`
  - `className="space-y-4"`
  - and 2 more...

- [ ] src/components/BulkEmployeeUpload.tsx (19 instances)
  - `className="space-y-4"`
  - `className="mb-4"`
  - `className="h-4 w-4"`
  - and 16 more...

- [ ] src/components/DailyShiftsView.tsx (16 instances)
  - `className="space-y-6"`
  - `className="relative"`
  - `className="pl-10"`
  - and 13 more...

- [ ] src/components/DeleteEmployeeDialog.tsx (3 instances)
  - `className="h-4 w-4 mr-2"`
  - `className="sm:max-w-[425px]"`
  - `className="mt-4"`

- [ ] src/components/DeleteLocationDialog.tsx (4 instances)
  - `className="sm:max-w-[425px]"`
  - `className="h-5 w-5"`
  - `className="font-medium"`
  - and 1 more...

- [ ] src/components/EditEmployeeDialog.tsx (2 instances)
  - `className="h-4 w-4 mr-2"`
  - `className="sm:max-w-[550px]"`

- [ ] src/components/EditLocationDialog.tsx (4 instances)
  - `className="sm:max-w-[425px]"`
  - `className="space-y-4"`
  - `className="space-y-1 leading-none"`
  - and 1 more...

- [ ] src/components/EmployeeDetailDialog.tsx (8 instances)
  - `className="sm:max-w-[600px]"`
  - `className="h-16 w-16"`
  - `className="pb-2"`
  - and 5 more...

- [ ] src/components/EmployeeForm.tsx (7 instances)
  - `className="space-y-4"`
  - `className="space-y-4"`
  - `className="space-y-4"`
  - and 4 more...

- [ ] src/components/GooglePlacesAutocomplete.tsx (6 instances)
  - `className="w-full justify-between"`
  - `className="flex items-center"`
  - `className="truncate"`
  - and 3 more...

- [ ] src/components/LocationDetailDialog.tsx (5 instances)
  - `className="max-w-md"`
  - `className="space-y-6"`
  - `className="space-y-1"`
  - and 2 more...

- [ ] src/components/OrganizationSelector.tsx (9 instances)
  - `className="flex justify-center items-center min-h-[200px]"`
  - `className="flex justify-between items-center mb-6"`
  - `className="space-y-4"`
  - and 6 more...

- [ ] src/components/ScheduleCalendar.tsx (8 instances)
  - `className="w-full truncate justify-start font-normal"`
  - `className="truncate"`
  - `className="w-[180px]"`
  - and 5 more...

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

- [ ] src/components/ShiftCreationDialog.tsx (1 instances)
  - `className="h-4 w-4 mr-2"`

- [ ] src/components/ShiftCreationForm.tsx (4 instances)
  - `className="space-y-4"`
  - `className="ml-auto h-4 w-4 opacity-50"`
  - `className="h-20"`
  - and 1 more...

- [ ] src/components/ShiftCreationWizard.tsx (49 instances)
  - `className="my-4"`
  - `className="relative"`
  - `className="pl-9"`
  - and 46 more...

- [ ] src/components/app-sidebar.tsx (13 instances)
  - `className="h-5 w-5"`
  - `className="h-5 w-5"`
  - `className="h-5 w-5"`
  - and 10 more...

- [ ] src/components/auth/LoginForm.tsx (3 instances)
  - `className="w-full max-w-md mx-auto"`
  - `className="space-y-4"`
  - `className="w-full"`

- [ ] src/components/auth/ProtectedRoute.tsx (1 instances)
  - `className="min-h-screen flex items-center justify-center"`

- [ ] src/components/auth/SignUpForm.tsx (4 instances)
  - `className="w-full max-w-md mx-auto"`
  - `className="space-y-4"`
  - `className="w-full"`
  - and 1 more...

- [ ] src/components/calendars.tsx (3 instances)
  - `className="py-0"`
  - `className="group/collapsible"`
  - `className="mx-0"`

- [ ] src/components/date-picker.tsx (1 instances)
  - `className="px-0"`

- [ ] src/components/layout/AppLayout.tsx (23 instances)
  - `className="ml-auto h-4 w-4"`
  - `className="h-4 w-4"`
  - `className="h-4 w-4"`
  - and 20 more...

- [ ] src/components/layout/AppLayoutNew.tsx (3 instances)
  - `className="w-64"`
  - `className="-ml-1"`
  - `className="mr-2 h-4"`

- [ ] src/components/nav-user.tsx (3 instances)
  - `className="truncate font-semibold"`
  - `className="ml-auto size-4"`
  - `className="truncate font-semibold"`

- [ ] src/components/search-form.tsx (4 instances)
  - `className="py-0"`
  - `className="relative"`
  - `className="sr-only"`
  - and 1 more...

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

- [ ] src/components/shift/ShiftDetails.tsx (5 instances)
  - `className="flex justify-center items-center h-[50vh]"`
  - `className="flex items-center justify-center mb-4"`
  - `className="mr-auto"`
  - and 2 more...

- [ ] src/components/shift/ShiftHeader.tsx (7 instances)
  - `className="h-4 w-4 mx-1"`
  - `className="h-4 w-4 mx-1"`
  - `className="ml-2"`
  - and 4 more...

- [ ] src/components/shift/ShiftInformation.tsx (3 instances)
  - `className="mb-4"`
  - `className="flex justify-between font-medium items-center"`
  - `className="my-3"`

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

- [ ] src/components/shift/ShiftTasks.tsx (17 instances)
  - `className="mb-6"`
  - `className="flex items-center justify-between mb-4"`
  - `className="mb-4"`
  - and 14 more...

- [ ] src/components/ui/breadcrumb.tsx (2 instances)
  - `className="h-4 w-4"`
  - `className="sr-only"`

- [ ] src/components/ui/calendar-day-card.tsx (2 instances)
  - `className="flex items-center justify-between mb-1"`
  - `className="space-y-1 mt-1"`

- [ ] src/components/ui/checkbox.tsx (1 instances)
  - `className="h-4 w-4"`

- [ ] src/components/ui/command.tsx (1 instances)
  - `className="mr-2 h-4 w-4 shrink-0 opacity-50"`

- [ ] src/components/ui/data-table.tsx (8 instances)
  - `className="flex items-center justify-between py-4"`
  - `className="max-w-sm"`
  - `className="flex items-center space-x-2"`
  - and 5 more...

- [ ] src/components/ui/dialog.tsx (2 instances)
  - `className="h-4 w-4"`
  - `className="sr-only"`

- [ ] src/components/ui/dropdown-menu.tsx (5 instances)
  - `className="ml-auto"`
  - `className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center"`
  - `className="h-4 w-4"`
  - and 2 more...

- [ ] src/components/ui/empty-state.tsx (1 instances)
  - `className="mt-6"`

- [ ] src/components/ui/select.tsx (5 instances)
  - `className="size-4 opacity-50"`
  - `className="absolute right-2 flex size-3.5 items-center justify-center"`
  - `className="size-4"`
  - and 2 more...

- [ ] src/components/ui/sheet.tsx (2 instances)
  - `className="h-4 w-4"`
  - `className="sr-only"`

- [ ] src/components/ui/sidebar.tsx (2 instances)
  - `className="sr-only"`
  - `className="sr-only"`

- [ ] src/components/ui/table.tsx (1 instances)
  - `className="relative w-full overflow-x-auto"`

- [ ] src/components/version-switcher.tsx (6 instances)
  - `className="size-4"`
  - `className="font-semibold"`
  - `className=""`
  - and 3 more...

- [ ] src/pages/AdminDashboardPage.tsx (28 instances)
  - `className="flex items-center justify-center h-[calc(100vh-4rem)]"`
  - `className="py-6 px-8 md:px-10 w-full"`
  - `className="mb-8"`
  - and 25 more...

- [ ] src/pages/BusinessProfilePage.tsx (25 instances)
  - `className="flex justify-center items-center min-h-screen"`
  - `className="container mx-auto py-10 px-4"`
  - `className="max-w-4xl mx-auto"`
  - and 22 more...

- [ ] src/pages/BusinessSignUpPage.tsx (13 instances)
  - `className="w-full max-w-2xl"`
  - `className="space-y-6"`
  - `className="space-y-4"`
  - and 10 more...

- [ ] src/pages/DailyShiftsPage.tsx (17 instances)
  - `className="space-y-6"`
  - `className="flex items-center space-x-4"`
  - `className="h-8 w-32"`
  - and 14 more...

- [ ] src/pages/DashboardPage.tsx (12 instances)
  - `className="py-6 px-8 md:px-10 w-full"`
  - `className="mb-8"`
  - `className="pb-2"`
  - and 9 more...

- [ ] src/pages/EditShiftPage.tsx (12 instances)
  - `className="flex items-center justify-center min-h-screen"`
  - `className="max-w-screen-lg mx-auto px-4 sm:px-6 py-6"`
  - `className="flex items-center justify-between mb-6"`
  - and 9 more...

- [ ] src/pages/EmployeeDetailPage.tsx (15 instances)
  - `className="flex items-center justify-center min-h-screen"`
  - `className="container py-8"`
  - `className="mt-4"`
  - and 12 more...

- [ ] src/pages/EmployeesPage.tsx (12 instances)
  - `className="pl-0"`
  - `className="ml-2 h-4 w-4"`
  - `className="font-medium"`
  - and 9 more...

- [ ] src/pages/LocationDetailPage.tsx (14 instances)
  - `className="flex items-center justify-center min-h-screen"`
  - `className="container py-8"`
  - `className="mt-4"`
  - and 11 more...

- [ ] src/pages/LocationsPage.tsx (12 instances)
  - `className="pl-0"`
  - `className="ml-2 h-4 w-4"`
  - `className="font-medium"`
  - and 9 more...

- [ ] src/pages/LoginPage.tsx (1 instances)
  - `className="w-full max-w-md"`

- [ ] src/pages/ProfilePage.tsx (20 instances)
  - `className="container mx-auto py-10 px-4"`
  - `className="max-w-3xl mx-auto"`
  - `className="h-4 w-4 mr-2"`
  - and 17 more...

- [ ] src/pages/SchedulePage.tsx (8 instances)
  - `className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 space-y-6"`
  - `className="flex justify-between items-center mb-4"`
  - `className="h-4 w-4 mr-2"`
  - and 5 more...

- [ ] src/pages/ShiftDetailsPage.clean.tsx (113 instances)
  - `className="flex items-center justify-center min-h-screen"`
  - `className="container py-8"`
  - `className="mt-4"`
  - and 110 more...

- [ ] src/pages/SignUpPage.tsx (1 instances)
  - `className="w-full max-w-md"`

### Components Not Using ShadCN (7 files)

- [ ] src/components/auth/ProtectedRoute.tsx
- [ ] src/components/layout/PageLayout.tsx
- [ ] src/hooks/use-mobile.tsx
- [ ] src/lib/auth.tsx
- [ ] src/pages/LoginPage.tsx
- [ ] src/pages/ShiftDetailsPage.tsx
- [ ] src/pages/SignUpPage.tsx

## Recommendations

1. Replace inline styles with Tailwind utility classes
2. Remove custom CSS imports and migrate to Tailwind
3. Use ShadCN UI components for all UI elements
4. Refactor custom component styles to use Tailwind
