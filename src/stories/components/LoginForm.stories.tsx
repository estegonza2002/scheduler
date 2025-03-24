import type { Meta, StoryObj } from "@storybook/react";
import { LoginForm } from "@/components/auth/LoginForm";

const meta = {
	title: "Components/Auth/LoginForm",
	component: LoginForm,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
} satisfies Meta<typeof LoginForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		onSubmit: async (values) => {
			console.log("Login submitted:", values);
		},
	},
};

export const WithError: Story = {
	args: {
		onSubmit: async () => {
			throw new Error("Invalid credentials");
		},
	},
};

export const Loading: Story = {
	args: {
		onSubmit: async () => {
			await new Promise((resolve) => setTimeout(resolve, 2000));
		},
	},
};

export const WithSocialLogin: Story = {
	args: {
		onSubmit: async (values) => {
			console.log("Login submitted:", values);
		},
		showSocialLogin: true,
	},
};
