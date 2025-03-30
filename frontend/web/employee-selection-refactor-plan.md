# Employee Selection Component Refactor Plan

## Objective

Create a unified employee selection component to replace the duplicated functionality in AssignEmployeeStep and EmployeeAssignmentStep, and also use it for assigning employees to locations.

## Tasks

### Phase 1: Component Analysis and Design

- [x] Identify duplicate components (AssignEmployeeStep and EmployeeAssignmentStep)
- [x] Analyze functionality and identify common patterns
- [x] Design unified component interface and props

### Phase 2: Create Unified Component

- [ ] Create new EmployeeSelectionComponent
- [ ] Implement core employee filtering and selection functionality
- [ ] Add support for location-based employee grouping
- [ ] Make Selected Employees section optional and configurable
- [ ] Add customization options for titles, buttons, and layout

### Phase 3: Integrate with First Context (Assign to Existing Shift)

- [ ] Update AssignEmployeeDialog to use the new component
- [ ] Test functionality
- [ ] Fix any issues
- [ ] Remove the old AssignEmployeeStep component

### Phase 4: Integrate with Second Context (Shift Creation)

- [ ] Update the shift creation wizard to use the new component
- [ ] Test functionality
- [ ] Fix any issues
- [ ] Remove the old EmployeeAssignmentStep component

### Phase 5: Integrate with Third Context (Assign to Location)

- [ ] Identify the current location employee assignment component/flow
- [ ] Update location management to use the new component
- [ ] Test functionality
- [ ] Fix any issues
- [ ] Remove or refactor the old location assignment component

### Phase 6: Final Testing and Cleanup

- [ ] Verify all three usage contexts work correctly
- [ ] Delete old component files (AssignEmployeeStep.tsx, EmployeeAssignmentStep.tsx, etc.)
- [ ] Remove any imports or references to deleted components
- [ ] Delete any backup files or commented out code
- [ ] Remove related documentation for the old components
- [ ] Final review of the implementation
