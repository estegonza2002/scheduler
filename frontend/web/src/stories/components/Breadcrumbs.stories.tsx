import type { Meta, StoryObj } from "@storybook/react";
import { Breadcrumbs } from "../../components/ui/breadcrumbs";
import { ChevronRight, Home, Settings, Users, Calendar } from "lucide-react";

const meta: Meta<typeof Breadcrumbs> = {
	title: "Components/Breadcrumbs",
	component: Breadcrumbs,
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component: `A breadcrumb navigation component that shows the current page location within a hierarchical structure.

## Accessibility
- Uses semantic HTML with proper ARIA roles and labels
- Supports keyboard navigation
- Provides clear visual and text indicators for current location
- Maintains sufficient color contrast for text and backgrounds
- Includes descriptive text for screen readers
- Uses appropriate ARIA landmarks and labels
- Supports screen reader announcements for navigation

## Performance
- Lightweight component with minimal dependencies
- Efficient rendering with proper React patterns
- Optimized for re-renders with proper prop types
- Minimal DOM footprint
- Memoized icon components

## Mobile Responsiveness
- Adapts to different screen sizes
- Maintains readability on mobile devices
- Proper spacing and padding for touch targets
- Flexible width handling
- Truncation for long paths
- Icon scaling for different viewports`,
			},
		},
	},
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Breadcrumbs>;

const defaultItems = [
	{ title: "Employees", href: "/employees" },
	{ title: "John Doe", href: "/employees/john-doe" },
	{ title: "Schedule", href: "/employees/john-doe/schedule" },
];

// Basic Examples
export const Default: Story = {
	args: {
		items: defaultItems,
		role: "navigation",
		"aria-label": "Breadcrumb navigation",
	},
};

export const WithoutHomeIcon: Story = {
	args: {
		items: defaultItems,
		homeIcon: false,
		role: "navigation",
		"aria-label": "Breadcrumb navigation",
	},
};

export const CustomSeparator: Story = {
	args: {
		items: defaultItems,
		separator: "/",
		role: "navigation",
		"aria-label": "Breadcrumb navigation",
	},
};

// Interactive Examples
export const Clickable: Story = {
	render: () => (
		<Breadcrumbs
			items={defaultItems}
			role="navigation"
			aria-label="Breadcrumb navigation"
			className="cursor-pointer hover:opacity-80 transition-opacity"
		/>
	),
};

// Accessibility Examples
export const WithAriaLabels: Story = {
	render: () => (
		<Breadcrumbs
			items={defaultItems}
			role="navigation"
			aria-label="Breadcrumb navigation"
			aria-current="page"
		/>
	),
};

// Responsive Examples
export const ResponsiveLayout: Story = {
	render: () => (
		<div className="w-full max-w-md mx-auto">
			<Breadcrumbs
				items={defaultItems}
				role="navigation"
				aria-label="Breadcrumb navigation"
				className="flex-wrap"
			/>
		</div>
	),
};

// Loading State
export const Loading: Story = {
	render: () => (
		<Breadcrumbs
			items={defaultItems}
			role="navigation"
			aria-label="Breadcrumb navigation"
			className="animate-pulse"
		/>
	),
};

// Edge Cases
export const LongItems: Story = {
	args: {
		items: [
			{ title: "Organization", href: "/org" },
			{ title: "Departments", href: "/org/departments" },
			{ title: "Human Resources", href: "/org/departments/hr" },
			{ title: "Employee Management", href: "/org/departments/hr/employees" },
			{
				title: "Schedule Management",
				href: "/org/departments/hr/employees/schedule",
			},
		],
		role: "navigation",
		"aria-label": "Breadcrumb navigation",
		className: "truncate",
	},
};

export const SingleItem: Story = {
	args: {
		items: [{ title: "Settings", href: "/settings" }],
		role: "navigation",
		"aria-label": "Breadcrumb navigation",
	},
};

// With Icons
export const WithIcons: Story = {
	render: () => (
		<Breadcrumbs
			items={[
				{ title: "Home", href: "/" },
				{ title: "Employees", href: "/employees" },
				{ title: "Schedule", href: "/employees/schedule" },
			]}
			role="navigation"
			aria-label="Breadcrumb navigation"
			separator={<ChevronRight className="h-4 w-4" />}
		/>
	),
};

// All Variants
export const AllVariants: Story = {
	render: () => (
		<div className="space-y-4">
			<Breadcrumbs
				items={defaultItems}
				role="navigation"
				aria-label="Breadcrumb navigation"
			/>
			<Breadcrumbs
				items={defaultItems}
				homeIcon={false}
				role="navigation"
				aria-label="Breadcrumb navigation"
			/>
			<Breadcrumbs
				items={defaultItems}
				separator="/"
				role="navigation"
				aria-label="Breadcrumb navigation"
			/>
		</div>
	),
};
