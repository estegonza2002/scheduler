import { useState, forwardRef, useImperativeHandle } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useAuth } from "../../lib/auth";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "../ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../ui/form";
import { toast } from "sonner";

const loginSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Define the ref type
export type LoginFormRef = {
	fillCredentials: () => void;
	submitForm: () => void;
};

export const LoginForm = forwardRef<LoginFormRef>((props, ref) => {
	const { signIn } = useAuth();
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);

	const form = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	// Dummy implementation for development helpers - we keep the API but remove functionality
	const fillCredentials = () => {
		// Implementation removed
	};

	// Expose methods via ref
	useImperativeHandle(ref, () => ({
		fillCredentials,
		submitForm: () => {
			form.handleSubmit(onSubmit)();
		},
	}));

	async function onSubmit(values: LoginFormValues) {
		setIsLoading(true);
		try {
			const { data, error } = await signIn({
				email: values.email,
				password: values.password,
			});

			if (error) {
				if (error.message.includes("Invalid login credentials")) {
					toast.error("Invalid email or password. Please try again.");
				} else if (error.message.includes("Email not confirmed")) {
					toast.error("Please confirm your email address before logging in.");
				} else {
					toast.error(error.message);
				}
				console.error("Login error:", error);
				return;
			}

			toast.success("Logged in successfully");

			// Check if user is an admin and redirect to appropriate dashboard
			const isAdmin = data.user?.user_metadata?.role === "admin";
			navigate(isAdmin ? "/admin-dashboard" : "/dashboard");
		} catch (error) {
			toast.error("An unexpected error occurred");
			console.error("Login exception:", error);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<Card className="w-full max-w-md mx-auto">
			<CardHeader>
				<CardTitle>Login</CardTitle>
				<CardDescription>
					Enter your credentials to access your account
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-4">
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input
											type="email"
											placeholder="you@example.com"
											disabled={isLoading}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Password</FormLabel>
									<FormControl>
										<Input
											type="password"
											placeholder="******"
											disabled={isLoading}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Button
							type="submit"
							className="w-full"
							disabled={isLoading}>
							{isLoading ? "Logging in..." : "Login"}
						</Button>
					</form>
				</Form>
			</CardContent>
			<CardFooter className="flex flex-col space-y-2">
				<div className="text-sm text-center">
					<span className="text-muted-foreground">Don't have an account?</span>{" "}
					<a
						href="/signup"
						className="underline text-primary hover:text-primary/90">
						Sign up
					</a>
				</div>
				<div className="text-sm text-center">
					<a
						href="/forgot-password"
						className="underline text-primary hover:text-primary/90">
						Forgot your password?
					</a>
				</div>
			</CardFooter>
		</Card>
	);
});
