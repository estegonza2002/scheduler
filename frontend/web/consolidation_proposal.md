# Consolidating `schedules` and `shifts` tables

## Current Structure

### Schedules Table

- id (uuid) - Primary Key
- created_at (timestamptz)
- name (text)
- start_date (date)
- end_date (date)
- organization_id (uuid)
- status (text)
- created_by (uuid)

### Shifts Table

- id (uuid) - Primary Key
- created_at (timestamptz)
- start_time (timestamptz)
- end_time (timestamptz)
- user_id (uuid)
- organization_id (uuid)
- schedule_id (uuid) - Foreign Key to schedules.id
- position (text)
- status (text)

## Consolidated Structure

### Shifts Table (Consolidated)

- id (uuid) - Primary Key
- created_at (timestamptz)
- updated_at (timestamptz)
- start_time (timestamptz)
- end_time (timestamptz)
- user_id (uuid) - Optional, for shifts assigned to a user
- organization_id (uuid)
- name (text) - For schedule-type shifts
- description (text) - For notes or additional information
- is_schedule (boolean) - Flag to distinguish between schedule and shift records
- parent_shift_id (uuid) - Optional, self-referencing FK to parent schedule, null for top-level schedules
- position (text) - For assigned role/position
- status (text)
- created_by (uuid)
- location_id (uuid) - Optional, for shifts assigned to locations

## Migration Strategy

1. **Create the new consolidated table**:

   - Create the new `shifts` table with all the fields above

2. **Migrate data**:

   - Copy all schedules into the new table, setting `is_schedule = true`
   - For each schedule:

     - Set name, start_time, end_time from schedule data
     - Set parent_shift_id = NULL (these are top-level records)

   - Copy all shifts into the new table, setting `is_schedule = false`
   - For each shift:
     - Set parent_shift_id to the id of the schedule it belongs to

3. **Update application code**:
   - Modify code to use the new consolidated model
   - Add logic to filter by is_schedule flag when appropriate

## Benefits

1. **Simplified Data Model**: A single table to manage both concepts
2. **Hierarchical Structure**: Naturally represents schedules containing shifts
3. **Extensibility**: Future enhancements like sub-schedules can be easily added
4. **Better Querying**: Easier to query for all shifts in a schedule or for records within a date range

## API Changes Required

The API will need to be updated to:

1. Filter by `is_schedule` when getting schedules or shifts
2. Set `is_schedule` appropriately when creating records
3. Use `parent_shift_id` to establish relationships
