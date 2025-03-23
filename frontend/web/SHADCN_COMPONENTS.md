# ShadCN Components Guide

This document provides an overview of all ShadCN components used in our Employee Shift Schedule App, including customization options, examples, and best practices.

## Table of Contents

1. [Introduction](#introduction)
2. [Core Components](#core-components)
3. [Form Components](#form-components)
4. [Layout Components](#layout-components)
5. [Data Display Components](#data-display-components)
6. [Navigation Components](#navigation-components)
7. [Feedback Components](#feedback-components)
8. [New York Style Customization](#new-york-style-customization)
9. [Best Practices](#best-practices)

## Introduction

Our application uses ShadCN UI components, which are built on top of Radix UI primitives and styled with Tailwind CSS. These components provide a consistent design language throughout the application while being highly customizable.

### Installation

ShadCN components are already installed in the project. The components are located in `src/components/ui/`.

## Core Components

### Button

The Button component is used for actions and navigation.

```jsx
import { Button } from "@/components/ui/button";

// Default button
<Button>Click me</Button>

// Button variants
<Button variant="default">Default</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Button sizes
<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon">Icon</Button>
```

### Card

Cards are used to group related content and actions.

```jsx
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

<Card>
	<CardHeader>
		<CardTitle>Card Title</CardTitle>
		<CardDescription>Card Description</CardDescription>
	</CardHeader>
	<CardContent>
		<p>Card Content</p>
	</CardContent>
	<CardFooter>
		<Button>Action</Button>
	</CardFooter>
</Card>;
```

### Avatar

Avatars represent users or entities.

```jsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

<Avatar>
	<AvatarImage
		src="https://example.com/avatar.jpg"
		alt="User"
	/>
	<AvatarFallback>JD</AvatarFallback>
</Avatar>;
```

## Form Components

### Input

Input elements for collecting data.

```jsx
import { Input } from "@/components/ui/input";

<Input type="text" placeholder="Enter your name" />
<Input type="email" placeholder="Email" />
<Input type="password" placeholder="Password" />
```

### Label

Labels for form elements.

```jsx
import { Label } from "@/components/ui/label";

<Label htmlFor="email">Email</Label>
<Input id="email" type="email" />
```

### Checkbox

Checkbox for selecting options.

```jsx
import { Checkbox } from "@/components/ui/checkbox";

<div className="flex items-center space-x-2">
	<Checkbox id="terms" />
	<Label htmlFor="terms">Accept terms and conditions</Label>
</div>;
```

### Select

Dropdown select component.

```jsx
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

<Select>
	<SelectTrigger>
		<SelectValue placeholder="Select an option" />
	</SelectTrigger>
	<SelectContent>
		<SelectItem value="option1">Option 1</SelectItem>
		<SelectItem value="option2">Option 2</SelectItem>
		<SelectItem value="option3">Option 3</SelectItem>
	</SelectContent>
</Select>;
```

## Layout Components

### Dialog

Modal dialogs for focused interactions.

```jsx
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

<Dialog>
	<DialogTrigger asChild>
		<Button>Open Dialog</Button>
	</DialogTrigger>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Dialog Title</DialogTitle>
			<DialogDescription>Dialog Description</DialogDescription>
		</DialogHeader>
		<div>Dialog Content</div>
		<DialogFooter>
			<Button>Save</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>;
```

### Tabs

Tab navigation for organizing content.

```jsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

<Tabs defaultValue="tab1">
	<TabsList>
		<TabsTrigger value="tab1">Tab 1</TabsTrigger>
		<TabsTrigger value="tab2">Tab 2</TabsTrigger>
	</TabsList>
	<TabsContent value="tab1">Tab 1 Content</TabsContent>
	<TabsContent value="tab2">Tab 2 Content</TabsContent>
</Tabs>;
```

## Data Display Components

### Table

Structured data display.

```jsx
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

<Table>
	<TableCaption>A list of users</TableCaption>
	<TableHeader>
		<TableRow>
			<TableHead>Name</TableHead>
			<TableHead>Email</TableHead>
			<TableHead>Role</TableHead>
		</TableRow>
	</TableHeader>
	<TableBody>
		<TableRow>
			<TableCell>John Doe</TableCell>
			<TableCell>john@example.com</TableCell>
			<TableCell>Admin</TableCell>
		</TableRow>
		<TableRow>
			<TableCell>Jane Smith</TableCell>
			<TableCell>jane@example.com</TableCell>
			<TableCell>User</TableCell>
		</TableRow>
	</TableBody>
</Table>;
```

### Calendar

Date selection and display.

```jsx
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";

function DatePicker() {
	const [date, setDate] = useState(new Date());

	return (
		<Calendar
			mode="single"
			selected={date}
			onSelect={setDate}
			className="rounded-md border"
		/>
	);
}
```

## Navigation Components

### Breadcrumb

Breadcrumb navigation.

```jsx
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

<Breadcrumb>
	<BreadcrumbList>
		<BreadcrumbItem>
			<BreadcrumbLink href="/">Home</BreadcrumbLink>
		</BreadcrumbItem>
		<BreadcrumbSeparator />
		<BreadcrumbItem>
			<BreadcrumbLink href="/employees">Employees</BreadcrumbLink>
		</BreadcrumbItem>
		<BreadcrumbSeparator />
		<BreadcrumbItem>
			<BreadcrumbPage>John Doe</BreadcrumbPage>
		</BreadcrumbItem>
	</BreadcrumbList>
</Breadcrumb>;
```

### DropdownMenu

Contextual dropdown menus.

```jsx
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

<DropdownMenu>
	<DropdownMenuTrigger asChild>
		<Button variant="outline">Open Menu</Button>
	</DropdownMenuTrigger>
	<DropdownMenuContent>
		<DropdownMenuLabel>Actions</DropdownMenuLabel>
		<DropdownMenuSeparator />
		<DropdownMenuItem>Edit</DropdownMenuItem>
		<DropdownMenuItem>Duplicate</DropdownMenuItem>
		<DropdownMenuItem>Delete</DropdownMenuItem>
	</DropdownMenuContent>
</DropdownMenu>;
```

## Feedback Components

### Alert

Display important messages to users.

```jsx
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

<Alert>
	<AlertTitle>Information</AlertTitle>
	<AlertDescription>This is an informational alert.</AlertDescription>
</Alert>;
```

### Toast

Temporary notifications.

```jsx
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

function ToastDemo() {
	const { toast } = useToast();

	return (
		<Button
			onClick={() => {
				toast({
					title: "Success",
					description: "Your action was successful.",
				});
			}}>
			Show Toast
		</Button>
	);
}
```

## New York Style Customization

Our project uses the "New York" style variant of ShadCN components, which features:

- Squared corners (border-radius: 0)
- Stronger, more visible borders
- Enhanced shadows for depth
- Modified color palette

The customization is applied through Tailwind configuration:

```js
// tailwind.config.js
module.exports = {
	theme: {
		extend: {
			borderRadius: {
				lg: "0",
				md: "0",
				sm: "0",
			},
		},
	},
};
```

## Best Practices

### Component Usage

1. Always use ShadCN components for UI elements instead of creating custom ones
2. Use Tailwind utility classes for layout and minor styling adjustments
3. Avoid inline styles
4. Follow the component composition pattern (e.g., use CardHeader, CardContent, CardFooter with Card)

### Styling Guidelines

1. Use the predefined variants and sizes for components
2. Use the Tailwind color palette consistently
3. For spacing, use Tailwind's spacing scale
4. Keep component-specific styling in the components, not in page files

### Accessibility

1. Always include proper labels for form elements
2. Use appropriate ARIA attributes when necessary
3. Ensure proper color contrast
4. Test keyboard navigation regularly

### Performance

1. Use properly optimized images with the Image component
2. Implement lazy loading for components when appropriate
3. Keep component hierarchy relatively flat when possible

## Example Page Structure

Here's an example of a properly structured page using ShadCN components:

```jsx
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ExamplePage() {
	return (
		<div className="container mx-auto py-8">
			<h1 className="text-2xl font-bold mb-6">Example Page</h1>

			<Card>
				<CardHeader>
					<CardTitle>User Information</CardTitle>
					<CardDescription>Fill in your details below</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="name">Name</Label>
							<Input
								id="name"
								placeholder="Enter your name"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="Enter your email"
							/>
						</div>
					</div>
				</CardContent>
				<CardFooter>
					<Button>Save Changes</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
```
