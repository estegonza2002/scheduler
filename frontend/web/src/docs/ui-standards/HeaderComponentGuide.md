# Header Component Guide

This guide documents the standardized header components in the Employee Shift Scheduler application and provides guidance on their proper usage across the application.

## Table of Contents

1. [PageHeader](#pageheader)
2. [DialogHeader](#dialogheader)
3. [ContentSection Header](#contentsection-header)
4. [Application Header](#application-header)
5. [Usage Guidelines](#usage-guidelines)

## PageHeader

The `PageHeader` component is used at the top of pages to provide a consistent header structure.

### Import

```tsx
import { PageHeader } from "../components/ui/page-header";
```

### Basic Usage

```tsx
<PageHeader
	title="Employees"
	description="Manage your organization's employees"
/>
```

### With Actions

```tsx
<PageHeader
	title="Employees"
	description="Manage your organization's employees"
	actions={
		<Button variant="default">
			<Plus className="h-4 w-4 mr-2" />
			Add Employee
		</Button>
	}
/>
```

### Props

| Prop                 | Type            | Description                                    | Required |
| -------------------- | --------------- | ---------------------------------------------- | -------- |
| title                | string          | The title of the page                          | Yes      |
| description          | string          | Description text to display under the title    | No       |
| actions              | React.ReactNode | Action buttons to display in the header        | No       |
| className            | string          | Additional className for the header container  | No       |
| titleClassName       | string          | Additional className for the title text        | No       |
| descriptionClassName | string          | Additional className for the description text  | No       |
| actionsClassName     | string          | Additional className for the actions container | No       |

## DialogHeader

The `DialogHeader` component is used at the top of dialogs to provide a consistent header structure that matches the page header style.

### Import

```tsx
import { DialogHeader } from "../components/ui/dialog-header";
```

### Basic Usage

```tsx
<DialogHeader
	title="Add Employee"
	description="Create a new employee profile"
	onClose={() => setOpen(false)}
/>
```

### With Actions

```tsx
<DialogHeader
	title="Add Employee"
	description="Create a new employee profile"
	onClose={() => setOpen(false)}
	actions={
		<Button
			variant="outline"
			size="sm">
			Import
		</Button>
	}
/>
```

### Props

| Prop                 | Type            | Description                                    | Required |
| -------------------- | --------------- | ---------------------------------------------- | -------- |
| title                | string          | The title of the dialog                        | Yes      |
| description          | string          | Description text to display under the title    | No       |
| actions              | React.ReactNode | Action buttons to display in the header        | No       |
| onClose              | () => void      | Function to close the dialog                   | No       |
| className            | string          | Additional className for the header container  | No       |
| titleClassName       | string          | Additional className for the title text        | No       |
| descriptionClassName | string          | Additional className for the description text  | No       |
| actionsClassName     | string          | Additional className for the actions container | No       |

## ContentSection Header

The `ContentSection` component includes its own header for dividing content within a page.

### Import

```tsx
import { ContentSection } from "../components/ui/content-section";
```

### Basic Usage

```tsx
<ContentSection
	title="Recent Activity"
	description="Your team's recent actions">
	{/* Content goes here */}
</ContentSection>
```

### With Header Actions

```tsx
<ContentSection
	title="Recent Activity"
	description="Your team's recent actions"
	headerActions={
		<Button
			variant="outline"
			size="sm">
			View All
		</Button>
	}>
	{/* Content goes here */}
</ContentSection>
```

## Application Header

The application header is part of the `AppLayout` component and appears at the top of every page. It provides global navigation and context-specific actions.

### Components

- The application header is built into `AppLayout.tsx`
- It contains:
  - Sidebar toggle
  - Page title
  - Contextual action buttons
  - Notifications
  - Sample data toggle (for certain pages)

### Customization

If you need to add contextual actions to the application header, modify the `renderActionButton` function in `AppLayout.tsx`.

## Usage Guidelines

### When to Use Each Header

- **PageHeader**: Use at the top of every main page component
- **DialogHeader**: Use at the top of every dialog component
- **ContentSection**: Use to divide content within pages into logical sections
- **Application Header**: Used automatically by the AppLayout component

### Header Hierarchy

1. **Application Header**: Global navigation and context
2. **PageHeader**: Page-specific title and actions
3. **ContentSection**: Content division within a page

### Styling Guidelines

- Maintain consistent spacing:
  - Page headers use `py-6 px-4` (or equivalent)
  - Dialog headers use `py-5 px-4` (slightly smaller)
  - Content section headers have their own consistent spacing
- Typography:
  - Page headers use `text-3xl font-bold`
  - Dialog headers use `text-xl font-semibold`
  - Content section headers use `text-lg font-medium`

### Mobile Considerations

- All headers should be responsive and maintain readability on small screens
- Action buttons should stack or adapt appropriately for mobile
- Text should not overflow or be cut off

### Accessibility

- Use semantic heading elements (`h1`, `h2`, etc.) appropriate to the hierarchy
- Ensure sufficient color contrast between text and background
- Provide appropriate ARIA labels for action buttons

## Example Implementation

Here's a complete example showing the header hierarchy in a page:

```tsx
export default function EmployeesPage() {
	return (
		<>
			<PageHeader
				title="Employees"
				description="Manage your organization's employees"
				actions={
					<Button variant="default">
						<Plus className="h-4 w-4 mr-2" />
						Add Employee
					</Button>
				}
			/>

			<ContentContainer>
				<ContentSection
					title="Active Employees"
					description="Currently active employees in your organization"
					headerActions={
						<Button
							variant="outline"
							size="sm">
							Filter
						</Button>
					}>
					{/* Employee list */}
				</ContentSection>

				<ContentSection
					title="Inactive Employees"
					description="Employees who are currently inactive">
					{/* Inactive employee list */}
				</ContentSection>
			</ContentContainer>
		</>
	);
}
```
