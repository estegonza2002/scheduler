import type { Meta, StoryObj } from "@storybook/react";
import { Switch } from "@/components/ui/switch";

const meta: Meta<typeof Switch> = {
	title: "Components/Forms/Switch",
	component: Switch,
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"A switch component for toggling between two states. Supports various states and can be used for boolean settings.",
			},
		},
	},
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Default: Story = {
	render: () => (
		<div className="flex items-center space-x-2">
			<Switch id="airplane-mode" />
			<label
				htmlFor="airplane-mode"
				className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
				Airplane Mode
			</label>
		</div>
	),
};

export const Checked: Story = {
	render: () => (
		<div className="flex items-center space-x-2">
			<Switch
				id="checked"
				defaultChecked
			/>
			<label
				htmlFor="checked"
				className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
				Checked by default
			</label>
		</div>
	),
};

export const Disabled: Story = {
	render: () => (
		<div className="flex items-center space-x-2">
			<Switch
				id="disabled"
				disabled
			/>
			<label
				htmlFor="disabled"
				className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
				Disabled switch
			</label>
		</div>
	),
};

export const DisabledChecked: Story = {
	render: () => (
		<div className="flex items-center space-x-2">
			<Switch
				id="disabled-checked"
				disabled
				defaultChecked
			/>
			<label
				htmlFor="disabled-checked"
				className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
				Disabled checked switch
			</label>
		</div>
	),
};

export const WithDescription: Story = {
	render: () => (
		<div className="space-y-2">
			<div className="flex items-center space-x-2">
				<Switch id="notifications" />
				<label
					htmlFor="notifications"
					className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
					Enable notifications
				</label>
			</div>
			<p className="text-sm text-muted-foreground">
				Receive notifications about updates and new features.
			</p>
		</div>
	),
};

export const SwitchGroup: Story = {
	render: () => (
		<div className="space-y-4">
			<div className="flex items-center space-x-2">
				<Switch id="email" />
				<label
					htmlFor="email"
					className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
					Email notifications
				</label>
			</div>
			<div className="flex items-center space-x-2">
				<Switch id="sms" />
				<label
					htmlFor="sms"
					className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
					SMS notifications
				</label>
			</div>
			<div className="flex items-center space-x-2">
				<Switch id="push" />
				<label
					htmlFor="push"
					className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
					Push notifications
				</label>
			</div>
		</div>
	),
};
