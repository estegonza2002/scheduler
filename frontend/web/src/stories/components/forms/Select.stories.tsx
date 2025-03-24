import type { Meta, StoryObj } from "@storybook/react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

const meta: Meta<typeof Select> = {
	title: "Components/Forms/Select",
	component: Select,
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"A select component that provides a dropdown menu for selecting options. Supports keyboard navigation and screen readers.",
			},
		},
	},
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = {
	render: () => (
		<Select>
			<SelectTrigger className="w-[180px]">
				<SelectValue placeholder="Select option" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="option1">Option 1</SelectItem>
				<SelectItem value="option2">Option 2</SelectItem>
				<SelectItem value="option3">Option 3</SelectItem>
			</SelectContent>
		</Select>
	),
};

export const WithLabel: Story = {
	render: () => (
		<div className="space-y-2">
			<label className="text-sm font-medium">Select Role</label>
			<Select>
				<SelectTrigger>
					<SelectValue placeholder="Select a role" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="admin">Administrator</SelectItem>
					<SelectItem value="manager">Manager</SelectItem>
					<SelectItem value="employee">Employee</SelectItem>
				</SelectContent>
			</Select>
		</div>
	),
};

export const WithDescription: Story = {
	render: () => (
		<div className="space-y-2">
			<label className="text-sm font-medium">Department</label>
			<Select>
				<SelectTrigger>
					<SelectValue placeholder="Select department" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="engineering">Engineering</SelectItem>
					<SelectItem value="design">Design</SelectItem>
					<SelectItem value="marketing">Marketing</SelectItem>
					<SelectItem value="sales">Sales</SelectItem>
				</SelectContent>
			</Select>
			<p className="text-sm text-muted-foreground">
				Choose the department you want to assign the employee to.
			</p>
		</div>
	),
};

export const WithError: Story = {
	render: () => (
		<div className="space-y-2">
			<label className="text-sm font-medium">Status</label>
			<Select>
				<SelectTrigger className="border-red-500">
					<SelectValue placeholder="Select status" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="active">Active</SelectItem>
					<SelectItem value="inactive">Inactive</SelectItem>
					<SelectItem value="pending">Pending</SelectItem>
				</SelectContent>
			</Select>
			<p className="text-sm text-red-500">Please select a valid status.</p>
		</div>
	),
};

export const Disabled: Story = {
	render: () => (
		<Select disabled>
			<SelectTrigger>
				<SelectValue placeholder="Select option" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="option1">Option 1</SelectItem>
				<SelectItem value="option2">Option 2</SelectItem>
			</SelectContent>
		</Select>
	),
};

export const WithGroups: Story = {
	render: () => (
		<Select>
			<SelectTrigger>
				<SelectValue placeholder="Select location" />
			</SelectTrigger>
			<SelectContent>
				<div className="px-2 py-1.5 text-sm font-semibold">North America</div>
				<SelectItem value="ny">New York</SelectItem>
				<SelectItem value="sf">San Francisco</SelectItem>
				<SelectItem value="la">Los Angeles</SelectItem>

				<div className="px-2 py-1.5 text-sm font-semibold mt-2">Europe</div>
				<SelectItem value="ldn">London</SelectItem>
				<SelectItem value="par">Paris</SelectItem>
				<SelectItem value="ber">Berlin</SelectItem>
			</SelectContent>
		</Select>
	),
};

export const WithIcons: Story = {
	render: () => (
		<Select>
			<SelectTrigger>
				<SelectValue placeholder="Select payment method" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="card">
					<div className="flex items-center gap-2">
						<svg
							className="h-4 w-4"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round">
							<rect
								x="1"
								y="4"
								width="22"
								height="16"
								rx="2"
								ry="2"
							/>
							<line
								x1="1"
								y1="10"
								x2="23"
								y2="10"
							/>
						</svg>
						Credit Card
					</div>
				</SelectItem>
				<SelectItem value="paypal">
					<div className="flex items-center gap-2">
						<svg
							className="h-4 w-4"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round">
							<path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L5.944 3.72a.641.641 0 0 1 .633-.54h4.052c3.812 0 5.85 2.254 5.85 5.85 0 3.596-2.038 5.85-5.85 5.85h-2.13l-1.23 7.457z" />
						</svg>
						PayPal
					</div>
				</SelectItem>
			</SelectContent>
		</Select>
	),
};

export const Sizes: Story = {
	render: () => (
		<div className="space-y-4">
			<div className="space-y-2">
				<label className="text-sm font-medium">Small Size</label>
				<Select>
					<SelectTrigger className="h-8 text-sm">
						<SelectValue placeholder="Small select" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="option1">Option 1</SelectItem>
						<SelectItem value="option2">Option 2</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div className="space-y-2">
				<label className="text-sm font-medium">Default Size</label>
				<Select>
					<SelectTrigger>
						<SelectValue placeholder="Default select" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="option1">Option 1</SelectItem>
						<SelectItem value="option2">Option 2</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div className="space-y-2">
				<label className="text-sm font-medium">Large Size</label>
				<Select>
					<SelectTrigger className="h-12 text-lg">
						<SelectValue placeholder="Large select" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="option1">Option 1</SelectItem>
						<SelectItem value="option2">Option 2</SelectItem>
					</SelectContent>
				</Select>
			</div>
		</div>
	),
};
