import type { Meta, StoryObj } from "@storybook/react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";

const meta: Meta<typeof Label> = {
	title: "Components/Forms/Label",
	component: Label,
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"A label component for form inputs. Provides accessibility and styling for form labels.",
			},
		},
	},
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Label>;

export const Default: Story = {
	render: () => (
		<div className="space-y-2">
			<Label htmlFor="email">Email</Label>
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
			<Label htmlFor="username">Username</Label>
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

export const WithCheckbox: Story = {
	render: () => (
		<div className="flex items-center space-x-2">
			<Checkbox id="terms" />
			<Label htmlFor="terms">Accept terms and conditions</Label>
		</div>
	),
};

export const WithSwitch: Story = {
	render: () => (
		<div className="flex items-center space-x-2">
			<Switch id="airplane-mode" />
			<Label htmlFor="airplane-mode">Airplane Mode</Label>
		</div>
	),
};

export const Disabled: Story = {
	render: () => (
		<div className="space-y-2">
			<Label
				htmlFor="disabled"
				className="opacity-50">
				Disabled Label
			</Label>
			<Input
				id="disabled"
				disabled
				placeholder="This input is disabled"
			/>
		</div>
	),
};

export const Required: Story = {
	render: () => (
		<div className="space-y-2">
			<Label htmlFor="required">
				Email <span className="text-red-500">*</span>
			</Label>
			<Input
				id="required"
				type="email"
				required
				placeholder="Enter your email"
			/>
		</div>
	),
};

export const WithError: Story = {
	render: () => (
		<div className="space-y-2">
			<Label
				htmlFor="error"
				className="text-red-500">
				Email
			</Label>
			<Input
				id="error"
				type="email"
				className="border-red-500"
				placeholder="Enter your email"
			/>
			<p className="text-sm text-red-500">
				Please enter a valid email address.
			</p>
		</div>
	),
};
