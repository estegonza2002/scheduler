# Context Providers Migration Tasks

Migrate the application from using multiple organization-related hooks to the new consolidated context providers.

## Tasks

### 1. Provider Setup ✅

- [x] Create `organization.tsx` with standardized interface
- [x] Create `location.tsx` with standardized interface
- [x] Create `employee.tsx` with standardized interface
- [x] Create `shift.tsx` with standardized interface
- [x] Update `App.tsx` to use all providers in correct order
- [x] Create documentation in `docs/DATA_PROVIDERS.md`
- [x] Deprecate old hooks but maintain compatibility

### 2. Update Component Imports

Components found using old organization methods:

- [ ] `src/hooks/useOrganizationId.ts` (To be deprecated after migration)
- [ ] `src/lib/utils.ts` (Contains `getDefaultOrganizationId`, to be deprecated after migration)
- [ ] `src/components/onboarding/OnboardingModal.tsx`
- [ ] `src/pages/DailyShiftsPage.tsx`
- [ ] `src/pages/DashboardPage.tsx`
- [ ] `src/pages/EmployeesPage.tsx`
- [ ] `src/pages/LocationDetailPage.tsx`
- [ ] `src/pages/LocationsPage.tsx`
- [ ] `src/pages/SchedulesPage.tsx`

### 3. Migrate Organization-Related Components

- [ ] `DashboardPage.tsx`
- [ ] `BusinessProfilePage.tsx`
- [ ] `BillingPage.tsx`
- [ ] `EmployeesPage.tsx`
- [ ] `components/onboarding/OnboardingModal.tsx`
- [ ] `components/layout/AppSidebar.tsx` (if using organization context)

### 4. Migrate Location-Related Components

- [ ] `LocationsPage.tsx`
- [ ] `LocationDetailPage.tsx`
- [ ] `LocationFinancialReportPage.tsx`
- [ ] `LocationShiftPage.tsx`
- [ ] `LocationEmployeesPage.tsx`
- [ ] `LocationInsightsPage.tsx`

### 5. Migrate Employee-Related Components

- [ ] `EmployeesPage.tsx`
- [ ] `EmployeeDetailPage.tsx`
- [ ] `EmployeeEarningsPage.tsx`

### 6. Migrate Shift-Related Components

- [ ] `DailyShiftsPage.tsx`
- [ ] `MyShiftsPage.tsx`
- [ ] `SchedulePage.tsx`
- [ ] `SchedulesPage.tsx`
- [ ] `ShiftDetailsPage.tsx`
- [ ] `EditShiftPage.tsx`

### 7. Testing and Verification

- [ ] Test navigation between pages
- [ ] Verify entity selection works properly
- [ ] Test real-time updates
- [ ] Check error handling
- [ ] Verify loading states

### 8. Cleanup

- [ ] Remove `useOrganizationId.ts` hook (once all usages are migrated)
- [ ] Remove `getDefaultOrganizationId` from utils.ts (once all usages are migrated)
- [ ] Remove old organization context file (once all usages are migrated)
- [ ] Update documentation

## Dependencies

- Completed implementation of all context providers ✅
- Documentation in `docs/DATA_PROVIDERS.md` ✅

## Progress Tracking

| Category     | Total Components | Migrated | Percentage |
| ------------ | ---------------- | -------- | ---------- |
| Organization | 7                | 0        | 0%         |
| Location     | 6                | 0        | 0%         |
| Employee     | 3                | 0        | 0%         |
| Shift        | 6                | 0        | 0%         |
| **Overall**  | **22**           | **0**    | **0%**     |

## Related Issues

- Stripe Integration (billing relies on organization provider)
