# Header Migration Bugfix Plan

We identified several issues with the header migration. Here's what we fixed:

## 1. Issues Found

1. ✅ The old `PageHeader` component was still being imported in several files:

   - ✅ EmployeeEarningsPage.tsx (still using it)
   - ✅ BillingPage.tsx (importing but not using)
   - ✅ BusinessProfilePage.tsx (importing but not using)
   - ✅ EmployeesPage.tsx (importing but not using)
   - ✅ NotificationsPage.tsx (importing but not using)
   - ✅ SchedulesPage.tsx (importing but not using)

2. ✅ The old `LayoutProvider` from layout-context.tsx was still being imported and used in App.tsx

3. ✅ Files with duplicate function declarations (e.g., EmployeeEarningsPage.tsx had duplicate getExportData and handleExportReport functions)

## 2. Fix Actions

1. ✅ Updated App.tsx to remove the old LayoutProvider and replace it with HeaderProvider

2. ✅ Created this checklist to track remaining migrations

3. ✅ For each page that still imports PageHeader:

   - ✅ Remove the PageHeader import
   - ✅ Make sure useHeader hook is imported and used properly
   - ✅ Replace any PageHeader component instances with appropriate useHeader() calls
   - ✅ Verify there are no duplicate function declarations
   - ✅ Check that the page renders correctly

4. ✅ After all pages are migrated:
   - ✅ Delete the old PageHeader component
   - ✅ Delete the old layout-context.tsx file

## 3. Testing After Fixes

1. ✅ Verify that all pages render their headers correctly
2. ✅ Check that page transitions maintain proper header state
3. ✅ Test back button functionality works as expected
4. ✅ Verify that all header actions (buttons, etc.) work properly
5. ✅ Run a final scan for any remaining PageHeader imports

## 4. Additional Notes

- ✅ Script `scripts/check-page-header.js` was used to identify any remaining usage of PageHeader
- ✅ Updated global-header-checklist.md after each fix

All migration issues have been successfully resolved!
