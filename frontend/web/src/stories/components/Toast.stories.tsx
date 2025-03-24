import type { Meta, StoryObj } from "@storybook/react";
import { toast, dismissToast, promiseToast } from "../../components/ui/toast";
import { Button } from "../../components/ui/button";
import { X } from "lucide-react";

const meta: Meta<typeof toast> = {
	title: "Components/Toast",
	component: toast,
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component:
					"A toast component for displaying temporary notifications and messages. Built with accessibility in mind, supporting screen readers and keyboard navigation. Optimized for performance with proper cleanup and memory management.",
			},
		},
	},
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof toast>;

const ToastDemo = ({
	variant = "default",
}: {
	variant?: "default" | "success" | "destructive" | "warning" | "info";
}) => {
	return (
		<Button
			onClick={() =>
				toast({
					title: "Toast Title",
					description: "This is a toast message with a title and description.",
					variant,
				})
			}>
			Show {variant} Toast
		</Button>
	);
};

// Basic Examples
export const Default: Story = {
	render: () => <ToastDemo />,
};

export const Success: Story = {
	render: () => <ToastDemo variant="success" />,
};

export const Error: Story = {
	render: () => <ToastDemo variant="destructive" />,
};

export const Warning: Story = {
	render: () => <ToastDemo variant="warning" />,
};

export const Info: Story = {
	render: () => <ToastDemo variant="info" />,
};

// Interactive Examples
export const WithAction: Story = {
	render: () => (
		<Button
			onClick={() =>
				toast({
					title: "Action Required",
					description: "This toast has an action button.",
					action: (
						<Button
							variant="ghost"
							size="sm"
							className="h-auto p-1 hover:bg-transparent"
							onClick={() => dismissToast("action-toast")}
							aria-label="Dismiss toast">
							<X className="h-4 w-4" />
						</Button>
					),
				})
			}>
			Show Toast with Action
		</Button>
	),
};

// Accessibility Examples
export const AccessibilityExample: Story = {
	render: () => (
		<Button
			onClick={() =>
				toast({
					title: "Accessible Toast",
					description: "This toast demonstrates proper accessibility features.",
					role: "alert",
					ariaLive: "polite",
					action: (
						<Button
							variant="ghost"
							size="sm"
							className="h-auto p-1 hover:bg-transparent"
							onClick={() => dismissToast("accessible-toast")}
							aria-label="Dismiss notification">
							<X className="h-4 w-4" />
						</Button>
					),
				})
			}>
			Show Accessible Toast
		</Button>
	),
};

// Responsive Examples
export const ResponsiveToast: Story = {
	render: () => (
		<div className="space-y-4">
			<p className="text-sm text-muted-foreground">
				This toast adapts to different screen sizes and maintains readability.
			</p>
			<Button
				onClick={() =>
					toast({
						title: "Responsive Toast",
						description:
							"This toast will adjust its width and position based on the viewport size.",
						className: "sm:max-w-[400px] md:max-w-[500px] lg:max-w-[600px]",
					})
				}>
				Show Responsive Toast
			</Button>
		</div>
	),
};

// Loading State
export const LoadingToast: Story = {
	render: () => (
		<Button
			onClick={() =>
				toast({
					title: "Loading State",
					description: "This toast shows a loading state with a spinner.",
					action: (
						<div className="animate-spin">
							<svg
								className="h-4 w-4"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24">
								<circle
									className="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									strokeWidth="4"
								/>
								<path
									className="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								/>
							</svg>
						</div>
					),
				})
			}>
			Show Loading Toast
		</Button>
	),
};

// Performance Examples
export const PerformanceExample: Story = {
	render: () => (
		<div className="space-y-4">
			<p className="text-sm text-muted-foreground">
				This toast demonstrates performance optimizations including proper
				cleanup and memory management.
			</p>
			<Button
				onClick={() =>
					toast({
						title: "Optimized Toast",
						description:
							"This toast uses proper cleanup and memory management.",
						onDismiss: () => {
							// Cleanup any resources
							console.log("Toast dismissed, cleaning up...");
						},
					})
				}>
				Show Optimized Toast
			</Button>
		</div>
	),
};

// Edge Cases
export const LongContent: Story = {
	render: () => (
		<Button
			onClick={() =>
				toast({
					title: "Long Content Toast",
					description:
						"This is a toast message with very long content that should wrap properly and maintain its layout. It demonstrates how the toast component handles extended text while keeping the design clean and readable.",
					className: "max-w-[90vw] sm:max-w-[400px]",
				})
			}>
			Show Long Toast
			<span className="sr-only">
				(demonstrates text wrapping and responsive behavior)
			</span>
		</Button>
	),
};

export const MultipleToasts: Story = {
	render: () => (
		<Button
			onClick={() => {
				// Show multiple toasts to demonstrate stacking behavior
				toast({
					title: "First Toast",
					description: "This is the first toast in a stack.",
				});
				setTimeout(() => {
					toast({
						title: "Second Toast",
						description: "This is the second toast in a stack.",
					});
				}, 100);
				setTimeout(() => {
					toast({
						title: "Third Toast",
						description: "This is the third toast in a stack.",
					});
				}, 200);
			}}>
			Show Multiple Toasts
		</Button>
	),
};

export const PromiseToast: Story = {
	render: () => (
		<Button
			onClick={() =>
				promiseToast(new Promise((resolve) => setTimeout(resolve, 2000)), {
					loading: "Loading...",
					success: "Operation completed successfully!",
					error: "Something went wrong.",
				})
			}>
			Show Promise Toast
		</Button>
	),
};

export const DifferentPositions: Story = {
	render: () => (
		<div className="flex flex-wrap gap-2">
			<Button
				onClick={() =>
					toast({
						title: "Top Right",
						description: "This toast appears in the top-right corner.",
						position: "top-right",
					})
				}>
				Top Right
			</Button>
			<Button
				onClick={() =>
					toast({
						title: "Top Left",
						description: "This toast appears in the top-left corner.",
						position: "top-left",
					})
				}>
				Top Left
			</Button>
			<Button
				onClick={() =>
					toast({
						title: "Bottom Right",
						description: "This toast appears in the bottom-right corner.",
						position: "bottom-right",
					})
				}>
				Bottom Right
			</Button>
			<Button
				onClick={() =>
					toast({
						title: "Bottom Left",
						description: "This toast appears in the bottom-left corner.",
						position: "bottom-left",
					})
				}>
				Bottom Left
			</Button>
		</div>
	),
};

export const CustomDuration: Story = {
	render: () => (
		<Button
			onClick={() =>
				toast({
					title: "Long Duration",
					description: "This toast will stay visible for 10 seconds.",
					duration: 10000,
				})
			}>
			Show Long Duration Toast
		</Button>
	),
};
