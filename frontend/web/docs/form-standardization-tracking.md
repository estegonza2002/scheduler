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

| Form                  | Location                                 | Status    | Notes                                                           | Completed |
| --------------------- | ---------------------------------------- | --------- | --------------------------------------------------------------- | --------- |
| EmployeeForm          | src/components/EmployeeForm.tsx          | Completed | Already properly implemented with FormSection and accessibility | [x]       |
| LocationForm          | src/components/LocationForm.tsx          | Completed | Refactored with FormSection and added accessibility attributes  | [x]       |
| BusinessProfileForm   | src/pages/BusinessProfilePage.tsx        | Completed | Added memoized callbacks and accessibility attributes           | [x]       |
| LocationCreationSheet | src/components/LocationCreationSheet.tsx | Completed | Uses standardized LocationForm component with shadCN components | [x]       |
| FormPhoneInput        | src/components/ui/form-phone-input.tsx   | Completed | Custom component well-integrated with shadCN form components    | [x]       |
| LoginForm             | src/components/auth/LoginForm.tsx        | Completed | Added FormSection, accessibility attributes, memoized callbacks | [x]       |
| SignUpForm            | src/components/auth/SignUpForm.tsx       | Completed | Added FormSection, accessibility attributes, memoized callbacks | [x]       |
| ForgotPasswordPage    | src/pages/ForgotPasswordPage.tsx         | Completed | Added FormSection, accessibility attributes, memoized callbacks | [x]       |
| ProfilePage           | src/pages/ProfilePage.tsx                | Completed | Updated to use FormField/FormSection and added accessibility    | [x]       |

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

| Date       | Form                  | Updates                                           |
| ---------- | --------------------- | ------------------------------------------------- |
| 2023-05-15 | LocationForm          | Added FormSection components for logical grouping |
|            |                       | Added proper accessibility attributes to inputs   |
|            |                       | Memoized callbacks for better performance         |
|            |                       | Improved mobile-responsive layout                 |
|            |                       | Added required field indicators                   |
| 2023-05-16 | LoginForm             | Added FormSection for better structure            |
|            |                       | Added accessibility attributes to form fields     |
|            |                       | Implemented memoized callbacks with useCallback   |
|            |                       | Added aria-required and aria-invalid attributes   |
|            |                       | Added role="alert" to error messages              |
|            |                       | Fixed form submission with memoized callback      |
| 2023-05-16 | SignUpForm            | Restructured with multiple FormSection components |
|            |                       | Added accessibility attributes to all form fields |
|            |                       | Implemented memoized callbacks                    |
|            |                       | Improved form organization with logical sections  |
|            |                       | Added role="alert" to error messages              |
|            |                       | Fixed form submission with memoized callback      |
| 2023-05-16 | ForgotPasswordPage    | Added FormSection for better structure            |
|            |                       | Added accessibility attributes to form fields     |
|            |                       | Implemented memoized callbacks with useCallback   |
|            |                       | Added role="alert" to error messages              |
|            |                       | Fixed form submission with memoized callback      |
| 2023-05-16 | BusinessProfileForm   | Added accessibility attributes to all inputs      |
|            |                       | Converted all handler functions to useCallback    |
|            |                       | Added role="alert" to error messages              |
|            |                       | Fixed form submission with memoized callback      |
| 2023-05-17 | ProfilePage           | Converted inputs to use FormField components      |
|            |                       | Added FormPhoneInput for phone number field       |
|            |                       | Updated text-red-500 to text-destructive          |
|            |                       | Added appropriate aria-attributes                 |
|            |                       | Updated error handling to use FormMessage         |
|            |                       | Ensured all form fields use shadCN components     |
|            |                       | Reviewed and verified form meets all standards    |
|            |                       | Already using FormSection components              |
|            |                       | Already has proper accessibility attributes       |
|            |                       | Already using FormPhoneInput component            |
|            |                       | Already using shadCN components with Tailwind     |
|            |                       | No changes needed as form was well-implemented    |
|            |                       | Reviewed and found to be standard-compliant       |
|            |                       | Uses the already standardized LocationForm        |
|            |                       | Uses shadCN Tabs, Sheet, and other components     |
|            |                       | Properly structured with Tailwind                 |
|            |                       | No additional changes needed                      |
| 2023-05-17 | EmployeeForm          | Reviewed and verified form meets all standards    |
|            |                       | Already using FormSection components              |
|            |                       | Already has proper accessibility attributes       |
|            |                       | Already using FormPhoneInput component            |
|            |                       | Already using shadCN components with Tailwind     |
|            |                       | No changes needed as form was well-implemented    |
| 2023-05-17 | LocationCreationSheet | Reviewed and found to be standard-compliant       |
|            |                       | Uses the already standardized LocationForm        |
|            |                       | Uses shadCN Tabs, Sheet, and other components     |
|            |                       | Properly structured with Tailwind                 |
|            |                       | No additional changes needed                      |
| 2023-05-17 | FormPhoneInput        | Verified custom form component necessity          |
|            |                       | Properly integrated with react-hook-form          |
|            |                       | Uses shadCN form components for consistency       |
|            |                       | Follows Tailwind styling guidelines               |
|            |                       | Supports accessibility with labels and messages   |
|            |                       | Serves as a reusable component for phone fields   |

## Next Steps

1. ✅ Complete form standardization for all identified forms
2. Create a form component library documentation page
3. Add unit tests for custom form components
4. Implement form analytics to track form usage and error rates
5. Explore form performance optimizations
6. Create guides for developers on how to use the standardized form components
7. Set up automated checks to verify form standardization in new PRs
8. Review newly added forms periodically to ensure standards are maintained

## Notes

- All forms should follow the shadCN + Tailwind pattern as specified in the style guide
- Avoid custom CSS and unnecessary wrapper components
- Ensure consistent spacing and layout across all forms
- The codebase includes an ESLint rule for enforcing FormSection usage in forms (scripts/eslint-plugin-design-system/rules/enforce-form-section.js)
