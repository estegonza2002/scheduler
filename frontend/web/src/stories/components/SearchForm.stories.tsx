import type { Meta, StoryObj } from "@storybook/react";
import { SearchForm } from "@/components/search/SearchForm";
import { Search, Filter } from "lucide-react";

const meta: Meta<typeof SearchForm> = {
	title: "Components/Search/SearchForm",
	component: SearchForm,
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component: `A search form component with advanced filtering capabilities.

## Accessibility
- Uses semantic HTML with proper ARIA roles and labels
- Supports keyboard navigation (Tab, Enter)
- Provides clear visual and text indicators for form states
- Maintains sufficient color contrast for text and backgrounds
- Includes descriptive text for screen readers
- Uses appropriate ARIA landmarks and labels
- Supports screen reader announcements for search results
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
- Debounced search input
- Efficient state management
- Optimized animations and transitions
- Lazy loading of search results
- Efficient icon rendering
- Optimized for large result sets
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
type Story = StoryObj<typeof SearchForm>;

// Basic Examples
export const Default: Story = {
	render: () => <SearchForm />,
};

// With Placeholder
export const WithPlaceholder: Story = {
	render: () => (
		<SearchForm placeholder="Search employees, shifts, or departments..." />
	),
};

// With Icon
export const WithIcon: Story = {
	render: () => (
		<SearchForm icon={<Search className="h-4 w-4 text-muted-foreground" />} />
	),
};

// Loading State
export const Loading: Story = {
	render: () => (
		<div className="opacity-50">
			<SearchForm />
		</div>
	),
};

// With Filters
export const WithFilters: Story = {
	render: () => (
		<div className="space-y-4">
			<SearchForm />
			<div className="flex items-center gap-2">
				<button
					type="button"
					className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
					aria-label="Open filters">
					<Filter className="h-4 w-4" />
					Filters
				</button>
			</div>
		</div>
	),
};

// Mobile Optimized
export const MobileOptimized: Story = {
	render: () => (
		<div className="w-full max-w-[90vw] sm:max-w-md mx-auto">
			<SearchForm />
		</div>
	),
};

// With Recent Searches
export const WithRecentSearches: Story = {
	render: () => (
		<div className="space-y-4">
			<SearchForm />
			<div className="space-y-2">
				<h3 className="text-sm font-medium text-muted-foreground">
					Recent Searches
				</h3>
				<div className="flex flex-wrap gap-2">
					<button
						type="button"
						className="rounded-full bg-secondary px-3 py-1 text-sm hover:bg-secondary/80">
						John Smith
					</button>
					<button
						type="button"
						className="rounded-full bg-secondary px-3 py-1 text-sm hover:bg-secondary/80">
						Morning Shift
					</button>
					<button
						type="button"
						className="rounded-full bg-secondary px-3 py-1 text-sm hover:bg-secondary/80">
						Sales Department
					</button>
				</div>
			</div>
		</div>
	),
};

// With Search Results
export const WithSearchResults: Story = {
	render: () => (
		<div className="space-y-4">
			<SearchForm />
			<div className="rounded-md border">
				<div className="p-4">
					<h3 className="text-sm font-medium">Search Results</h3>
					<p className="mt-1 text-sm text-muted-foreground">
						Found 3 results for "John"
					</p>
				</div>
				<div className="divide-y">
					<div className="p-4 hover:bg-accent">
						<h4 className="font-medium">John Smith</h4>
						<p className="text-sm text-muted-foreground">Sales Department</p>
					</div>
					<div className="p-4 hover:bg-accent">
						<h4 className="font-medium">John Doe</h4>
						<p className="text-sm text-muted-foreground">
							Marketing Department
						</p>
					</div>
					<div className="p-4 hover:bg-accent">
						<h4 className="font-medium">Johnny Johnson</h4>
						<p className="text-sm text-muted-foreground">IT Department</p>
					</div>
				</div>
			</div>
		</div>
	),
};
