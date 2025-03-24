import type { Meta, StoryObj } from "@storybook/react";
import { FilterForm } from "@/components/search/FilterForm";
import { Calendar, Clock, Users, Building2 } from "lucide-react";

const meta: Meta<typeof FilterForm> = {
	title: "Components/Search/FilterForm",
	component: FilterForm,
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component: `A filter form component for advanced search filtering.

## Accessibility
- Uses semantic HTML with proper ARIA roles and labels
- Supports keyboard navigation (Tab, Enter)
- Provides clear visual and text indicators for form states
- Maintains sufficient color contrast for text and backgrounds
- Includes descriptive text for screen readers
- Uses appropriate ARIA landmarks and labels
- Supports screen reader announcements for filter changes
- Provides focus management for form fields
- Includes proper heading hierarchy
- Uses appropriate ARIA states for form validation
- Supports touch targets for mobile devices
- Provides clear visual feedback for interactions
- Maintains focus trap when modal is open
- Supports escape key to close modal

## Performance
- Lightweight component with minimal dependencies
- Efficient rendering with proper React patterns
- Optimized for re-renders with proper prop types
- Minimal DOM footprint
- Efficient state management
- Optimized animations and transitions
- Lazy loading of filter options
- Efficient icon rendering
- Optimized for large filter sets
- Efficient mobile viewport handling

## Mobile Responsiveness
- Adapts to different screen sizes
- Maintains readability on mobile devices
- Proper spacing and padding for touch targets
- Flexible width handling
- Icon scaling for different viewports
- Touch-friendly form controls
- Responsive typography
- Proper spacing in mobile layouts
- Optimized for touch interactions
- Supports mobile keyboard handling
- Adapts layout for small screens
- Handles orientation changes gracefully
- Provides mobile-specific interactions`,
			},
		},
	},
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof FilterForm>;

// Basic Examples
export const Default: Story = {
	render: () => <FilterForm />,
};

// With Date Range
export const WithDateRange: Story = {
	render: () => (
		<div className="space-y-4">
			<FilterForm />
			<div className="flex items-center gap-2">
				<Calendar className="h-4 w-4 text-muted-foreground" />
				<span className="text-sm font-medium">Date Range</span>
			</div>
			<div className="grid grid-cols-2 gap-4">
				<div>
					<label
						htmlFor="start-date"
						className="block text-sm font-medium">
						Start Date
					</label>
					<input
						type="date"
						id="start-date"
						className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
					/>
				</div>
				<div>
					<label
						htmlFor="end-date"
						className="block text-sm font-medium">
						End Date
					</label>
					<input
						type="date"
						id="end-date"
						className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
					/>
				</div>
			</div>
		</div>
	),
};

// With Shift Type
export const WithShiftType: Story = {
	render: () => (
		<div className="space-y-4">
			<FilterForm />
			<div className="flex items-center gap-2">
				<Clock className="h-4 w-4 text-muted-foreground" />
				<span className="text-sm font-medium">Shift Type</span>
			</div>
			<div className="grid grid-cols-2 gap-2">
				<button
					type="button"
					className="rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
					Morning
				</button>
				<button
					type="button"
					className="rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
					Afternoon
				</button>
				<button
					type="button"
					className="rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
					Night
				</button>
				<button
					type="button"
					className="rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
					Overtime
				</button>
			</div>
		</div>
	),
};

// With Department
export const WithDepartment: Story = {
	render: () => (
		<div className="space-y-4">
			<FilterForm />
			<div className="flex items-center gap-2">
				<Building2 className="h-4 w-4 text-muted-foreground" />
				<span className="text-sm font-medium">Department</span>
			</div>
			<select className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
				<option value="">All Departments</option>
				<option value="sales">Sales</option>
				<option value="marketing">Marketing</option>
				<option value="it">IT</option>
				<option value="hr">HR</option>
			</select>
		</div>
	),
};

// With Employee Count
export const WithEmployeeCount: Story = {
	render: () => (
		<div className="space-y-4">
			<FilterForm />
			<div className="flex items-center gap-2">
				<Users className="h-4 w-4 text-muted-foreground" />
				<span className="text-sm font-medium">Employee Count</span>
			</div>
			<div className="grid grid-cols-2 gap-4">
				<div>
					<label
						htmlFor="min-employees"
						className="block text-sm font-medium">
						Minimum
					</label>
					<input
						type="number"
						id="min-employees"
						min="0"
						className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
					/>
				</div>
				<div>
					<label
						htmlFor="max-employees"
						className="block text-sm font-medium">
						Maximum
					</label>
					<input
						type="number"
						id="max-employees"
						min="0"
						className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
					/>
				</div>
			</div>
		</div>
	),
};

// Mobile Optimized
export const MobileOptimized: Story = {
	render: () => (
		<div className="w-full max-w-[90vw] sm:max-w-md mx-auto">
			<FilterForm />
		</div>
	),
};

// With Active Filters
export const WithActiveFilters: Story = {
	render: () => (
		<div className="space-y-4">
			<FilterForm />
			<div className="flex flex-wrap gap-2">
				<button
					type="button"
					className="flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-sm text-primary-foreground hover:bg-primary/90">
					Morning Shift
					<span className="sr-only">Remove filter</span>
					<svg
						className="h-3 w-3"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2">
						<path d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
				<button
					type="button"
					className="flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-sm text-primary-foreground hover:bg-primary/90">
					Sales Department
					<span className="sr-only">Remove filter</span>
					<svg
						className="h-3 w-3"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2">
						<path d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
				<button
					type="button"
					className="flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-sm text-primary-foreground hover:bg-primary/90">
					Next Week
					<span className="sr-only">Remove filter</span>
					<svg
						className="h-3 w-3"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2">
						<path d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
		</div>
	),
};
