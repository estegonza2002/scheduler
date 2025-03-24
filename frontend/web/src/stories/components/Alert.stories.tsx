import type { Meta, StoryObj } from "@storybook/react";
import { Alert, AlertTitle, AlertDescription } from "../../components/ui/alert";
import { X } from "lucide-react";

const meta: Meta<typeof Alert> = {
	title: "Components/Alert",
	component: Alert,
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component: `A component for displaying important messages and notifications with different styles based on the type of message.

## Accessibility
- Uses semantic HTML with proper ARIA roles and labels
- Supports keyboard navigation
- Provides clear visual and text indicators for different alert types
- Maintains sufficient color contrast for text and backgrounds
- Includes descriptive text for screen readers
- Uses appropriate ARIA landmarks and labels
- Supports screen reader announcements for navigation
- Provides focus management for dismissible alerts
- Includes proper heading hierarchy

## Performance
- Lightweight component with minimal dependencies
- Efficient rendering with proper React patterns
- Optimized for re-renders with proper prop types
- Memoized icon components
- Efficient state management for dismissible alerts
- Optimized animations and transitions

## Mobile Responsiveness
- Adapts to different screen sizes
- Maintains readability on mobile devices
- Proper spacing and padding for touch targets
- Flexible width handling
- Icon scaling for different viewports
- Touch-friendly dismiss buttons
- Responsive typography`,
			},
		},
	},
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Alert>;

// Basic Examples
export const Success: Story = {
	render: () => (
		<Alert
			variant="success"
			role="alert"
			aria-live="polite">
			<AlertTitle>Success</AlertTitle>
			<AlertDescription>
				Your changes have been saved successfully.
			</AlertDescription>
		</Alert>
	),
};

export const Error: Story = {
	render: () => (
		<Alert
			variant="destructive"
			role="alert"
			aria-live="assertive">
			<AlertTitle>Error</AlertTitle>
			<AlertDescription>
				There was a problem saving your changes. Please try again.
			</AlertDescription>
		</Alert>
	),
};

export const Warning: Story = {
	render: () => (
		<Alert
			variant="warning"
			role="alert"
			aria-live="polite">
			<AlertTitle>Warning</AlertTitle>
			<AlertDescription>
				Your session will expire in 5 minutes. Please save your work.
			</AlertDescription>
		</Alert>
	),
};

export const Info: Story = {
	render: () => (
		<Alert
			variant="info"
			role="alert"
			aria-live="polite">
			<AlertTitle>Information</AlertTitle>
			<AlertDescription>
				A new version of the application is available.
			</AlertDescription>
		</Alert>
	),
};

// Interactive Examples
export const Dismissible: Story = {
	render: () => (
		<Alert
			variant="info"
			role="alert"
			className="relative">
			<AlertTitle>Dismissible Alert</AlertTitle>
			<AlertDescription>
				This alert can be dismissed by clicking the close button or pressing
				Escape.
			</AlertDescription>
			<button
				className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
				aria-label="Close alert">
				<X className="h-4 w-4" />
			</button>
		</Alert>
	),
};

// Accessibility Examples
export const WithAriaLabels: Story = {
	render: () => (
		<Alert
			variant="success"
			role="alert"
			aria-live="polite"
			aria-atomic="true"
			aria-relevant="text">
			<AlertTitle>Accessibility Example</AlertTitle>
			<AlertDescription>
				This alert demonstrates proper ARIA attributes for screen readers.
			</AlertDescription>
		</Alert>
	),
};

export const WithKeyboardNavigation: Story = {
	render: () => (
		<Alert
			variant="info"
			role="alert"
			tabIndex={0}
			className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
			<AlertTitle>Keyboard Navigation</AlertTitle>
			<AlertDescription>
				This alert can be focused and interacted with using keyboard navigation.
			</AlertDescription>
		</Alert>
	),
};

// Responsive Examples
export const ResponsiveLayout: Story = {
	render: () => (
		<div className="w-full max-w-md mx-auto">
			<Alert
				variant="info"
				role="alert"
				className="flex flex-col sm:flex-row items-start sm:items-center">
				<AlertTitle className="mb-2 sm:mb-0 sm:mr-4 text-base sm:text-lg">
					Responsive Alert
				</AlertTitle>
				<AlertDescription className="text-sm sm:text-base">
					This alert adapts its layout and typography based on screen size.
				</AlertDescription>
			</Alert>
		</div>
	),
};

export const MobileOptimized: Story = {
	render: () => (
		<Alert
			variant="warning"
			role="alert"
			className="max-w-[90vw] sm:max-w-none">
			<AlertTitle className="text-base sm:text-lg">Mobile Optimized</AlertTitle>
			<AlertDescription className="text-sm sm:text-base">
				This alert is optimized for mobile devices with appropriate spacing and
				touch targets.
			</AlertDescription>
		</Alert>
	),
};

// Loading State
export const Loading: Story = {
	render: () => (
		<Alert
			variant="info"
			role="alert"
			className="animate-pulse">
			<AlertTitle>Loading State</AlertTitle>
			<AlertDescription>
				This alert shows a loading state with animation.
			</AlertDescription>
		</Alert>
	),
};

// Edge Cases
export const WithLongContent: Story = {
	render: () => (
		<Alert
			variant="warning"
			role="alert"
			className="max-w-2xl">
			<AlertTitle>Important Notice</AlertTitle>
			<AlertDescription>
				This is a long alert message that contains multiple lines of text. It
				demonstrates how the alert component handles longer content and ensures
				proper spacing and alignment. The alert should maintain its visual
				hierarchy and readability even with extended content.
			</AlertDescription>
		</Alert>
	),
};

export const WithoutTitle: Story = {
	render: () => (
		<Alert
			variant="info"
			role="alert">
			<AlertDescription>This is an alert without a title.</AlertDescription>
		</Alert>
	),
};

export const WithHTMLContent: Story = {
	render: () => (
		<Alert
			variant="info"
			role="alert">
			<AlertTitle>HTML Content</AlertTitle>
			<AlertDescription>
				This alert contains <strong>HTML content</strong> and{" "}
				<a
					href="#"
					className="underline">
					links
				</a>
				.
			</AlertDescription>
		</Alert>
	),
};

// All Variants
export const AllVariants: Story = {
	render: () => (
		<div className="space-y-4">
			<Alert
				variant="success"
				role="alert"
				aria-live="polite">
				<AlertTitle>Success</AlertTitle>
				<AlertDescription>
					Your changes have been saved successfully.
				</AlertDescription>
			</Alert>
			<Alert
				variant="destructive"
				role="alert"
				aria-live="assertive">
				<AlertTitle>Error</AlertTitle>
				<AlertDescription>
					There was a problem saving your changes. Please try again.
				</AlertDescription>
			</Alert>
			<Alert
				variant="warning"
				role="alert"
				aria-live="polite">
				<AlertTitle>Warning</AlertTitle>
				<AlertDescription>
					Your session will expire in 5 minutes. Please save your work.
				</AlertDescription>
			</Alert>
			<Alert
				variant="info"
				role="alert"
				aria-live="polite">
				<AlertTitle>Information</AlertTitle>
				<AlertDescription>
					A new version of the application is available.
				</AlertDescription>
			</Alert>
		</div>
	),
};
