# Form Evaluation Template

Use this template to evaluate each form in the application for standardization and optimization.

## Form Information

- **Form Name**: [Name of the form component]
- **File Location**: [Path to the file]
- **Purpose**: [What this form is used for]
- **Form Type**: [Creation/Edit/Multi-step/etc.]

## Component Usage

- [ ] Uses shadCN's `Form` component
- [ ] Uses shadCN's `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage` components
- [ ] Uses shadCN's `Input`, `Select`, etc. field components
- [ ] Uses `FormSection` for logical grouping (required for complex forms)
- [ ] Uses only Tailwind for styling (no custom CSS)

## Validation

- [ ] Uses zod for validation
- [ ] Schema defined outside component for reusability
- [ ] Proper validation messages for common fields
- [ ] Follows standard validation patterns for:
  - Email
  - Phone number
  - Required fields
  - Numeric values
  - Date validation

## Accessibility

- [ ] Proper `aria-` attributes on inputs
- [ ] Required field indicators
- [ ] Descriptive error messages
- [ ] Proper label associations
- [ ] Keyboard navigation support

## Performance

- [ ] Memoized callbacks
- [ ] Optimized useEffect dependencies
- [ ] Uses watch/register efficiently
- [ ] Avoids unnecessary re-renders

## Form Structure

- [ ] Logical field grouping
- [ ] Consistent grid layout
- [ ] Mobile responsive layout
- [ ] Icon decoration consistent with design system
- [ ] Consistent spacing between fields and sections

## State Management

- [ ] Loading state during submission
- [ ] Error toast messages
- [ ] Success handling with callbacks
- [ ] Form reset after submission (if appropriate)
- [ ] Proper handling of API errors

## Edge Cases

- [ ] Handles validation of optional fields correctly
- [ ] Validation for business rules (e.g., date ranges)
- [ ] Proper error handling for API failures

## Issues Identified

1.
2.
3.

## Recommendations

1.
2.
3.

## Standardization Tasks

- [ ] Task 1
- [ ] Task 2
- [ ] Task 3
