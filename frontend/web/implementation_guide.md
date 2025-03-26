# Consolidated Shifts Table Implementation Guide

## Overview

This guide outlines the approach for implementing a unified "shifts" table that consolidates both schedule and shift functionality into a single database model. Since we're a startup without legacy data concerns, we can implement this cleaner approach from the beginning.

## Database Structure

The consolidated `shifts` table uses a hierarchical self-referencing design:

- Records with `is_schedule = true` represent schedules (the containers)
- Records with `is_schedule = false` represent individual shifts
- The `parent_shift_id` links shifts to their parent schedule

## Key Benefits

1. **Simpler Data Model**: A single table instead of two separate tables with overlapping functionality
2. **Reduced Code Complexity**: No need to manage multiple entities and their relationships
3. **Hierarchical Flexibility**: Can easily extend to support sub-schedules or grouped shifts in the future
4. **Query Efficiency**: Easier to query for all shifts in a schedule or for records within a date range
5. **API Consistency**: Single API pattern for both schedules and shifts

## Implementation Steps

### 1. Database Setup

- Create the `shifts` table with the structure defined in `shifts_schema.sql`
- Set up appropriate indexes for performance optimization

### 2. Backend Implementation

- Create API endpoints for the `shifts` table:

  - `GET /api/shifts` - List shifts with filtering options
  - `GET /api/shifts/:id` - Get a single shift/schedule
  - `POST /api/shifts` - Create a new shift/schedule
  - `PATCH /api/shifts/:id` - Update a shift/schedule
  - `DELETE /api/shifts/:id` - Delete a shift/schedule

- Implement filtering logic:
  - Use `is_schedule=true` to get schedules
  - Use `is_schedule=false` to get shifts
  - Use `parent_shift_id={id}` to get shifts for a specific schedule

### 3. Frontend Implementation

- Use the TypeScript model defined in `shifts.ts`
- The `ShiftsAPI` provides methods for both schedules and shifts
- Use helper types like `Schedule` and type guards like `isSchedule()` to differentiate

## Example Usage

### Creating a Schedule

```typescript
const newSchedule = await ShiftsAPI.createSchedule({
	name: "Summer 2024",
	start_time: "2024-06-01T00:00:00Z",
	end_time: "2024-08-31T23:59:59Z",
	organization_id: "org-123",
	is_schedule: true,
});
```

### Creating a Shift in a Schedule

```typescript
const newShift = await ShiftsAPI.createShift({
	start_time: "2024-06-01T09:00:00Z",
	end_time: "2024-06-01T17:00:00Z",
	organization_id: "org-123",
	parent_shift_id: newSchedule.id,
	position: "Cashier",
	user_id: "user-456",
	is_schedule: false,
});
```

### Getting All Shifts for a Schedule

```typescript
const shifts = await ShiftsAPI.getShiftsForSchedule(scheduleId);
```

## UI Considerations

- Schedule views can display a list of schedules (is_schedule=true)
- When a schedule is selected, display its shifts (parent_shift_id=selected.id)
- Calendar views can display shifts grouped by date and time
- Forms should be contextual:
  - Schedule creation forms include name and date range
  - Shift creation forms include time, position, and user assignment

## Future Extensions

This model can easily be extended to support:

1. Recurring shifts
2. Shift templates
3. Multi-level scheduling hierarchies
4. Shift swapping and availability
5. Time-off requests integrated with shifts
