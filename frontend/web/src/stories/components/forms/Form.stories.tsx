import type { Meta, StoryObj } from "@storybook/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
	username: z.string().min(2, {
		message: "Username must be at least 2 characters.",
	}),
	email: z.string().email({
		message: "Please enter a valid email address.",
	}),
	bio: z.string().max(160, {
		message: "Bio must not be longer than 160 characters.",
	}),
	notifications: z.boolean().default(false),
	marketing: z.boolean().default(false),
	subscription: z.enum(["free", "pro", "enterprise"], {
		required_error: "Please select a subscription plan.",
	}),
	notifications_type: z.enum(["email", "sms", "push"], {
		required_error: "Please select a notification type.",
	}),
});

const meta: Meta<typeof Form> = {
	title: "Components/Forms/Form",
	component: Form,
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"A form component that handles form validation and submission using react-hook-form and zod.",
			},
		},
	},
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Form>;

const FormDemo = () => {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			username: "",
			email: "",
			bio: "",
			notifications: false,
			marketing: false,
		},
	});

	function onSubmit(values: z.infer<typeof formSchema>) {
		console.log(values);
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="space-y-8">
				<FormField
					control={form.control}
					name="username"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Username</FormLabel>
							<FormControl>
								<Input
									placeholder="Enter your username"
									{...field}
								/>
							</FormControl>
							<FormDescription>
								This is your public display name.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email</FormLabel>
							<FormControl>
								<Input
									placeholder="Enter your email"
									type="email"
									{...field}
								/>
							</FormControl>
							<FormDescription>
								We'll never share your email with anyone else.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="bio"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Bio</FormLabel>
							<FormControl>
								<Textarea
									placeholder="Tell us a little bit about yourself"
									className="resize-none"
									{...field}
								/>
							</FormControl>
							<FormDescription>
								Brief description for your profile.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="notifications"
					render={({ field }) => (
						<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
							<div className="space-y-0.5">
								<FormLabel className="text-base">Notifications</FormLabel>
								<FormDescription>
									Receive notifications about updates and new features.
								</FormDescription>
							</div>
							<FormControl>
								<Switch
									checked={field.value}
									onCheckedChange={field.onChange}
								/>
							</FormControl>
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="marketing"
					render={({ field }) => (
						<FormItem className="flex flex-row items-start space-x-3 space-y-0">
							<FormControl>
								<Checkbox
									checked={field.value}
									onCheckedChange={field.onChange}
								/>
							</FormControl>
							<div className="space-y-1 leading-none">
								<FormLabel>Marketing emails</FormLabel>
								<FormDescription>
									You agree to receive marketing emails from us.
								</FormDescription>
							</div>
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="subscription"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Subscription Plan</FormLabel>
							<Select
								onValueChange={field.onChange}
								defaultValue={field.value}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="Select a subscription plan" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectItem value="free">Free</SelectItem>
									<SelectItem value="pro">Pro</SelectItem>
									<SelectItem value="enterprise">Enterprise</SelectItem>
								</SelectContent>
							</Select>
							<FormDescription>
								Choose the plan that best fits your needs.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="notifications_type"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Notification Type</FormLabel>
							<FormControl>
								<RadioGroup
									onValueChange={field.onChange}
									defaultValue={field.value}>
									<div className="flex items-center space-x-2">
										<RadioGroupItem
											value="email"
											id="email"
										/>
										<FormLabel htmlFor="email">Email</FormLabel>
									</div>
									<div className="flex items-center space-x-2">
										<RadioGroupItem
											value="sms"
											id="sms"
										/>
										<FormLabel htmlFor="sms">SMS</FormLabel>
									</div>
									<div className="flex items-center space-x-2">
										<RadioGroupItem
											value="push"
											id="push"
										/>
										<FormLabel htmlFor="push">Push</FormLabel>
									</div>
								</RadioGroup>
							</FormControl>
							<FormDescription>
								Choose how you want to receive notifications.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button type="submit">Submit</Button>
			</form>
		</Form>
	);
};

export const Default: Story = {
	render: () => <FormDemo />,
};
