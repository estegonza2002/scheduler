import type { Meta, StoryObj } from "@storybook/react";
import { SearchBar } from "@/components/search/SearchBar";
import { Search, Filter, X } from "lucide-react";

const meta: Meta<typeof SearchBar> = {
	title: "Components/Search/SearchBar",
	component: SearchBar,
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component: `A search bar component with advanced filtering capabilities.

## Accessibility
- Uses semantic HTML with proper ARIA roles and labels
- Supports keyboard navigation (Tab, Enter)
- Provides clear visual and text indicators for search states
- Maintains sufficient color contrast for text and backgrounds
- Includes descriptive text for screen readers
- Uses appropriate ARIA landmarks and labels
- Supports screen reader announcements for search changes
- Provides focus management for search input
- Includes proper heading hierarchy
- Uses appropriate ARIA states for search validation
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
- Lazy loading of search suggestions
- Efficient icon rendering
- Optimized for large suggestion sets
- Efficient mobile viewport handling

## Mobile Responsiveness
- Adapts to different screen sizes
- Maintains readability on mobile devices
- Proper spacing and padding for touch targets
- Flexible width handling
- Icon scaling for different viewports
- Touch-friendly search input
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
type Story = StoryObj<typeof SearchBar>;

// Basic Examples
export const Default: Story = {
	render: () => <SearchBar />,
};

// With Placeholder
export const WithPlaceholder: Story = {
	render: () => (
		<SearchBar placeholder="Search employees, shifts, or departments..." />
	),
};

// With Icon
export const WithIcon: Story = {
	render: () => (
		<SearchBar icon={<Search className="h-4 w-4 text-muted-foreground" />} />
	),
};

// With Clear Button
export const WithClearButton: Story = {
	render: () => (
		<SearchBar
			value="John Smith"
			onClear={() => {}}
			clearIcon={<X className="h-4 w-4 text-muted-foreground" />}
		/>
	),
};

// With Filter Button
export const WithFilterButton: Story = {
	render: () => (
		<div className="flex items-center gap-2">
			<SearchBar />
			<button
				type="button"
				className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
				aria-label="Open filters">
				<Filter className="h-4 w-4" />
				Filters
			</button>
		</div>
	),
};

// Mobile Optimized
export const MobileOptimized: Story = {
	render: () => (
		<div className="w-full max-w-[90vw] sm:max-w-md mx-auto">
			<SearchBar />
		</div>
	),
};

// With Search History
export const WithSearchHistory: Story = {
	render: () => (
		<div className="space-y-4">
			<SearchBar />
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

// With Search Suggestions
export const WithSearchSuggestions: Story = {
	render: () => (
		<div className="space-y-4">
			<SearchBar />
			<div className="rounded-md border">
				<div className="p-2">
					<div className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-accent">
						<Search className="h-4 w-4 text-muted-foreground" />
						<span className="text-sm">John Smith</span>
					</div>
					<div className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-accent">
						<Search className="h-4 w-4 text-muted-foreground" />
						<span className="text-sm">John Doe</span>
					</div>
					<div className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-accent">
						<Search className="h-4 w-4 text-muted-foreground" />
						<span className="text-sm">Johnny Johnson</span>
					</div>
				</div>
			</div>
		</div>
	),
};

// With Loading State
export const WithLoadingState: Story = {
	render: () => (
		<div className="space-y-4">
			<SearchBar />
			<div className="flex items-center justify-center">
				<div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
			</div>
		</div>
	),
};
