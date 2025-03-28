# Context Providers Migration Strategy

## Overview

This document outlines the strategy for migrating the application from using multiple inconsistent organization-related hooks and providers to using our new consolidated context providers for Organization, Location, Employee, and Shift.

## Goals

1. Standardize data access patterns across the application
2. Implement real-time updates through provider subscriptions
3. Simplify component logic by centralizing data fetching and state management
4. Provide both hook-based and static helper functions for flexibility
5. Create a smooth migration path that doesn't break existing functionality

## New Provider Architecture

We've created standardized context providers for all main entities:

- `OrganizationProvider` - For organization data and selection
- `LocationProvider` - For location data and selection
- `EmployeeProvider` - For employee data and selection
- `ShiftProvider` - For shift and schedule data and selection

### Provider Features

Each provider implements:

1. **State management** - Holds the current entity list and selected entity
2. **Loading states** - Standardized loading indicators
3. **Real-time updates** - Supabase subscriptions for live data
4. **API integration** - Centralized data fetching
5. **Helper functions** - Both hook-based and static methods

## Implementation Approach

### Provider Hierarchy

Providers will be nested in the following order to ensure proper data access:

1. `AuthProvider`
2. `OrganizationProvider`
3. `LocationProvider`
4. `EmployeeProvider`
5. `ShiftProvider`

### Component Updates

When migrating components:

1. Replace imports to use new provider hooks
2. Update data access patterns to use the standardized methods
3. Implement loading states in components
4. Use the selection functionality where needed

### Backward Compatibility

To ensure a smooth migration:

1. Keep old hooks functioning during migration by internally using new providers
2. Deprecate old hooks with warning messages
3. Update documentation to guide developers to new patterns

## Migration Guidelines

### Replace Imports

```typescript
// OLD
import { useOrganizationId } from "@/hooks/useOrganizationId";
import { getDefaultOrganizationId } from "@/lib/utils";

// NEW
import { useOrganization, getOrganizationId } from "@/lib/organization";
```

### Replace Hook Usage

```typescript
// OLD
const organizationId = useOrganizationId();
// or
const organizationId = getDefaultOrganizationId();

// NEW
const { organization } = useOrganization();
const organizationId = organization?.id || getOrganizationId();
// or simply for non-component contexts
const organizationId = getOrganizationId();
```

### Implement Loading States

```typescript
const { organization, isLoading } = useOrganization();

if (isLoading) {
	return <LoadingState />;
}
```

### Use Entity Selection

```typescript
const { locations, currentLocation, selectLocation } = useLocation();

// When user selects a location
selectLocation(locationId);
```

## Testing Strategy

1. Create mocks for providers to use in tests
2. Test both hook behavior and static methods
3. Verify subscription and real-time update behavior
4. Ensure selection functionality works as expected

## Timeline and Phases

### Phase 1: Infrastructure (Completed)

- Create all provider implementations
- Update App.tsx to use providers
- Create documentation

### Phase 2: Component Migration

- Migrate organization-related components first
- Then location, employee, and shift components
- Test each component thoroughly after migration

### Phase 3: Cleanup

- Remove deprecated hooks and utility functions
- Update all documentation
- Final testing of the application

## Risk Mitigation

1. Keep old hooks working during migration
2. Implement and test one component at a time
3. Have comprehensive integration tests
4. Deploy changes incrementally

## Dependencies

- Completed implementation of all context providers
- Documentation in `docs/DATA_PROVIDERS.md`
