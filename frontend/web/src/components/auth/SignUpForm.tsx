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
	const [isGoogleLoading, setIsGoogleLoading] = useState(false);

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
				console.log("Attempting to log terms acceptance for user:", userId);

				// Log essential terms acceptance data, with error handling
				const { error: insertError } = await supabase
					.from("terms_acceptances")
					.insert({
						user_id: userId,
						email: email,
						terms_version: "1.0",
						privacy_version: "1.0",
						accepted_at: new Date().toISOString(),
						ip_address: "Logged client-side",
						user_agent: navigator.userAgent,
					});

				if (insertError) {
					console.warn(
						"Failed to insert terms acceptance record:",
						insertError.message
					);
					// Continue with registration even if this fails
				} else {
					console.log("Terms acceptance logged successfully");
				}
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
				console.log("Starting signup process for email:", values.email);

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
						toast.error(`Registration error: ${response.error.message}`);
					}
					console.error("Signup error:", response.error);
					return;
				}

				// Sign-up succeeded, try to log terms acceptance but don't block registration if it fails
				if (response.data?.user) {
					console.log("User created successfully:", response.data.user.id);

					// Try to log terms acceptance but continue regardless of result
					logTermsAcceptance(response.data.user.id, values.email).catch(
						(termsError) => {
							console.warn(
								"Terms acceptance logging failed, but continuing with registration:",
								termsError
							);
						}
					);

					// Success message and redirect to account type selection page
					toast.success(
						"Registration successful! Please select how you want to use the platform."
					);
					navigate("/account-type");
				} else {
					// This shouldn't happen if there's no error but response.data.user is null
					console.warn("Sign-up completed but no user data returned");
					toast.success("Registration successful! Please continue.");
					navigate("/account-type");
				}
			} catch (error) {
				console.error("Unexpected registration exception:", error);
				toast.error(
					"An unexpected error occurred during registration. Please try again."
				);
			} finally {
				setIsLoading(false);
			}
		},
		[signUp, navigate, logTermsAcceptance]
	);

	const handleGoogleSignIn = async () => {
		setIsGoogleLoading(true);
		try {
			console.log("Starting Google sign-in process...");

			// Clear any existing business signup flag
			localStorage.removeItem("business_signup");

			// Use direct Supabase client call
			const { data, error } = await supabase.auth.signInWithOAuth({
				provider: "google",
				options: {
					redirectTo: `${window.location.origin}/auth-callback`,
					queryParams: {
						prompt: "select_account",
					},
				},
			});

			if (error) {
				console.error("Google sign-in error:", error);
				toast.error(`Google sign-in error: ${error.message}`);
			} else {
				console.log("Google auth initialized, redirecting to:", data?.url);
				// The browser will be redirected automatically by Supabase
			}
		} catch (error) {
			console.error("Exception during Google sign in:", error);
			toast.error("An error occurred during Google sign in");
		} finally {
			setIsGoogleLoading(false);
		}
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="space-y-4">
				<div className="grid gap-4">
					<div className="flex flex-col gap-4">
						<Button
							type="button"
							variant="outline"
							className="w-full"
							onClick={handleGoogleSignIn}
							disabled={isGoogleLoading}>
							{isGoogleLoading ? (
								"Loading..."
							) : (
								<>
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
								</>
							)}
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
												I accept the{" "}
												<a
													href="/terms"
													className="underline hover:text-primary">
													terms and conditions
												</a>{" "}
												and{" "}
												<a
													href="/privacy"
													className="underline hover:text-primary">
													privacy policy
												</a>
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
