import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "@/components/ui/input";

const meta: Meta<typeof Input> = {
	title: "Components/Forms/Input",
	component: Input,
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"A versatile input component that supports various types and states. Follows accessibility best practices and provides clear visual feedback.",
			},
		},
	},
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
	args: {
		placeholder: "Enter text...",
	},
};

export const WithLabel: Story = {
	render: () => (
		<div className="space-y-2">
			<label
				htmlFor="email"
				className="text-sm font-medium">
				Email
			</label>
			<Input
				id="email"
				type="email"
				placeholder="Enter your email"
			/>
		</div>
	),
};

export const WithDescription: Story = {
	render: () => (
		<div className="space-y-2">
			<label
				htmlFor="username"
				className="text-sm font-medium">
				Username
			</label>
			<Input
				id="username"
				placeholder="Enter your username"
			/>
			<p className="text-sm text-muted-foreground">
				This will be your public display name.
			</p>
		</div>
	),
};

export const WithError: Story = {
	render: () => (
		<div className="space-y-2">
			<label
				htmlFor="password"
				className="text-sm font-medium">
				Password
			</label>
			<Input
				id="password"
				type="password"
				placeholder="Enter your password"
				className="border-red-500"
			/>
			<p className="text-sm text-red-500">
				Password must be at least 8 characters long.
			</p>
		</div>
	),
};

export const Disabled: Story = {
	args: {
		placeholder: "Disabled input",
		disabled: true,
	},
};

export const ReadOnly: Story = {
	args: {
		value: "Read only value",
		readOnly: true,
	},
};

export const WithIcon: Story = {
	render: () => (
		<div className="relative">
			<Input
				placeholder="Search..."
				className="pl-10"
			/>
			<svg
				className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round">
				<circle
					cx="11"
					cy="11"
					r="8"
				/>
				<line
					x1="21"
					y1="21"
					x2="16.65"
					y2="16.65"
				/>
			</svg>
		</div>
	),
};

export const DifferentTypes: Story = {
	render: () => (
		<div className="space-y-4">
			<div className="space-y-2">
				<label className="text-sm font-medium">Text Input</label>
				<Input
					type="text"
					placeholder="Enter text"
				/>
			</div>

			<div className="space-y-2">
				<label className="text-sm font-medium">Email Input</label>
				<Input
					type="email"
					placeholder="Enter email"
				/>
			</div>

			<div className="space-y-2">
				<label className="text-sm font-medium">Password Input</label>
				<Input
					type="password"
					placeholder="Enter password"
				/>
			</div>

			<div className="space-y-2">
				<label className="text-sm font-medium">Number Input</label>
				<Input
					type="number"
					placeholder="Enter number"
				/>
			</div>

			<div className="space-y-2">
				<label className="text-sm font-medium">Date Input</label>
				<Input type="date" />
			</div>

			<div className="space-y-2">
				<label className="text-sm font-medium">Time Input</label>
				<Input type="time" />
			</div>
		</div>
	),
};

export const Sizes: Story = {
	render: () => (
		<div className="space-y-4">
			<div className="space-y-2">
				<label className="text-sm font-medium">Default Size</label>
				<Input placeholder="Default size input" />
			</div>

			<div className="space-y-2">
				<label className="text-sm font-medium">Small Size</label>
				<Input
					className="h-8 text-sm"
					placeholder="Small size input"
				/>
			</div>

			<div className="space-y-2">
				<label className="text-sm font-medium">Large Size</label>
				<Input
					className="h-12 text-lg"
					placeholder="Large size input"
				/>
			</div>
		</div>
	),
};

export const WithValidation: Story = {
	render: () => (
		<div className="space-y-4">
			<div className="space-y-2">
				<label className="text-sm font-medium">Required Field</label>
				<Input
					placeholder="This field is required"
					required
					className="border-primary"
				/>
				<p className="text-sm text-muted-foreground">* Required field</p>
			</div>

			<div className="space-y-2">
				<label className="text-sm font-medium">Pattern Validation</label>
				<Input
					placeholder="Enter phone number"
					pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
					className="border-primary"
				/>
				<p className="text-sm text-muted-foreground">Format: 123-456-7890</p>
			</div>
		</div>
	),
};
