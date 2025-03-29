# Form Best Practices Guide

This guide outlines the standard practices for form implementation in our application, ensuring consistency, accessibility, and optimal performance.

## Component Structure

### Use shadCN Components

```tsx
// ✅ Good - Using shadCN form components
<FormField
  control={form.control}
  name="email"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

// ❌ Bad - Avoid direct usage without form components
<label htmlFor="email">Email</label>
<input id="email" {...register("email")} />
<p>{errors.email?.message}</p>
```

### Form Sections

Use the `FormSection` component to group related fields:

```tsx
<FormSection
	title="Contact Information"
	description="Provide contact details for communication">
	{/* Form fields go here */}
</FormSection>
```

## Validation Patterns

### Zod Schema Definition

Define schemas outside components for reusability:

```tsx
// ✅ Good - Schema defined outside component
const contactFormSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	email: z.string().email("Please enter a valid email address"),
	// ...more fields
});

type FormValues = z.infer<typeof contactFormSchema>;

// Then in your component:
const form = useForm<FormValues>({
	resolver: zodResolver(contactFormSchema),
	// ...
});
```

### Common Validation Patterns

Use these standard patterns for consistent validation:

```tsx
// Required string fields
fieldName: z.string().min(1, "Field name is required"),

// Email validation
email: z.string().email("Please enter a valid email address"),

// Phone number (with international format)
phone: z
  .string()
  .optional()
  .refine(
    (val) => !val || isValidPhoneNumber(val),
    "Please enter a valid phone number"
  ),

// Optional fields that might be empty strings
optionalField: z.string().optional().or(z.literal("")),

// Numeric values with range validation
numericField: z
  .string()
  .optional()
  .refine(
    (val) => {
      if (!val) return true;
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0 && num <= 1000;
    },
    {
      message: "Value must be between 0 and 1000",
    }
  ),

// Date validation
dateField: z
  .string()
  .optional()
  .refine(
    (val) => {
      if (!val) return true;
      // Custom date validation logic here
    },
    {
      message: "Please enter a valid date",
    }
  ),
```

## Layout & Styling

### Grid Layout for Forms

Use consistent grid layouts for form fields:

```tsx
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
	{/* Form fields go here */}
</div>
```

### Icon Decoration

Use icons consistently:

```tsx
<FormControl>
	<div className="flex items-center">
		<User className="w-4 h-4 mr-2 text-muted-foreground" />
		<Input {...field} />
	</div>
</FormControl>
```

## Accessibility

### Required Field Indicators

Mark required fields consistently:

```tsx
<FormLabel>
	Email <span className="text-destructive">*</span>
</FormLabel>
```

### ARIA Attributes

Add proper ARIA attributes:

```tsx
<Input
	{...field}
	aria-required="true"
	aria-invalid={!!form.formState.errors.fieldName}
	required
/>
```

## Performance Optimization

### Memoize Callbacks

```tsx
// Memoize callbacks to prevent unnecessary re-renders
const handleSubmit = useCallback(() => {
	return form.handleSubmit(onSubmit);
}, [form]);
```

### Optimize useEffect Dependencies

```tsx
useEffect(() => {
	// Only include necessary dependencies
}, [
	form.formState.isDirty,
	form.formState.isValid,
	// other required dependencies
]);
```

## Form Submission

### Loading State

```tsx
// Handle loading state during submission
const [isSubmitting, setIsSubmitting] = useState(false);

// In submit handler
const onSubmit = async (data) => {
	setIsSubmitting(true);
	try {
		// API call
	} finally {
		setIsSubmitting(false);
	}
};

// In the UI
<Button disabled={isSubmitting}>
	{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
	Submit
</Button>;
```

### Error Handling

```tsx
try {
	// API call
} catch (error) {
	// Check for specific error cases
	if (error instanceof Error && error.message?.includes("duplicate key")) {
		toast.error("A record with this information already exists");
		form.setError("fieldName", {
			type: "manual",
			message: "This value already exists",
		});
	} else {
		toast.error("An error occurred. Please try again.");
	}
}
```

## Mobile Responsiveness

Ensure all forms work well on mobile devices:

- Use responsive grid layouts
- Test field visibility and interaction on small screens
- Adjust spacing for touch-friendly interfaces
- Ensure error messages are visible on mobile

## Summary

Following these best practices ensures our forms are:

- Consistent in appearance and behavior
- Accessible to all users
- Optimized for performance
- Properly validated
- Responsive across devices
- User-friendly with clear feedback
