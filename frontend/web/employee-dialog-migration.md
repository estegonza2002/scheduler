# Employee Dialog Migration Plan

## Overview

Converting the employee management UI from separate Sheet and Dialog components to a unified Dialog approach for better consistency and maintainability.

## Goals

- [x] Create a unified `EmployeeDialog` component that handles both adding and editing employees
- [x] Maintain all existing functionality from both Sheet and Dialog components
- [x] Improve UX consistency by using the same component pattern throughout
- [x] Reduce code duplication and maintenance overhead
- [x] Follow shadcn component guidelines and best practices

## Tasks

### 1. Create New Component ✅

- [x] Create `EmployeeDialog.tsx` component
- [x] Define component props and types
- [x] Implement dialog UI using shadcn components
- [x] Add state management for dialog steps
- [x] Implement form validation
- [x] Add location assignment functionality
- [x] Handle both add and edit modes

### 2. Update Implementation ✅

- [x] Ensure proper handling of both new and existing employees
- [x] Maintain multi-step wizard functionality
- [x] Implement proper state management
- [x] Add error handling
- [x] Ensure proper form validation
- [x] Test both add and edit flows

### 3. Replace Existing Components ✅

- [x] Update `EmployeesPage.tsx` to use new dialog
- [x] Update `EmployeeDetailPage.tsx` to use new dialog
- [x] Update `AdminDashboardPage.tsx` to use new dialog
- [x] Remove old sheet component usage
- [x] Update any dependent components

### 4. Testing and Validation

- [ ] Test all employee management flows
- [ ] Verify form validation
- [ ] Check error handling
- [ ] Test location assignment
- [ ] Verify proper state management
- [ ] Test edge cases
- [ ] Cross-browser testing

### 5. Documentation

- [ ] Update component documentation
- [ ] Add usage examples
- [ ] Document props and types
- [ ] Update any related documentation

### 6. Final Steps ✅

- [x] Remove old components
- [x] Clean up unused imports
- [x] Remove unused types
- [x] Final code review
- [ ] Deploy changes

## Progress Updates

### 2024-03-21

- Created new `EmployeeDialog` component with core functionality
- Implemented multi-step wizard
- Added location assignment capability
- Implemented error handling
- Added form validation

### 2024-03-22

- Replaced all instances of `EmployeeSheet` with new `EmployeeDialog`
- Updated `EmployeesPage.tsx`, `EmployeeDetailPage.tsx`, and `AdminDashboardPage.tsx`
- Maintained all existing functionality while improving consistency
- Removed old `EmployeeSheet`, `EditEmployeeDialog`, and `AddEmployeeDialog` components
- Cleaned up unused imports and types

## Notes

- Keeping existing `EmployeeForm` component for form handling
- Ensuring backward compatibility with existing data structures
- Following shadcn Dialog component patterns
- Maintaining accessibility standards
