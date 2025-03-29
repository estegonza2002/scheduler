# Context Providers Migration Guide

This guide explains how to migrate your components from using the old organization hooks to the new consolidated context providers system.

## Overview

We've implemented a new system of context providers that standardize how we access and manage data throughout the application:

- `OrganizationProvider` - For organization data and selection
- `LocationProvider` - For location data and selection
- `EmployeeProvider` - For employee data and selection
- `ShiftProvider` - For shift and schedule data and selection

These providers offer consistent interfaces, real-time updates, and better performance.

## Migration Steps

### 1. Update Imports

Replace the old imports:

```typescript
// OLD
import { useOrganizationId } from "@/hooks/useOrganizationId";
import { getDefaultOrganizationId } from "@/lib/utils";
```

With the new providers:

```typescript
// NEW
import { useOrganization, getOrganizationId } from "@/lib/organization";
import { useLocation } from "@/lib/location";
import { useEmployee } from "@/lib/employee";
import { useShift } from "@/lib/shift";
```

### 2. Replace Hook Usage

#### Organization ID

Old approach:

```typescript
// Using the hook in components
const organizationId = useOrganizationId();

// Or using the utility function in non-component code
const organizationId = getDefaultOrganizationId();
```

New approach:

```typescript
// In components, using the hook:
const { organization } = useOrganization();
const organizationId = organization?.id;

// In non-component code, using the static helper:
const organizationId = getOrganizationId();
```

#### Getting Entity Data

Old approach:

```typescript
// Old way - manual API call in component
const [organization, setOrganization] = useState<Organization | null>(null);
const organizationId = useOrganizationId();

useEffect(() => {
	if (organizationId) {
		OrganizationAPI.getOrganization(organizationId).then((data) => {
			setOrganization(data);
		});
	}
}, [organizationId]);
```

New approach:

```typescript
// New way - data provided by the provider
const { organization, isLoading, error } = useOrganization();

// Access organization data directly
```

### 3. Add Loading States

Providers include loading state management:

```typescript
const { organization, isLoading, error } = useOrganization();

if (isLoading) {
	return <LoadingState />;
}

if (error) {
	return <ErrorState error={error} />;
}

// Now use organization data safely
```

### 4. Working with Lists of Entities

Old approach:

```typescript
// Old way - manual API calls
const [locations, setLocations] = useState<Location[]>([]);
const organizationId = useOrganizationId();

useEffect(() => {
	if (organizationId) {
		LocationAPI.getLocations(organizationId).then((data) => {
			setLocations(data);
		});
	}
}, [organizationId]);
```

New approach:

```typescript
// New way - list provided by provider
const { locations, isLoading } = useLocation();

// Use the locations list directly
```

### 5. Entity Selection

For interfaces where users select entities (like choosing a location):

```typescript
const { locations, currentLocation, selectLocation } = useLocation();

// In your UI event handler:
const handleLocationSelect = (locationId: string) => {
	selectLocation(locationId);
};

// Then elsewhere, currentLocation will be the selected location
```

### 6. Example: Full Component Migration

#### Before

```tsx
import React, { useState, useEffect } from "react";
import { useOrganizationId } from "@/hooks/useOrganizationId";
import { LocationAPI, type Location } from "@/api";

export default function LocationsPage() {
	const [locations, setLocations] = useState<Location[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const organizationId = useOrganizationId();

	useEffect(() => {
		if (organizationId) {
			setIsLoading(true);
			LocationAPI.getLocations(organizationId)
				.then((data) => {
					setLocations(data);
					setIsLoading(false);
				})
				.catch((err) => {
					console.error(err);
					setIsLoading(false);
				});
		}
	}, [organizationId]);

	if (isLoading) {
		return <p>Loading...</p>;
	}

	return (
		<div>
			<h1>Locations</h1>
			<ul>
				{locations.map((location) => (
					<li key={location.id}>{location.name}</li>
				))}
			</ul>
		</div>
	);
}
```

#### After

```tsx
import React from "react";
import { useLocation } from "@/lib/location";
import { LoadingState } from "@/components/ui/loading-state";

export default function LocationsPage() {
	const { locations, isLoading, error } = useLocation();

	if (isLoading) {
		return <LoadingState />;
	}

	if (error) {
		return <p>Error: {error.message}</p>;
	}

	return (
		<div>
			<h1>Locations</h1>
			<ul>
				{locations.map((location) => (
					<li key={location.id}>{location.name}</li>
				))}
			</ul>
		</div>
	);
}
```

## Provider Nesting Order

The providers must be nested in this specific order in `App.tsx`:

```tsx
<AuthProvider>
	<OrganizationProvider>
		<LocationProvider>
			<EmployeeProvider>
				<ShiftProvider>{/* App content */}</ShiftProvider>
			</EmployeeProvider>
		</LocationProvider>
	</OrganizationProvider>
</AuthProvider>
```

This is important because providers depend on data from providers above them in the hierarchy.

## Reference

See [../reference/data-providers.md](../reference/data-providers.md) for complete reference documentation on all providers and their APIs.
