# Organization Management

This document describes the organization management system implemented in the scheduler application.

## Overview

The organization management system provides these key features:

1. **Multi-Tenant Architecture**: Each user can belong to one or more organizations
2. **Role-Based Access Control**: Users can have different roles (owner, admin, member) in each organization
3. **Organization Context**: All data (locations, employees, shifts) is scoped to organizations
4. **Automatic Organization Creation**: New users get a default organization automatically

## Implementation Details

### Database Schema

The system uses two primary tables:

- `organizations`: Stores organization details
- `organization_members`: Maps users to organizations with their roles

Additional tables like `locations`, `employees` and `shifts` reference the organization they belong to.

### Row Level Security

All tables have Row Level Security (RLS) policies that:

1. Restrict data access to organization members only
2. Limit modification capabilities based on user roles

### Context System

The app includes:

1. `OrganizationProvider`: React context that maintains the current organization state
2. `useOrganization()`: Hook to access organization data and operations
3. `useOrganizationId()`: Convenience hook to get the current organization ID
4. `getDefaultOrganizationId()`: Utility function for getting organization ID in both component and non-component contexts

## Usage

### In Components

```tsx
import { useOrganizationId } from "@/hooks/useOrganizationId";

function MyComponent() {
  // Get the current organization ID
  const organizationId = useOrganizationId();

  // Use it in API calls
  useEffect(() => {
    api.getLocations(organizationId).then(data => {
      // ...
    });
  }, [organizationId]);

  return (
    // ...
  );
}
```

For more advanced operations, use the organization context:

```tsx
import { useOrganization } from "@/lib/organization-context";

function OrganizationSettings() {
	const {
		currentOrganization,
		createOrganization,
		updateOrganization,
		selectOrganization,
		organizations,
	} = useOrganization();

	// Show organization selector
	return (
		<select
			value={currentOrganization?.id}
			onChange={(e) => selectOrganization(e.target.value)}>
			{organizations.map((org) => (
				<option
					key={org.id}
					value={org.id}>
					{org.name}
				</option>
			))}
		</select>
	);
}
```

## Deployment

To deploy the organization schema to your Supabase database:

1. See the instructions in `docs/deploy-organization-schema.md`
2. Apply the provided SQL script to create the necessary tables, functions, and policies
3. Update existing data to work with the new schema if needed

## Future Enhancements

Potential improvements to consider:

- Organization invitations system
- Organization settings and billing management
- Advanced role permissions beyond the basic three roles
- Organization switching UI improvements
