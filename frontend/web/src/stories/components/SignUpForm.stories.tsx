import type { Meta, StoryObj } from "@storybook/react";
import { SignUpForm } from "@/components/auth/SignUpForm";

const meta = {
	title: "Components/Auth/SignUpForm",
	component: SignUpForm,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
} satisfies Meta<typeof SignUpForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		onSubmit: async (values) => {
			console.log("Sign up submitted:", values);
		},
	},
};

export const WithError: Story = {
	args: {
		onSubmit: async () => {
			throw new Error("Email already in use");
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

export const WithSocialSignUp: Story = {
	args: {
		onSubmit: async (values) => {
			console.log("Sign up submitted:", values);
		},
		showSocialSignUp: true,
	},
};
