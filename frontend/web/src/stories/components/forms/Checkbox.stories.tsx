import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox } from "@/components/ui/checkbox";

const meta: Meta<typeof Checkbox> = {
	title: "Components/Forms/Checkbox",
	component: Checkbox,
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"A checkbox component that supports various states and can be used for binary choices.",
			},
		},
	},
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
	render: () => (
		<div className="flex items-center space-x-2">
			<Checkbox id="terms" />
			<label
				htmlFor="terms"
				className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
				Accept terms and conditions
			</label>
		</div>
	),
};

export const Checked: Story = {
	render: () => (
		<div className="flex items-center space-x-2">
			<Checkbox
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
			<Checkbox
				id="disabled"
				disabled
			/>
			<label
				htmlFor="disabled"
				className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
				Disabled checkbox
			</label>
		</div>
	),
};

export const DisabledChecked: Story = {
	render: () => (
		<div className="flex items-center space-x-2">
			<Checkbox
				id="disabled-checked"
				disabled
				defaultChecked
			/>
			<label
				htmlFor="disabled-checked"
				className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
				Disabled checked checkbox
			</label>
		</div>
	),
};

export const WithDescription: Story = {
	render: () => (
		<div className="space-y-2">
			<div className="flex items-center space-x-2">
				<Checkbox id="description" />
				<label
					htmlFor="description"
					className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
					Subscribe to newsletter
				</label>
			</div>
			<p className="text-sm text-muted-foreground">
				You will receive updates about new features and improvements.
			</p>
		</div>
	),
};

export const CheckboxGroup: Story = {
	render: () => (
		<div className="space-y-4">
			<div className="flex items-center space-x-2">
				<Checkbox id="all" />
				<label
					htmlFor="all"
					className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
					Select all
				</label>
			</div>
			<div className="ml-6 space-y-2">
				<div className="flex items-center space-x-2">
					<Checkbox id="option1" />
					<label
						htmlFor="option1"
						className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
						Option 1
					</label>
				</div>
				<div className="flex items-center space-x-2">
					<Checkbox id="option2" />
					<label
						htmlFor="option2"
						className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
						Option 2
					</label>
				</div>
				<div className="flex items-center space-x-2">
					<Checkbox id="option3" />
					<label
						htmlFor="option3"
						className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
						Option 3
					</label>
				</div>
			</div>
		</div>
	),
};

export const WithError: Story = {
	render: () => (
		<div className="space-y-2">
			<div className="flex items-center space-x-2">
				<Checkbox
					id="error"
					className="border-red-500"
				/>
				<label
					htmlFor="error"
					className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
					Accept terms
				</label>
			</div>
			<p className="text-sm text-red-500">
				You must accept the terms to continue.
			</p>
		</div>
	),
};
