# Consolidated Shifts API Implementation

## Overview

A unified approach to managing both schedules and individual shifts using a single data model:

- Records with `is_schedule = true` represent schedules (containers)
- Records with `is_schedule = false` represent individual shifts
- `parent_shift_id` links shifts to their parent schedule

## Data Model

```typescript
export interface Shift {
	id: string;
	created_at: string;
	updated_at: string;

	// Time information
	start_time: string;
	end_time: string;

	// Relations
	organization_id: string;
	user_id?: string;
	created_by?: string;
	location_id?: string;
	parent_shift_id?: string; // Self-reference to parent

	// Metadata
	name?: string;
	description?: string;
	position?: string;
	status?: string;
	is_schedule: boolean; // Flag to distinguish schedule vs shift

	// Optional associated data
	check_in_tasks?: ShiftTask[];
	check_out_tasks?: ShiftTask[];
}
```

## API Methods

### Schedule Methods

- `getAllSchedules(organizationId?)`
- `getScheduleById(id)`
- `createSchedule(data)`

### Shift Methods

- `getShiftsForSchedule(scheduleId)`
- `getShiftById(id)`
- `createShift(data)`

### Common Methods

- `updateShift(id, data)`
- `deleteShift(id)` - Also deletes all child shifts when deleting a schedule
- `updateShiftTasks(shiftId, updates)`
- `getAll(filters?)`

## Example Usage

```typescript
// Create a schedule
const newSchedule = await ShiftsAPI.createSchedule({
	name: "Summer 2024",
	start_time: "2024-06-01T00:00:00Z",
	end_time: "2024-08-31T23:59:59Z",
	organization_id: "org-123",
	is_schedule: true,
});

// Create a shift in a schedule
const newShift = await ShiftsAPI.createShift({
	start_time: "2024-06-01T09:00:00Z",
	end_time: "2024-06-01T17:00:00Z",
	organization_id: "org-123",
	parent_shift_id: newSchedule.id,
	position: "Cashier",
	user_id: "user-456",
	is_schedule: false,
});

// Get all shifts for a schedule
const shifts = await ShiftsAPI.getShiftsForSchedule(scheduleId);
```

## Benefits

This consolidated model provides several benefits:

1. **Simpler Data Model**: A single table instead of two separate tables
2. **Reduced Code Complexity**: No need to manage multiple entities and relationships
3. **Hierarchical Flexibility**: Can easily extend to support sub-schedules or grouped shifts
4. **Query Efficiency**: Easier to query for all shifts in a schedule or within a date range
5. **API Consistency**: Single API pattern for both schedules and shifts

## Future Extensions

This model can easily be extended to support:

1. Recurring shifts
2. Shift templates
3. Multi-level scheduling hierarchies
4. Shift swapping and availability
5. Time-off requests integrated with shifts
