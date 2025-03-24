import type { Meta, StoryObj } from "@storybook/react";
import { SearchResults } from "@/components/search/SearchResults";
import { User, Calendar, Clock, Building2 } from "lucide-react";

const meta: Meta<typeof SearchResults> = {
	title: "Components/Search/SearchResults",
	component: SearchResults,
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component: `A search results component for displaying filtered and sorted results.

## Accessibility
- Uses semantic HTML with proper ARIA roles and labels
- Supports keyboard navigation (Tab, Enter)
- Provides clear visual and text indicators for result states
- Maintains sufficient color contrast for text and backgrounds
- Includes descriptive text for screen readers
- Uses appropriate ARIA landmarks and labels
- Supports screen reader announcements for result changes
- Provides focus management for result items
- Includes proper heading hierarchy
- Uses appropriate ARIA states for result selection
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
- Lazy loading of result items
- Efficient icon rendering
- Optimized for large result sets
- Efficient mobile viewport handling

## Mobile Responsiveness
- Adapts to different screen sizes
- Maintains readability on mobile devices
- Proper spacing and padding for touch targets
- Flexible width handling
- Icon scaling for different viewports
- Touch-friendly result items
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
type Story = StoryObj<typeof SearchResults>;

// Basic Examples
export const Default: Story = {
	render: () => <SearchResults />,
};

// With Results
export const WithResults: Story = {
	render: () => (
		<div className="space-y-4">
			<SearchResults />
			<div className="rounded-md border">
				<div className="p-4">
					<h3 className="text-sm font-medium">Search Results</h3>
					<p className="mt-1 text-sm text-muted-foreground">
						Found 3 results for "John"
					</p>
				</div>
				<div className="divide-y">
					<div className="p-4 hover:bg-accent">
						<div className="flex items-center gap-4">
							<div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
								<User className="h-5 w-5 text-primary" />
							</div>
							<div>
								<h4 className="font-medium">John Smith</h4>
								<p className="text-sm text-muted-foreground">
									Sales Department
								</p>
							</div>
						</div>
					</div>
					<div className="p-4 hover:bg-accent">
						<div className="flex items-center gap-4">
							<div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
								<User className="h-5 w-5 text-primary" />
							</div>
							<div>
								<h4 className="font-medium">John Doe</h4>
								<p className="text-sm text-muted-foreground">
									Marketing Department
								</p>
							</div>
						</div>
					</div>
					<div className="p-4 hover:bg-accent">
						<div className="flex items-center gap-4">
							<div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
								<User className="h-5 w-5 text-primary" />
							</div>
							<div>
								<h4 className="font-medium">Johnny Johnson</h4>
								<p className="text-sm text-muted-foreground">IT Department</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	),
};

// With Shift Results
export const WithShiftResults: Story = {
	render: () => (
		<div className="space-y-4">
			<SearchResults />
			<div className="rounded-md border">
				<div className="p-4">
					<h3 className="text-sm font-medium">Shift Results</h3>
					<p className="mt-1 text-sm text-muted-foreground">
						Found 2 shifts for "Morning"
					</p>
				</div>
				<div className="divide-y">
					<div className="p-4 hover:bg-accent">
						<div className="flex items-center gap-4">
							<div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
								<Clock className="h-5 w-5 text-primary" />
							</div>
							<div>
								<h4 className="font-medium">Morning Shift</h4>
								<p className="text-sm text-muted-foreground">
									9:00 AM - 5:00 PM
								</p>
							</div>
						</div>
					</div>
					<div className="p-4 hover:bg-accent">
						<div className="flex items-center gap-4">
							<div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
								<Clock className="h-5 w-5 text-primary" />
							</div>
							<div>
								<h4 className="font-medium">Early Morning Shift</h4>
								<p className="text-sm text-muted-foreground">
									6:00 AM - 2:00 PM
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	),
};

// With Department Results
export const WithDepartmentResults: Story = {
	render: () => (
		<div className="space-y-4">
			<SearchResults />
			<div className="rounded-md border">
				<div className="p-4">
					<h3 className="text-sm font-medium">Department Results</h3>
					<p className="mt-1 text-sm text-muted-foreground">
						Found 2 departments for "Sales"
					</p>
				</div>
				<div className="divide-y">
					<div className="p-4 hover:bg-accent">
						<div className="flex items-center gap-4">
							<div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
								<Building2 className="h-5 w-5 text-primary" />
							</div>
							<div>
								<h4 className="font-medium">Sales Department</h4>
								<p className="text-sm text-muted-foreground">15 employees</p>
							</div>
						</div>
					</div>
					<div className="p-4 hover:bg-accent">
						<div className="flex items-center gap-4">
							<div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
								<Building2 className="h-5 w-5 text-primary" />
							</div>
							<div>
								<h4 className="font-medium">Sales Operations</h4>
								<p className="text-sm text-muted-foreground">8 employees</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	),
};

// Mobile Optimized
export const MobileOptimized: Story = {
	render: () => (
		<div className="w-full max-w-[90vw] sm:max-w-md mx-auto">
			<SearchResults />
		</div>
	),
};

// With Pagination
export const WithPagination: Story = {
	render: () => (
		<div className="space-y-4">
			<SearchResults />
			<div className="flex items-center justify-between">
				<p className="text-sm text-muted-foreground">
					Showing 1-10 of 25 results
				</p>
				<div className="flex items-center gap-2">
					<button
						type="button"
						className="rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
						Previous
					</button>
					<button
						type="button"
						className="rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
						Next
					</button>
				</div>
			</div>
		</div>
	),
};

// With Empty State
export const WithEmptyState: Story = {
	render: () => (
		<div className="space-y-4">
			<SearchResults />
			<div className="rounded-md border p-8 text-center">
				<div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
					<Search className="h-6 w-6 text-primary" />
				</div>
				<h3 className="mt-4 text-sm font-medium">No results found</h3>
				<p className="mt-1 text-sm text-muted-foreground">
					Try adjusting your search or filters to find what you're looking for.
				</p>
			</div>
		</div>
	),
};
