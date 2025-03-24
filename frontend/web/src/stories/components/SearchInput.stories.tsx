import type { Meta, StoryObj } from "@storybook/react";
import { SearchInput } from "@/components/search/SearchInput";
import { Search, X } from "lucide-react";

const meta: Meta<typeof SearchInput> = {
	title: "Components/Search/SearchInput",
	component: SearchInput,
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component: `A search input component with advanced features and accessibility support.

## Accessibility
- Uses semantic HTML with proper ARIA roles and labels
- Supports keyboard navigation (Tab, Enter, Escape)
- Provides clear visual and text indicators for input states
- Maintains sufficient color contrast for text and backgrounds
- Includes descriptive text for screen readers
- Uses appropriate ARIA landmarks and labels
- Supports screen reader announcements for input changes
- Provides focus management for input field
- Includes proper heading hierarchy
- Uses appropriate ARIA states for input validation
- Supports touch targets for mobile devices
- Provides clear visual feedback for interactions
- Maintains focus trap when suggestions are open
- Supports escape key to close suggestions

## Performance
- Lightweight component with minimal dependencies
- Efficient rendering with proper React patterns
- Optimized for re-renders with proper prop types
- Minimal DOM footprint
- Debounced input handling
- Efficient state management
- Optimized animations and transitions
- Lazy loading of suggestions
- Efficient icon rendering
- Optimized for large suggestion sets
- Efficient mobile viewport handling

## Mobile Responsiveness
- Adapts to different screen sizes
- Maintains readability on mobile devices
- Proper spacing and padding for touch targets
- Flexible width handling
- Icon scaling for different viewports
- Touch-friendly input field
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
type Story = StoryObj<typeof SearchInput>;

// Basic Examples
export const Default: Story = {
	render: () => <SearchInput />,
};

// With Placeholder
export const WithPlaceholder: Story = {
	render: () => (
		<SearchInput placeholder="Search employees, shifts, or departments..." />
	),
};

// With Icon
export const WithIcon: Story = {
	render: () => (
		<SearchInput icon={<Search className="h-4 w-4 text-muted-foreground" />} />
	),
};

// With Clear Button
export const WithClearButton: Story = {
	render: () => (
		<SearchInput
			value="John Smith"
			onClear={() => {}}
			clearIcon={<X className="h-4 w-4 text-muted-foreground" />}
		/>
	),
};

// With Error State
export const WithError: Story = {
	render: () => (
		<SearchInput
			error="Please enter a valid search term"
			value=""
		/>
	),
};

// With Loading State
export const WithLoadingState: Story = {
	render: () => (
		<SearchInput
			loading
			value="John"
		/>
	),
};

// Mobile Optimized
export const MobileOptimized: Story = {
	render: () => (
		<div className="w-full max-w-[90vw] sm:max-w-md mx-auto">
			<SearchInput />
		</div>
	),
};

// With Suggestions
export const WithSuggestions: Story = {
	render: () => (
		<div className="space-y-4">
			<SearchInput value="John" />
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

// With Custom Styling
export const WithCustomStyling: Story = {
	render: () => (
		<SearchInput
			className="bg-primary/5 border-primary/20 focus:border-primary/40"
			placeholder="Custom styled search input..."
		/>
	),
};
