# Sheet Component

The Sheet component is used for creating slide-in panels that appear from the edge of the screen. It provides a container for forms, details, and multi-step workflows.

## Design Guidelines

Sheets should be implemented using shadCN components with Tailwind CSS only, avoiding custom CSS or unnecessary wrappers.

## Component Structure

Use the following structure for consistent sheet implementation:

```tsx
<StandardSheet
	title="Sheet Title"
	description="Optional description text"
	icon={<Icon className="h-5 w-5 text-primary" />}
	trigger={triggerElement}
	footer={footerContent}
	open={isOpen}
	onOpenChange={handleOpenChange}
	className="custom-class-if-needed"
	size="md">
	{/* Sheet content */}
</StandardSheet>
```

## StandardSheet Properties

| Property             | Type                                   | Description                                               |
| -------------------- | -------------------------------------- | --------------------------------------------------------- |
| `title`              | string                                 | Title of the sheet                                        |
| `description`        | string (optional)                      | Description text for the sheet                            |
| `icon`               | React.ReactNode (optional)             | Icon displayed next to the title                          |
| `children`           | React.ReactNode                        | Content of the sheet                                      |
| `trigger`            | React.ReactNode (optional)             | Custom trigger element                                    |
| `defaultTriggerText` | string (optional)                      | Text for default trigger if no custom trigger is provided |
| `footer`             | React.ReactNode (optional)             | Footer content like action buttons                        |
| `side`               | 'top' \| 'right' \| 'bottom' \| 'left' | Position from which the sheet appears                     |
| `open`               | boolean (optional)                     | Controls whether the sheet is open                        |
| `onOpenChange`       | (open: boolean) => void (optional)     | Callback when open state changes                          |
| `className`          | string (optional)                      | Additional CSS classes                                    |
| `size`               | 'sm' \| 'md' \| 'lg' \| 'xl' \| 'full' | Width of the sheet                                        |

## Usage Pattern Guidelines

Instead of creating custom wrapper components, use the standard ShadCN Sheet components directly. Here are patterns for common use cases:

## Header and Footer Consistency Guidelines

To ensure consistent sheet headers and footers across the application, follow these specific patterns:

### Header Pattern

All sheet headers should follow this structure:

```tsx
<SheetHeader>
	<div className="flex items-center gap-2">
		<Icon className="h-5 w-5 text-primary" />
		<SheetTitle>Sheet Title</SheetTitle>
	</div>
	<SheetDescription>
		Description text that explains the sheet's purpose
	</SheetDescription>
</SheetHeader>
```

Key requirements:

1. Always include an icon with the title
2. Use consistent size (`h-5 w-5`) and color (`text-primary`) for icons
3. Include a description when possible
4. Maintain consistent spacing between elements

### Footer Pattern

Sheet footers should follow consistent patterns based on sheet type and be sticky at the bottom of the sheet:

```tsx
<div className="flex flex-col h-full">
	<SheetHeader>{/* Header content */}</SheetHeader>

	<ScrollArea className="flex-1 my-4">
		<div className="px-1">{/* Main content */}</div>
	</ScrollArea>

	<SheetFooter className="sticky bottom-0 pt-2 bg-background border-t">
		{/* Footer buttons */}
	</SheetFooter>
</div>
```

#### Form Sheet Footer

```tsx
<SheetFooter>
	<Button
		variant="outline"
		onClick={handleCancel}>
		Cancel
	</Button>
	<Button
		type="submit"
		onClick={handleSubmit}
		disabled={isSubmitting}>
		{isSubmitting ? "Saving..." : "Save"}
	</Button>
</SheetFooter>
```

#### Success State Footer

```tsx
<SheetFooter>
	<Button
		variant="outline"
		onClick={() => handleOpenChange(false)}>
		Close
	</Button>
</SheetFooter>
```

#### Multi-step Footer

```tsx
<SheetFooter>
	{step > 1 && (
		<Button
			type="button"
			variant="outline"
			onClick={() => setStep((prev) => prev - 1)}
			className="mr-auto">
			Back
		</Button>
	)}
	<Button
		type="button"
		onClick={handleNext}>
		{isLastStep ? "Complete" : "Next"}
	</Button>
</SheetFooter>
```

Key requirements:

1. Show loading state in button text or with a spinner icon
2. Use consistent button ordering (Cancel/Back then Submit/Next)
3. Include disabled states for buttons when appropriate
4. Maintain consistent spacing between buttons
5. In success states, typically only show a "Close" button

### Form Sheets

Use for editing or creating resources. Follow this pattern:

```tsx
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
	SheetFooter,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { CheckCircle } from "lucide-react";

export function ExampleFormSheet() {
	const [isComplete, setIsComplete] = useState(false);

	const handleSubmit = () => {
		// Submit form logic
		setIsComplete(true);
	};

	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button>Open Form</Button>
			</SheetTrigger>
			<SheetContent className="sm:max-w-md p-0 flex flex-col h-full">
				<div className="p-6 pb-0">
					<SheetHeader>
						<SheetTitle>Edit Resource</SheetTitle>
						<SheetDescription>
							Make changes to your resource here. Click save when you're done.
						</SheetDescription>
					</SheetHeader>
				</div>

				<ScrollArea className="flex-1 px-6 my-4">
					{!isComplete ? (
						<div className="space-y-4">{/* Form fields go here */}</div>
					) : (
						<div className="flex flex-col items-center py-8 text-center">
							<div className="rounded-full bg-primary/10 p-3 mb-4">
								<CheckCircle className="h-8 w-8 text-primary" />
							</div>
							<h3 className="text-xl font-semibold mb-2">Success!</h3>
							<p className="text-muted-foreground">
								Your changes have been saved successfully.
							</p>
						</div>
					)}
				</ScrollArea>

				{!isComplete ? (
					<SheetFooter className="px-6 py-4 sticky bottom-0 bg-background border-t">
						<Button
							variant="outline"
							onClick={() => {}}>
							Cancel
						</Button>
						<Button
							type="submit"
							onClick={handleSubmit}>
							Save changes
						</Button>
					</SheetFooter>
				) : (
					<SheetFooter className="px-6 py-4 sticky bottom-0 bg-background border-t">
						<Button
							variant="outline"
							onClick={() => {}}>
							Close
						</Button>
					</SheetFooter>
				)}
			</SheetContent>
		</Sheet>
	);
}
```

### Confirmation Sheets

Use for confirming actions. Example:

```tsx
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
	SheetFooter,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export function ExampleConfirmationSheet() {
	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button variant="destructive">Delete Item</Button>
			</SheetTrigger>
			<SheetContent className="sm:max-w-sm p-0 flex flex-col h-full">
				<div className="p-6 pb-0">
					<SheetHeader>
						<div className="flex items-center gap-2">
							<AlertTriangle className="h-5 w-5 text-destructive" />
							<SheetTitle>Confirm Delete</SheetTitle>
						</div>
						<SheetDescription>
							This action cannot be undone. Are you sure?
						</SheetDescription>
					</SheetHeader>
				</div>

				<div className="flex-1 px-6 my-4">
					<div className="p-4 bg-destructive/10 rounded-md border border-destructive/30">
						<p className="text-sm text-muted-foreground">
							This will permanently delete this item and remove all associated
							data.
						</p>
					</div>
				</div>

				<SheetFooter className="px-6 py-4 sticky bottom-0 bg-background border-t">
					<SheetTrigger asChild>
						<Button variant="outline">Cancel</Button>
					</SheetTrigger>
					<Button
						variant="destructive"
						onClick={() => {}}>
						Delete
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
```

### Information Sheets

Use for displaying detailed information. Example:

```tsx
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
	SheetFooter,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Info } from "lucide-react";

export function ExampleInfoSheet() {
	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button variant="outline">View Details</Button>
			</SheetTrigger>
			<SheetContent className="sm:max-w-lg p-0 flex flex-col h-full">
				<div className="p-6 pb-0">
					<SheetHeader>
						<div className="flex items-center gap-2">
							<Info className="h-5 w-5 text-primary" />
							<SheetTitle>Item Details</SheetTitle>
						</div>
						<SheetDescription>
							Additional information about this item.
						</SheetDescription>
					</SheetHeader>
				</div>

				<ScrollArea className="flex-1 px-6 my-4">
					<div className="space-y-4">{/* Detail content goes here */}</div>
				</ScrollArea>

				<SheetFooter className="px-6 py-4 sticky bottom-0 bg-background border-t">
					<Button
						variant="outline"
						onClick={() => {}}>
						Close
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
```

### Multi-step Sheets

Use for workflows with multiple steps. Example:

```tsx
import { useState } from "react";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
	SheetFooter,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, ArrowRight, Check } from "lucide-react";

export function MultiStepSheetExample() {
	const [open, setOpen] = useState(false);
	const [step, setStep] = useState(1);
	const totalSteps = 3;

	// Step rendering logic here...

	return (
		<Sheet
			open={open}
			onOpenChange={setOpen}>
			<SheetTrigger asChild>
				<Button>
					<Calendar className="mr-2 h-4 w-4" />
					Create Item
				</Button>
			</SheetTrigger>

			<SheetContent className="sm:max-w-lg p-0 flex flex-col h-full">
				<div className="p-6 pb-0">
					<SheetHeader>
						<div className="flex items-center gap-2">
							<Calendar className="h-5 w-5 text-primary" />
							<SheetTitle>Create New Item</SheetTitle>
						</div>
						<SheetDescription>
							Complete each step to create a new item.
						</SheetDescription>

						{/* Progress indicator */}
						<div className="w-full mt-2">
							<div className="flex justify-between">
								{Array.from({ length: totalSteps }).map((_, index) => (
									<div
										key={index}
										className={`flex items-center justify-center w-8 h-8 rounded-full 
											${
												index + 1 === step
													? "bg-primary text-primary-foreground"
													: index + 1 < step
													? "bg-primary/20 text-primary"
													: "bg-muted text-muted-foreground"
											}`}>
										{index + 1 < step ? (
											<Check className="h-4 w-4" />
										) : (
											<span>{index + 1}</span>
										)}
									</div>
								))}
							</div>
							<div className="relative mt-1">
								<div className="absolute top-0 left-0 h-1 bg-muted w-full"></div>
								<div
									className="absolute top-0 left-0 h-1 bg-primary transition-all"
									style={{
										width: `${((step - 1) / (totalSteps - 1)) * 100}%`,
									}}></div>
							</div>
						</div>
					</SheetHeader>
				</div>

				<ScrollArea className="flex-1 px-6 my-4">
					{/* Step content rendered here */}
				</ScrollArea>

				<SheetFooter className="px-6 py-4 sticky bottom-0 bg-background border-t">
					{step > 1 && (
						<Button
							type="button"
							variant="outline"
							onClick={() => setStep((prev) => prev - 1)}
							className="mr-auto">
							Back
						</Button>
					)}
					<Button
						type="button"
						onClick={() => {
							if (step < totalSteps) {
								setStep((prev) => prev + 1);
							} else {
								// Handle submission
								setOpen(false);
							}
						}}>
						{step === totalSteps ? (
							"Complete"
						) : (
							<>
								Next <ArrowRight className="ml-2 h-4 w-4" />
							</>
						)}
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
```

## Sizing Guidelines

Use the following utility classes to control sheet width:

- `sm:max-w-sm` - Small (384px)
- `sm:max-w-md` - Medium (448px)
- `sm:max-w-lg` - Large (512px)
- `sm:max-w-xl` - Extra large (576px)
- `sm:max-w-2xl` - 2X large (672px)

## Common Success State Patterns

When displaying success states in sheets, follow these common patterns:

### Standard Success State

Use this pattern after a successful form submission or action:

```tsx
// Success state content component
const renderSuccessState = () => (
	<div className="flex flex-col items-center py-8 text-center">
		<div className="rounded-full bg-primary/10 p-3 mb-4">
			<CheckCircle className="h-8 w-8 text-primary" />
		</div>
		<h3 className="text-xl font-semibold mb-2">Action Completed</h3>
		<p className="text-muted-foreground mb-4">
			Your action has been completed successfully.
		</p>
	</div>
);

// In the Sheet component
<SheetContent className="p-0 flex flex-col h-full">
	{/* Header */}
	<div className="p-6 pb-0">
		<SheetHeader>...</SheetHeader>
	</div>

	{/* Content - Success state only displays content, no buttons */}
	<div className="flex-1 px-6 my-4 overflow-auto">
		{isSuccess ? renderSuccessState() : renderFormContent()}
	</div>

	{/* Footer - Success state buttons go here */}
	{isSuccess ? (
		<SheetFooter className="px-6 py-4 sticky bottom-0 bg-background border-t">
			<Button
				variant="outline"
				onClick={() => {}}>
				Close
			</Button>
		</SheetFooter>
	) : (
		<SheetFooter className="px-6 py-4 sticky bottom-0 bg-background border-t">
			{/* Form action buttons */}
		</SheetFooter>
	)}
</SheetContent>;
```

### Quantitative Success State

Use this pattern when reporting successful operations with quantities:

```tsx
<div className="flex flex-col items-center py-8 text-center">
	<div className="rounded-full bg-primary/10 p-3 mb-4">
		<CheckCircle className="h-8 w-8 text-primary" />
	</div>
	<h3 className="text-xl font-semibold mb-2">
		{count} {itemLabel}
		{count !== 1 ? "s" : ""} Added
	</h3>
	<p className="text-muted-foreground mb-4">
		Your items have been successfully {actionVerb}.
	</p>
</div>;

{
	/* Footer with buttons */
}
<SheetFooter className="px-6 py-4 sticky bottom-0 bg-background border-t">
	<Button
		variant="outline"
		onClick={() => handleReset()}
		className="mr-auto">
		Add More
	</Button>
	<Button onClick={() => handleClose()}>Close</Button>
</SheetFooter>;
```

### Key Success State Guidelines

1. Success state visuals should be in the content area
2. Success state buttons should always be in the footer
3. Use consistent icons and colors for success states
4. Include the quantity of affected items when applicable
5. Offer a way to perform additional actions when appropriate
6. Always provide a clear way to dismiss or close the sheet

## Sticky Footer Implementation

To ensure consistent sheet layout with sticky headers and footers that remain visible while scrolling content, follow these guidelines:

### Sheet Layout Structure

1. Remove default padding from SheetContent and use a flex column layout:

```tsx
<SheetContent className="p-0 flex flex-col h-full">
	{/* Content goes here */}
</SheetContent>
```

2. Structure the content in three sections:
   - Header area with padding
   - Scrollable content area with flex-grow (only content, no action buttons)
   - Sticky footer with border and background for all action buttons

```tsx
<SheetContent className="p-0 flex flex-col h-full">
	{/* Header section */}
	<div className="p-6 pb-0">
		<SheetHeader>{/* Header content */}</SheetHeader>
	</div>

	{/* Scrollable content - DO NOT place CTAs here */}
	<div className="flex-1 px-6 my-4 overflow-auto">
		{/* Main content only */}
	</div>

	{/* Sticky footer - ALL CTAs go here */}
	<SheetFooter className="px-6 py-4 sticky bottom-0 bg-background border-t">
		{/* Action buttons */}
	</SheetFooter>
</SheetContent>
```

### CTA Placement Rules

1. **Always** place action buttons (CTAs) in the sticky footer, never in the content area
2. In forms, the submit/cancel buttons should be in the footer
3. In success states, the "Close" button should be in the footer
4. In multi-step workflows, navigation buttons should be in the footer
5. The footer should remain visible at all times, ensuring users can always access actions

### Key CSS Classes

- `p-0` - Remove default padding from SheetContent
- `flex flex-col h-full` - Create full-height flex column layout
- `flex-1` - Allow content area to grow and fill available space
- `overflow-auto` - Enable scrolling for content area
- `sticky bottom-0` - Make footer stick to bottom
- `bg-background` - Ensure footer has same background as the sheet
- `border-t` - Add a subtle top border to visually separate the footer

### Common Mistakes to Avoid

1. Not using `h-full` with flex layout
2. Using fixed height values that don't adapt to screen sizes
3. Forgetting to add background to sticky footer
4. Not adding padding around content areas
5. Using `position: fixed` instead of `position: sticky`

## Controlling Sheet State

For controlled sheet components, use state:

```tsx
const [open, setOpen] = useState(false);

return (
	<Sheet
		open={open}
		onOpenChange={setOpen}>
		{/* Sheet content */}
	</Sheet>
);
```

## Accessibility

- Ensure sheets can be navigated using keyboard
- Include proper focus management
- Use ARIA attributes and roles properly
- Screen reader friendly
- Include a close button or clear way to dismiss

## Best Practices

1. Use a consistent width for similar types of sheets
2. Use the ScrollArea component for content that might overflow
3. Always provide a way to close the sheet
4. Maintain consistent padding and spacing
5. Use standard header and footer patterns
6. Display icons next to titles when possible for visual recognition
7. Keep sheet titles concise and descriptive
8. Use appropriate form layout techniques inside sheets

## Sheet Pattern: Sticky Footer

For sheets that contain forms or multi-step wizards, we use a consistent pattern of placing action buttons in a sticky footer at the bottom of the sheet.

### Implementation Guidelines

1. Always place primary call-to-action buttons in the `SheetFooter` component
2. Use a border-top to visually separate the footer from the content
3. For multi-step forms, display appropriate navigation buttons based on the current step
4. Maintain consistent button ordering: "Back/Cancel" on the left, "Continue/Submit" on the right

### Example: Form with Sticky Footer

```tsx
<Sheet>
	<SheetTrigger asChild>
		<Button>Open Form</Button>
	</SheetTrigger>
	<SheetContent>
		<SheetHeader>
			<SheetTitle>Form Title</SheetTitle>
			<SheetDescription>Form description</SheetDescription>
		</SheetHeader>

		<div className="py-4">
			<form id="my-form">{/* Form content here */}</form>
		</div>

		<SheetFooter className="flex justify-between border-t pt-4">
			<Button
				variant="outline"
				onClick={onCancel}>
				Cancel
			</Button>
			<Button
				type="submit"
				form="my-form">
				Submit
			</Button>
		</SheetFooter>
	</SheetContent>
</Sheet>
```

### Example: Multi-Step Wizard with Sticky Footer

For multi-step wizards, the footer should update dynamically based on the current step. This example shows how to conditionally render appropriate buttons for each step:

```tsx
<Sheet>
	<SheetContent>
		<SheetHeader>
			<SheetTitle>Multi-Step Wizard</SheetTitle>
		</SheetHeader>

		<div className="flex-1 overflow-auto">
			{/* Multi-step wizard content */}
			{currentStep === "step1" && <Step1Component />}
			{currentStep === "step2" && <Step2Component />}
			{currentStep === "step3" && <Step3Component />}
		</div>

		<SheetFooter className="flex justify-between border-t pt-4">
			{currentStep === "step1" ? (
				<>
					<Button
						variant="outline"
						onClick={handleCancel}>
						Cancel
					</Button>
					<Button
						onClick={handleNextStep}
						disabled={!step1Valid}>
						Continue
						<ArrowRight className="ml-2 h-4 w-4" />
					</Button>
				</>
			) : currentStep === "step2" ? (
				<>
					<Button
						variant="outline"
						onClick={handlePreviousStep}>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back
					</Button>
					<Button
						onClick={handleNextStep}
						disabled={!step2Valid}>
						Continue
						<ArrowRight className="ml-2 h-4 w-4" />
					</Button>
				</>
			) : (
				<>
					<Button
						variant="outline"
						onClick={handlePreviousStep}>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back
					</Button>
					<Button
						onClick={handleComplete}
						disabled={isSubmitting}>
						{isSubmitting ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Submitting...
							</>
						) : (
							"Complete"
						)}
					</Button>
				</>
			)}
		</SheetFooter>
	</SheetContent>
</Sheet>
```

## Sheet Pattern: Success State

// ... existing code ...
