# Form Standardization Tracking

This document tracks the standardization and optimization of all forms in the application. We're ensuring all forms use shadCN components with Tailwind and follow best practices for validation, accessibility, and performance.

## Templates and Guidelines

- [Form Evaluation Template](./form-standardization-templates/form-evaluation-template.md) - Use this template to evaluate each form
- [Form Best Practices Guide](./form-standardization-templates/form-best-practices.md) - Reference for standardization
- [Employee Form Evaluation Example](./form-standardization-templates/employee-form-evaluation.md) - Example of a completed evaluation
- [Location Form Evaluation](./form-standardization-templates/location-form-evaluation.md) - Evaluation of LocationForm

## Form Components

- [x] Using shadCN components
- [x] Using Tailwind for styling (no custom CSS)
- [x] Using react-hook-form for form state management
- [x] Using zod for validation

## Form List and Status

| Form                  | Location                                 | Status      | Notes                                                           | Completed |
| --------------------- | ---------------------------------------- | ----------- | --------------------------------------------------------------- | --------- |
| EmployeeForm          | src/components/EmployeeForm.tsx          | To Review   | Form includes proper validation and shadCN components           | [ ]       |
| LocationForm          | src/components/LocationForm.tsx          | Completed   | Refactored with FormSection and added accessibility attributes  | [x]       |
| BusinessProfileForm   | src/pages/BusinessProfilePage.tsx        | Completed   | Added memoized callbacks and accessibility attributes           | [x]       |
| LocationCreationSheet | src/components/LocationCreationSheet.tsx | To Review   | Verify form meets standards                                     | [ ]       |
| FormPhoneInput        | src/components/ui/form-phone-input.tsx   | To Review   | Custom form component - verify necessity                        | [ ]       |
| LoginForm             | src/components/auth/LoginForm.tsx        | Completed   | Added FormSection, accessibility attributes, memoized callbacks | [x]       |
| SignUpForm            | src/components/auth/SignUpForm.tsx       | Completed   | Added FormSection, accessibility attributes, memoized callbacks | [x]       |
| ForgotPasswordPage    | src/pages/ForgotPasswordPage.tsx         | Completed   | Added FormSection, accessibility attributes, memoized callbacks | [x]       |
| ProfilePage           | src/pages/ProfilePage.tsx                | In Progress | Updating with memoized callbacks and accessibility attributes   | [ ]       |

## Form Standardization Checklist

For each form, ensure:

- [ ] Uses shadCN form components
- [ ] Uses Tailwind CSS (no custom CSS)
- [ ] No unnecessary wrapper components
- [ ] Proper validation with zod
- [ ] Accessible form labels and error messages
- [ ] Consistent styling with the rest of the application
- [ ] Form feedback on submission (loading states, error handling)
- [ ] Optimized re-renders
- [ ] Consistent field layouts and spacing
- [ ] Form section grouping where appropriate

## Custom Form Components

- **FormPhoneInput** - Custom wrapper around PhoneInput for use with react-hook-form
- **FormSection** - Component for grouping related form fields
- **GooglePlacesAutocomplete** - Used in LocationForm for address completion

## Form Patterns to Standardize

### Validation Schema Patterns

- All forms use zod schemas for validation
- Common validation patterns:
  - Required fields: `z.string().min(1, "Field is required")`
  - Email validation: `z.string().email("Invalid email address")`
  - Phone validation: `z.string().refine((val) => !val || isValidPhoneNumber(val), "Please enter a valid phone number")`
  - Optional fields: `z.string().optional().or(z.literal(""))`

### Form Structure Patterns

- Form sections for grouping related fields
- Consistent grid layout for form fields
- Icon decoration in input fields
- Loading state indicators during submission
- Error toast messages on form submission failure
- Success handling with callbacks

### Form Accessibility Patterns

- Required field indicators (`<span className="text-destructive">*</span>`)
- Proper aria attributes (`aria-required="true"`, `aria-invalid={!!form.formState.errors.fieldName}`)
- Descriptive error messages
- Proper focus management

## Standardization Process

1. Use the [Form Evaluation Template](./form-standardization-templates/form-evaluation-template.md) to evaluate each form
2. Identify issues and standardization tasks for the form
3. Create a PR to address the standardization tasks
4. Update the tracking document with progress
5. Mark as completed when all standardization tasks are done

## Progress Updates

| Date       | Form                | Updates                                           |
| ---------- | ------------------- | ------------------------------------------------- |
| 2023-05-15 | LocationForm        | Added FormSection components for logical grouping |
|            |                     | Added proper accessibility attributes to inputs   |
|            |                     | Memoized callbacks for better performance         |
|            |                     | Improved mobile-responsive layout                 |
|            |                     | Added required field indicators                   |
| 2023-05-16 | LoginForm           | Added FormSection for better structure            |
|            |                     | Added accessibility attributes to form fields     |
|            |                     | Implemented memoized callbacks with useCallback   |
|            |                     | Added aria-required and aria-invalid attributes   |
|            |                     | Added role="alert" to error messages              |
|            |                     | Fixed form submission with memoized callback      |
| 2023-05-16 | SignUpForm          | Restructured with multiple FormSection components |
|            |                     | Added accessibility attributes to all form fields |
|            |                     | Implemented memoized callbacks                    |
|            |                     | Improved form organization with logical sections  |
|            |                     | Added role="alert" to error messages              |
|            |                     | Fixed form submission with memoized callback      |
| 2023-05-16 | ForgotPasswordPage  | Added FormSection for better structure            |
|            |                     | Added accessibility attributes to form fields     |
|            |                     | Implemented memoized callbacks with useCallback   |
|            |                     | Added role="alert" to error messages              |
|            |                     | Fixed form submission with memoized callback      |
| 2023-05-16 | BusinessProfileForm | Added accessibility attributes to all inputs      |
|            |                     | Converted all handler functions to useCallback    |
|            |                     | Added role="alert" to error messages              |
|            |                     | Fixed form submission with memoized callback      |

## Next Steps

1. Complete ProfilePage form standardization
2. Evaluate remaining forms against the evaluation template
3. Standardize validation schemas across similar forms
4. Ensure consistent error handling and loading states
5. Update form styling to match application design system
6. Verify accessibility compliance
7. Test performance and optimize where needed
8. Create reusable hooks for common form patterns
9. Document best practices for form implementation

## Notes

- All forms should follow the shadCN + Tailwind pattern as specified in the style guide
- Avoid custom CSS and unnecessary wrapper components
- Ensure consistent spacing and layout across all forms
- The codebase includes an ESLint rule for enforcing FormSection usage in forms (scripts/eslint-plugin-design-system/rules/enforce-form-section.js)
