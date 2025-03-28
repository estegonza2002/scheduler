# Data Providers Guide

## Overview

This application uses React Context providers to manage state for core data entities:

1. **OrganizationProvider** - Manages organization data
2. **LocationProvider** - Manages location data
3. **EmployeeProvider** - Manages employee data
4. **ShiftProvider** - Manages shifts and schedules

Each provider follows a consistent pattern with these capabilities:

- State management for the entity
- Loading states
- API calls to refresh data
- Real-time updates via Supabase
- Helper functions for common operations

## Usage Guidelines

### Getting Current Entity

Each provider has a hook and static function you can use:

```tsx
// For component contexts
const { organization } = useOrganization();

// For any context (component or non-component)
const organizationId = getOrganizationId();
```

### Provider Pattern

Each provider exposes:

- A list of all entities (`organizations`, `locations`, `employees`, `shifts`)
- A current selected entity (`currentLocation`, `currentEmployee`, etc.)
- Loading state
- Refresh functions
- Helper methods

### Code Examples

#### Organization Context

```tsx
import { useOrganization, getOrganizationId } from "@/lib/organization";

function MyComponent() {
	const { organization, isLoading, refreshOrganization } = useOrganization();

	// Access organization data
	console.log(organization?.name);

	// Refresh data
	const handleRefresh = () => {
		refreshOrganization();
	};

	return (
		<div>
			{isLoading ? (
				<p>Loading...</p>
			) : (
				<p>Organization: {organization?.name}</p>
			)}
		</div>
	);
}
```

#### Location Context

```tsx
import { useLocation, getLocationId } from "@/lib/location";

function LocationSelector() {
	const { locations, currentLocation, selectLocation } = useLocation();

	return (
		<div>
			<h2>Select Location</h2>
			<select
				value={currentLocation?.id || ""}
				onChange={(e) => selectLocation(e.target.value)}>
				{locations.map((location) => (
					<option
						key={location.id}
						value={location.id}>
						{location.name}
					</option>
				))}
			</select>
		</div>
	);
}
```

#### Employee Context

```tsx
import { useEmployee } from "@/lib/employee";

function EmployeeList() {
	const { employees, isLoading, refreshEmployees } = useEmployee();

	return (
		<div>
			<h2>Employees</h2>
			<button onClick={refreshEmployees}>Refresh</button>

			{isLoading ? (
				<p>Loading employees...</p>
			) : (
				<ul>
					{employees.map((employee) => (
						<li key={employee.id}>{employee.name}</li>
					))}
				</ul>
			)}
		</div>
	);
}
```

#### Shift Context

```tsx
import { useShift } from "@/lib/shift";

function ScheduleSelector() {
	const { schedules, shifts, refreshShiftsForSchedule } = useShift();

	// Load shifts when schedule changes
	const handleScheduleChange = (scheduleId) => {
		refreshShiftsForSchedule(scheduleId);
	};

	return (
		<div>
			<h2>Schedules</h2>
			<select onChange={(e) => handleScheduleChange(e.target.value)}>
				{schedules.map((schedule) => (
					<option
						key={schedule.id}
						value={schedule.id}>
						{schedule.name}
					</option>
				))}
			</select>

			<h3>Shifts</h3>
			<ul>
				{shifts.map((shift) => (
					<li key={shift.id}>
						{new Date(shift.start_time).toLocaleTimeString()} -
						{new Date(shift.end_time).toLocaleTimeString()}
					</li>
				))}
			</ul>
		</div>
	);
}
```

## Migration Guide

If you were previously using `useOrganizationId()` or `getDefaultOrganizationId()`, please migrate to the new methods:

```tsx
// Old approach (deprecated)
import { useOrganizationId } from "@/hooks/useOrganizationId";
import { getDefaultOrganizationId } from "@/lib/utils";

// New approach
import { getOrganizationId } from "@/lib/organization";
```

## Provider Setup

All providers are set up in `App.tsx` in the following order:

1. `AuthProvider`
2. `OrganizationProvider`
3. `LocationProvider`
4. `EmployeeProvider`
5. `ShiftProvider`
6. Other providers (Stripe, Layout, etc.)

This ensures that each provider has access to the data it depends on.
