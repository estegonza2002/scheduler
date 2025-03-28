import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useAuth } from "../../lib/auth";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { GoogleButton } from "./GoogleButton";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../ui/form";
import { FormSection } from "../ui/form-section";
import { toast } from "sonner";
import { Checkbox } from "../ui/checkbox";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { User, Mail, Lock } from "lucide-react";

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
				console.log("Starting registration with values:", {
					email: values.email,
					// Don't log the actual password for security
					password: "***********",
					data: {
						firstName: values.firstName,
						lastName: values.lastName,
					},
				});

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

				console.log("Registration response:", {
					error: response.error
						? {
								message: response.error.message,
								status: response.error.status,
						  }
						: null,
					user: response.data?.user ? "User data exists" : "No user data",
				});

				if (response.error) {
					console.error("Registration error details:", response.error);

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

				// Show success message and redirect to confirmation page
				toast.success(
					"Registration successful! Please check your email to confirm your account."
				);
				navigate("/auth/confirm-email", { state: { email: values.email } });
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
				className="space-y-6">
				<FormSection
					title="Personal Information"
					description="Tell us about yourself">
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<FormField
							control={form.control}
							name="firstName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										First Name <span className="text-destructive">*</span>
									</FormLabel>
									<FormControl>
										<div className="relative">
											<Input
												placeholder="John"
												disabled={isLoading}
												className="pl-9"
												aria-required="true"
												aria-invalid={!!form.formState.errors.firstName}
												required
												{...field}
											/>
											<User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="lastName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										Last Name <span className="text-destructive">*</span>
									</FormLabel>
									<FormControl>
										<div className="relative">
											<Input
												placeholder="Doe"
												disabled={isLoading}
												className="pl-9"
												aria-required="true"
												aria-invalid={!!form.formState.errors.lastName}
												required
												{...field}
											/>
											<User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
				</FormSection>

				<FormSection
					title="Account Information"
					description="Create your account credentials">
					<div className="space-y-4">
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										Email <span className="text-destructive">*</span>
									</FormLabel>
									<FormControl>
										<div className="relative">
											<Input
												type="email"
												placeholder="you@example.com"
												disabled={isLoading}
												className="pl-9"
												aria-required="true"
												aria-invalid={!!form.formState.errors.email}
												required
												{...field}
											/>
											<Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
										</div>
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
									<FormLabel>
										Password <span className="text-destructive">*</span>
									</FormLabel>
									<FormControl>
										<div className="relative">
											<Input
												type="password"
												placeholder="******"
												disabled={isLoading}
												className="pl-9"
												aria-required="true"
												aria-invalid={!!form.formState.errors.password}
												required
												{...field}
											/>
											<Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="confirmPassword"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										Confirm Password <span className="text-destructive">*</span>
									</FormLabel>
									<FormControl>
										<div className="relative">
											<Input
												type="password"
												placeholder="******"
												disabled={isLoading}
												className="pl-9"
												aria-required="true"
												aria-invalid={!!form.formState.errors.confirmPassword}
												required
												{...field}
											/>
											<Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
				</FormSection>

				<FormSection
					title="Terms and Conditions"
					description="Please review our terms">
					<FormField
						control={form.control}
						name="termsAccepted"
						render={({ field }) => (
							<FormItem className="flex flex-row items-start space-x-3 space-y-0 py-2">
								<FormControl>
									<Checkbox
										checked={field.value}
										onCheckedChange={field.onChange}
										disabled={isLoading}
										aria-required="true"
										aria-invalid={!!form.formState.errors.termsAccepted}
									/>
								</FormControl>
								<div className="space-y-1 leading-none">
									<FormLabel className="text-sm font-normal">
										I agree to the{" "}
										<Link
											to="/terms"
											className="text-primary hover:underline"
											target="_blank"
											rel="noopener noreferrer">
											Terms of Service
										</Link>{" "}
										and{" "}
										<Link
											to="/privacy"
											className="text-primary hover:underline"
											target="_blank"
											rel="noopener noreferrer">
											Privacy Policy
										</Link>
									</FormLabel>
									<FormMessage />
								</div>
							</FormItem>
						)}
					/>
				</FormSection>

				<Button
					type="submit"
					className="w-full"
					disabled={isLoading}>
					{isLoading ? "Creating account..." : "Create account"}
				</Button>

				<div className="relative my-4">
					<div className="absolute inset-0 flex items-center">
						<div className="w-full border-t border-gray-300"></div>
					</div>
					<div className="relative flex justify-center text-sm">
						<span className="px-2 bg-background text-muted-foreground">
							Or continue with
						</span>
					</div>
				</div>

				<GoogleButton text="Sign up with Google" />
			</form>
		</Form>
	);
}
