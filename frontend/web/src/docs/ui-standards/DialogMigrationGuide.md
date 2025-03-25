# Dialog Header Migration Guide

This guide provides instructions for updating existing dialog components to use the new standardized `DialogHeader` component.

## Why Migrate?

The new `DialogHeader` component provides:

- Consistent header styling across all dialogs
- Better alignment with our PageHeader component
- Improved close button placement and styling
- Standardized title and description formatting
- Support for header actions
- Better responsive behavior

## Migration Steps

### 1. Import the New Component

Replace:

```tsx
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
} from "./ui/dialog";
```

With:

```tsx
import {
	Dialog,
	DialogContent,
	DialogTrigger,
	DialogFooter,
} from "./ui/dialog";
import { DialogHeader } from "./ui/dialog-header";
```

### 2. Replace the Dialog Header Structure

Replace:

```tsx
<DialogHeader>
	<DialogTitle>Title Here</DialogTitle>
	<DialogDescription>Description text here.</DialogDescription>
</DialogHeader>
```

With:

```tsx
<DialogHeader
	title="Title Here"
	description="Description text here."
	onClose={() => setOpen(false)}
/>
```

### 3. Add Optional Properties

#### For headers with custom styling:

```tsx
<DialogHeader
	title="Title Here"
	description="Description text here."
	onClose={() => setOpen(false)}
	className="custom-header-class"
	titleClassName="custom-title-class"
	descriptionClassName="custom-description-class"
/>
```

#### For headers with actions:

```tsx
<DialogHeader
	title="Title Here"
	description="Description text here."
	onClose={() => setOpen(false)}
	actions={<Badge variant="secondary">Some Action</Badge>}
/>
```

## Before and After Example

### Before:

```tsx
<Dialog
	open={open}
	onOpenChange={handleOpenChange}>
	<DialogTrigger asChild>
		<Button>Open Dialog</Button>
	</DialogTrigger>
	<DialogContent className="sm:max-w-[425px]">
		<DialogHeader>
			<div className="flex items-center">
				<DialogTitle className="flex items-center">
					<User className="h-5 w-5 mr-2 text-primary" />
					User Profile
				</DialogTitle>
				<div className="ml-auto">
					<Badge variant="secondary">Premium</Badge>
				</div>
			</div>
			<DialogDescription>View and manage user information.</DialogDescription>
		</DialogHeader>

		{/* Dialog content */}

		<DialogFooter>
			<Button onClick={() => setOpen(false)}>Close</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>
```

### After:

```tsx
<Dialog
	open={open}
	onOpenChange={handleOpenChange}>
	<DialogTrigger asChild>
		<Button>Open Dialog</Button>
	</DialogTrigger>
	<DialogContent className="sm:max-w-[425px]">
		<DialogHeader
			title="User Profile"
			description="View and manage user information."
			titleClassName="flex items-center"
			actions={<Badge variant="secondary">Premium</Badge>}
			onClose={() => setOpen(false)}
		/>

		{/* Dialog content */}

		<DialogFooter>
			<Button onClick={() => setOpen(false)}>Close</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>
```

## Special Cases

### 1. Title with Icon

If your title includes an icon, use the `titleClassName` property:

```tsx
<DialogHeader
	title="User Profile"
	titleClassName="flex items-center"
	description="View and manage user information."
	onClose={() => setOpen(false)}
/>
```

And add the icon in your component:

```tsx
// Before rendering DialogHeader
const dialogTitle = (
	<>
		<User className="h-5 w-5 mr-2 text-primary" />
		User Profile
	</>
);

// Then in your JSX
<DialogHeader
	title={dialogTitle}
	description="View and manage user information."
	onClose={() => setOpen(false)}
/>;
```

### 2. Complex Descriptions

If your description needs custom formatting, you can pass JSX:

```tsx
const dialogDescription = (
	<span>
		View and manage <strong>user information</strong>.
		<a
			href="/help"
			className="text-primary ml-1">
			Need help?
		</a>
	</span>
);

<DialogHeader
	title="User Profile"
	description={dialogDescription}
	onClose={() => setOpen(false)}
/>;
```

## Testing Your Migration

After migrating, verify:

1. ✅ Dialog header appearance matches other dialogs
2. ✅ Close button functions correctly
3. ✅ Title and description are properly displayed
4. ✅ Any actions appear in the correct position
5. ✅ Dialog is responsive on mobile devices

## Examples of Migrated Components

See the following components for examples of completed migrations:

- `AddEmployeeDialog.tsx` - Basic dialog with tabs and badge
- `EditEmployeeDialog.tsx` - Dialog with form integration
- `DeleteEmployeeDialog.tsx` - Confirmation dialog with warning styling
