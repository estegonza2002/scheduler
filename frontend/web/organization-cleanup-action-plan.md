# Organization Cleanup Action Plan

Based on our script findings, here are the specific changes needed to eliminate the duplicate organization code.

## 1. Update Component Imports

The following files need to update their imports from `@/lib/organization` to `@/lib/organization-context`:

1. `src/components/SubscriptionModal.tsx`
2. `src/components/PricingPlans.tsx`
3. `src/components/marketing/RequestDemo.tsx`
4. `src/pages/UsersManagementPage.tsx`
5. `src/pages/BillingPage.tsx`
6. `src/pages/ContactPage.tsx`
7. `src/pages/AccountPage.tsx`

## 2. Update Utility Function Imports

The following files import `getOrgId` from `@/lib/organization` and need to be updated:

1. `src/hooks/useOrganizationId.ts`
2. `src/lib/shift.tsx`
3. `src/lib/utils.ts`
4. `src/lib/location.tsx`
5. `src/lib/employee.tsx`

## 3. Property Name Changes

After updating imports, the following changes are needed:

- Replace `organization` with `currentOrganization` in all files using the OrganizationContext
- Check the function signatures to ensure they match the organization-context.tsx implementation

## 4. Update useOrganizationId Hook

The `useOrganizationId` hook needs to be updated to use the correct function from organization-context.

## 5. Specific File Updates

### SubscriptionModal.tsx

```tsx
// Before
import { useOrganization } from "@/lib/organization";
const { organization } = useOrganization();

// After
import { useOrganization } from "@/lib/organization-context";
const { currentOrganization } = useOrganization();
```

### PricingPlans.tsx, RequestDemo.tsx, UsersManagementPage.tsx, BillingPage.tsx, ContactPage.tsx, AccountPage.tsx

Same pattern as above - update import and change `organization` to `currentOrganization`.

### useOrganizationId.ts

```tsx
// Before
import { getOrgId } from "@/lib/organization";

// After
import { getCurrentOrganizationId } from "@/lib/organization-utils";
// OR
import { useOrganization } from "@/lib/organization-context";
```

### shift.tsx, utils.ts, location.tsx, employee.tsx

```tsx
// Before
import { getOrgId } from "./organization";

// After
import { getCurrentOrganizationId } from "./organization-utils";
```

## 6. Deletion Step

Once all references are updated and the app is confirmed to be working:

1. Delete `src/lib/organization.tsx`
2. Verify app still functions correctly

## 7. Testing Checklist

Test the following functionality after making changes:

- [ ] User login flow
- [ ] Organization selection
- [ ] Stripe integration
- [ ] Billing page functionality
- [ ] User management
- [ ] Account page
- [ ] Creating organizations
- [ ] Joining organizations
- [ ] Switching between organizations
