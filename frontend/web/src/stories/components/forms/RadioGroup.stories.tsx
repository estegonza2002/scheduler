import type { Meta, StoryObj } from "@storybook/react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const meta: Meta<typeof RadioGroup> = {
	title: "Components/Forms/RadioGroup",
	component: RadioGroup,
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"A radio group component that allows users to select a single option from a list of choices.",
			},
		},
	},
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

export const Default: Story = {
	render: () => (
		<RadioGroup defaultValue="option1">
			<div className="flex items-center space-x-2">
				<RadioGroupItem
					value="option1"
					id="option1"
				/>
				<label
					htmlFor="option1"
					className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
					Option 1
				</label>
			</div>
			<div className="flex items-center space-x-2">
				<RadioGroupItem
					value="option2"
					id="option2"
				/>
				<label
					htmlFor="option2"
					className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
					Option 2
				</label>
			</div>
			<div className="flex items-center space-x-2">
				<RadioGroupItem
					value="option3"
					id="option3"
				/>
				<label
					htmlFor="option3"
					className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
					Option 3
				</label>
			</div>
		</RadioGroup>
	),
};

export const WithDescription: Story = {
	render: () => (
		<div className="space-y-4">
			<div className="space-y-2">
				<label className="text-sm font-medium">Payment Method</label>
				<RadioGroup
					defaultValue="card"
					className="space-y-2">
					<div className="flex items-center space-x-2">
						<RadioGroupItem
							value="card"
							id="card"
						/>
						<label
							htmlFor="card"
							className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
							Credit Card
						</label>
					</div>
					<div className="flex items-center space-x-2">
						<RadioGroupItem
							value="paypal"
							id="paypal"
						/>
						<label
							htmlFor="paypal"
							className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
							PayPal
						</label>
					</div>
				</RadioGroup>
				<p className="text-sm text-muted-foreground">
					Choose your preferred payment method.
				</p>
			</div>
		</div>
	),
};

export const WithError: Story = {
	render: () => (
		<div className="space-y-2">
			<RadioGroup
				defaultValue="option1"
				className="space-y-2">
				<div className="flex items-center space-x-2">
					<RadioGroupItem
						value="option1"
						id="error-option1"
					/>
					<label
						htmlFor="error-option1"
						className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
						Option 1
					</label>
				</div>
				<div className="flex items-center space-x-2">
					<RadioGroupItem
						value="option2"
						id="error-option2"
					/>
					<label
						htmlFor="error-option2"
						className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
						Option 2
					</label>
				</div>
			</RadioGroup>
			<p className="text-sm text-red-500">
				Please select an option to continue.
			</p>
		</div>
	),
};

export const Disabled: Story = {
	render: () => (
		<RadioGroup
			defaultValue="option1"
			className="space-y-2">
			<div className="flex items-center space-x-2">
				<RadioGroupItem
					value="option1"
					id="disabled-option1"
					disabled
				/>
				<label
					htmlFor="disabled-option1"
					className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
					Disabled Option
				</label>
			</div>
			<div className="flex items-center space-x-2">
				<RadioGroupItem
					value="option2"
					id="disabled-option2"
				/>
				<label
					htmlFor="disabled-option2"
					className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
					Enabled Option
				</label>
			</div>
		</RadioGroup>
	),
};

export const Horizontal: Story = {
	render: () => (
		<RadioGroup
			defaultValue="option1"
			className="flex space-x-4">
			<div className="flex items-center space-x-2">
				<RadioGroupItem
					value="option1"
					id="horizontal-option1"
				/>
				<label
					htmlFor="horizontal-option1"
					className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
					Option 1
				</label>
			</div>
			<div className="flex items-center space-x-2">
				<RadioGroupItem
					value="option2"
					id="horizontal-option2"
				/>
				<label
					htmlFor="horizontal-option2"
					className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
					Option 2
				</label>
			</div>
			<div className="flex items-center space-x-2">
				<RadioGroupItem
					value="option3"
					id="horizontal-option3"
				/>
				<label
					htmlFor="horizontal-option3"
					className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
					Option 3
				</label>
			</div>
		</RadioGroup>
	),
};
