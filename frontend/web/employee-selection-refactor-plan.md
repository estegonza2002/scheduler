# Employee Selection Component Refactor Plan

## Objective

Create a unified employee selection component to replace the duplicated functionality in AssignEmployeeStep and EmployeeAssignmentStep, and also use it for assigning employees to locations.

## Tasks

### Phase 1: Component Analysis and Design

- [x] Identify duplicate components (AssignEmployeeStep and EmployeeAssignmentStep)
- [x] Analyze functionality and identify common patterns
- [x] Design unified component interface and props

### Phase 2: Create Unified Component

- [x] Create new EmployeeSelectionComponent
- [x] Implement core employee filtering and selection functionality
- [x] Add support for location-based employee grouping
- [x] Make Selected Employees section optional and configurable
- [x] Add customization options for titles, buttons, and layout

### Phase 3: Integrate with First Context (Assign to Existing Shift)

- [x] Update AssignEmployeeDialog to use the new component
- [x] Test functionality
- [x] Fix any issues
- [x] Remove the old AssignEmployeeStep component

### Phase 4: Integrate with Second Context (Shift Creation)

- [x] Update the shift creation wizard to use the new component
- [x] Test functionality
- [x] Fix any issues
- [x] Remove the old EmployeeAssignmentStep component

### Phase 5: Integrate with Third Context (Assign to Location)

- [x] Identify the current location employee assignment component/flow
- [x] Update location management to use the new component
- [x] Test functionality
- [x] Fix any issues
- [x] Remove or refactor the old location assignment component

### Phase 6: Final Testing and Cleanup

- [x] Verify all three usage contexts work correctly
- [x] Delete old component files (AssignEmployeeStep.tsx, EmployeeAssignmentStep.tsx, etc.)
- [x] Remove any imports or references to deleted components
- [x] Delete any backup files or commented out code
- [x] Remove related documentation for the old components
- [x] Final review of the implementation
