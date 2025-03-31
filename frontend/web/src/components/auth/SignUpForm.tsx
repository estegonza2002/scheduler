import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useAuth } from "../../lib/auth";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "../ui/form";
import { toast } from "sonner";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { supabase } from "../../lib/supabase";

const signUpSchema = z
	.object({
		firstName: z.string().min(1, "First name is required"),
		lastName: z.string().min(1, "Last name is required"),
		email: z.string().email("Invalid email address"),
		password: z.string().min(6, "Password must be at least 6 characters"),
		confirmPassword: z.string().min(6, "Confirm your password"),
		termsAccepted: z.boolean().refine((value) => value === true, {
			message: "You must accept the terms and conditions",
		}),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

type SignUpFormValues = z.infer<typeof signUpSchema>;

export function SignUpForm() {
	const { signUp } = useAuth();
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);

	const form = useForm<SignUpFormValues>({
		resolver: zodResolver(signUpSchema),
		defaultValues: {
			firstName: "",
			lastName: "",
			email: "",
			password: "",
			confirmPassword: "",
			termsAccepted: false,
		},
	});

	// Custom handler for terms acceptance logging
	const logTermsAcceptance = useCallback(
		async (userId: string, email: string) => {
			try {
				// Log terms acceptance for compliance
				await supabase.from("user_terms_acceptance").insert({
					user_id: userId,
					email: email,
					terms_version: "1.0",
					accepted_at: new Date().toISOString(),
					ip_address: "logged-client-side",
				});
				console.log("Terms acceptance logged successfully");
			} catch (error) {
				console.error("Failed to log terms acceptance:", error);
				// Don't block registration if this fails
			}
		},
		[]
	);

	const onSubmit = useCallback(
		async (values: SignUpFormValues) => {
			setIsLoading(true);
			try {
				// Using signUp from auth context
				const response = await signUp({
					email: values.email,
					password: values.password,
					options: {
						data: {
							firstName: values.firstName,
							lastName: values.lastName,
							termsAccepted: true,
							termsAcceptedAt: new Date().toISOString(),
							termsAcceptedVersion: "1.0", // Store version of terms they accepted
						},
					},
				});

				if (response.error) {
					// Check for specific error types and provide user-friendly messages
					if (response.error.message.includes("already registered")) {
						toast.error(
							"This email is already registered. Please login instead or use a different email."
						);
					} else if (response.error.message.includes("password")) {
						toast.error(response.error.message);
					} else {
						toast.error(response.error.message);
					}
					return;
				}

				// Log detailed terms acceptance
				if (response.data?.user) {
					await logTermsAcceptance(response.data.user.id, values.email);
				}

				// Show success message and redirect to pricing page for subscription
				toast.success(
					"Registration successful! Now choose a subscription plan to get started."
				);
				navigate("/pricing");
			} catch (error) {
				console.error("Registration exception:", error);
				toast.error("An unexpected error occurred during registration");
			} finally {
				setIsLoading(false);
			}
		},
		[signUp, navigate, logTermsAcceptance]
	);

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="space-y-4">
				<div className="grid gap-4">
					<div className="flex flex-col gap-4">
						<Button
							variant="outline"
							className="w-full">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								className="mr-2 h-4 w-4">
								<path
									d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
									fill="currentColor"
								/>
							</svg>
							Sign up with Apple
						</Button>
						<Button
							variant="outline"
							className="w-full">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								className="mr-2 h-4 w-4">
								<path
									d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
									fill="currentColor"
								/>
							</svg>
							Sign up with Google
						</Button>
					</div>

					<div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
						<span className="relative z-10 bg-card px-2 text-muted-foreground">
							Or sign up with email
						</span>
					</div>

					<div className="grid gap-4">
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div className="grid gap-2">
								<Label htmlFor="firstName">First Name</Label>
								<FormField
									control={form.control}
									name="firstName"
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<Input
													id="firstName"
													placeholder="John"
													disabled={isLoading}
													required
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className="grid gap-2">
								<Label htmlFor="lastName">Last Name</Label>
								<FormField
									control={form.control}
									name="lastName"
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<Input
													id="lastName"
													placeholder="Doe"
													disabled={isLoading}
													required
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="email">Email</Label>
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormControl>
											<Input
												id="email"
												type="email"
												placeholder="m@example.com"
												disabled={isLoading}
												required
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="password">Password</Label>
							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<FormControl>
											<Input
												id="password"
												type="password"
												placeholder="••••••••"
												disabled={isLoading}
												required
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="confirmPassword">Confirm Password</Label>
							<FormField
								control={form.control}
								name="confirmPassword"
								render={({ field }) => (
									<FormItem>
										<FormControl>
											<Input
												id="confirmPassword"
												type="password"
												placeholder="••••••••"
												disabled={isLoading}
												required
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="flex items-center space-x-2">
							<FormField
								control={form.control}
								name="termsAccepted"
								render={({ field }) => (
									<FormItem className="flex flex-row items-start space-x-3 space-y-0">
										<FormControl>
											<Checkbox
												id="termsAccepted"
												checked={field.value}
												onCheckedChange={field.onChange}
											/>
										</FormControl>
										<div className="space-y-1 leading-none">
											<Label
												htmlFor="termsAccepted"
												className="text-sm font-medium leading-none">
												I accept the terms and conditions
											</Label>
											<FormMessage />
										</div>
									</FormItem>
								)}
							/>
						</div>

						<Button
							type="submit"
							className="w-full"
							disabled={isLoading}>
							{isLoading ? "Creating account..." : "Create account"}
						</Button>
					</div>
				</div>
			</form>
		</Form>
	);
}
