import type { Meta, StoryObj } from "@storybook/react";
import { Textarea } from "@/components/ui/textarea";

const meta: Meta<typeof Textarea> = {
	title: "Components/Forms/Textarea",
	component: Textarea,
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"A textarea component for multi-line text input. Supports various states and can be customized with different sizes.",
			},
		},
	},
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
	render: () => (
		<div className="space-y-2">
			<label
				htmlFor="message"
				className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
				Message
			</label>
			<Textarea
				placeholder="Type your message here."
				id="message"
			/>
		</div>
	),
};

export const WithDescription: Story = {
	render: () => (
		<div className="space-y-2">
			<label
				htmlFor="bio"
				className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
				Bio
			</label>
			<Textarea
				placeholder="Tell us a little bit about yourself"
				id="bio"
			/>
			<p className="text-sm text-muted-foreground">
				Write a few sentences about yourself.
			</p>
		</div>
	),
};

export const WithError: Story = {
	render: () => (
		<div className="space-y-2">
			<label
				htmlFor="feedback"
				className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
				Feedback
			</label>
			<Textarea
				placeholder="Tell us what you think"
				id="feedback"
				className="border-red-500"
			/>
			<p className="text-sm text-red-500">
				Please provide your feedback to continue.
			</p>
		</div>
	),
};

export const Disabled: Story = {
	render: () => (
		<div className="space-y-2">
			<label
				htmlFor="disabled"
				className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
				Disabled Textarea
			</label>
			<Textarea
				placeholder="This textarea is disabled"
				id="disabled"
				disabled
			/>
		</div>
	),
};

export const ReadOnly: Story = {
	render: () => (
		<div className="space-y-2">
			<label
				htmlFor="readonly"
				className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
				Read Only Textarea
			</label>
			<Textarea
				value="This is a read-only textarea. You cannot edit this text."
				id="readonly"
				readOnly
			/>
		</div>
	),
};

export const DifferentSizes: Story = {
	render: () => (
		<div className="space-y-4">
			<div className="space-y-2">
				<label className="text-sm font-medium">Small Size</label>
				<Textarea
					placeholder="Small textarea"
					className="min-h-[100px]"
				/>
			</div>
			<div className="space-y-2">
				<label className="text-sm font-medium">Default Size</label>
				<Textarea
					placeholder="Default textarea"
					className="min-h-[150px]"
				/>
			</div>
			<div className="space-y-2">
				<label className="text-sm font-medium">Large Size</label>
				<Textarea
					placeholder="Large textarea"
					className="min-h-[200px]"
				/>
			</div>
		</div>
	),
};

export const WithCharacterCount: Story = {
	render: () => (
		<div className="space-y-2">
			<label
				htmlFor="bio"
				className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
				Bio
			</label>
			<div className="relative">
				<Textarea
					placeholder="Tell us a little bit about yourself"
					id="bio"
					maxLength={100}
				/>
				<div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
					0/100
				</div>
			</div>
		</div>
	),
};
