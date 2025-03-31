import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { OrganizationsAPI } from "@/api";
import { ContentContainer } from "@/components/ui/content-container";
import { FormSection } from "@/components/ui/form-section";
import { ContentSection } from "@/components/ui/content-section";
import { GoogleBusinessButton } from "@/components/auth/GoogleBusinessButton";
import { supabase } from "@/lib/supabase";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";

// Define form schema for validation
const businessSignUpSchema = z
	.object({
		// Business information
		businessName: z.string().min(2, "Business name is required"),
		businessDescription: z.string().optional(),

		// User information
		firstName: z.string().min(2, "First name is required"),
		lastName: z.string().min(2, "Last name is required"),
		email: z.string().email("Invalid email address"),
		password: z.string().min(8, "Password must be at least 8 characters"),
		confirmPassword: z.string(),
		termsAccepted: z.boolean().refine((value) => value === true, {
			message: "You must accept the terms and conditions",
		}),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

type BusinessSignUpFormValues = z.infer<typeof businessSignUpSchema>;

export default function BusinessSignUpPage() {
	const { signUp } = useAuth();
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);
	const [isGoogleLoading, setIsGoogleLoading] = useState(false);

	const form = useForm<BusinessSignUpFormValues>({
		resolver: zodResolver(businessSignUpSchema),
		defaultValues: {
			businessName: "",
			businessDescription: "",
			firstName: "",
			lastName: "",
			email: "",
			password: "",
			confirmPassword: "",
			termsAccepted: false,
		},
	});

	async function onSubmit(values: BusinessSignUpFormValues) {
		setIsLoading(true);
		try {
			// 1. Register the user
			const { error, data } = await signUp({
				email: values.email,
				password: values.password,
				options: {
					data: {
						firstName: values.firstName,
						lastName: values.lastName,
						role: "admin", // Set role as admin for business owners
						termsAccepted: true,
						termsAcceptedAt: new Date().toISOString(),
						termsAcceptedVersion: "1.0", // Store version of terms they accepted
					},
				},
			});

			if (error) {
				// Check for specific error types and provide user-friendly messages
				if (error.message.includes("already registered")) {
					toast.error(
						"This email is already registered. Please login instead or use a different email."
					);
				} else if (error.message.includes("password")) {
					toast.error(error.message);
				} else {
					toast.error(error.message);
				}
				return;
			}

			// 2. Create the business organization directly with Supabase client
			try {
				// First sign in with the newly created account to get a session
				const { error: signInError } = await supabase.auth.signInWithPassword({
					email: values.email,
					password: values.password,
				});

				if (signInError) {
					toast.error(
						"Account created but couldn't sign in automatically: " +
							signInError.message
					);
					navigate("/login");
					return;
				}

				// Log terms acceptance
				await logTermsAcceptance(data?.user?.id, values.email);

				// Insert organization with a service role (bypassing RLS)
				const { data: newOrg, error: orgError } = await supabase
					.from("organizations")
					.insert({
						name: values.businessName,
						description: values.businessDescription || null,
						owner_id: data?.user?.id,
					})
					.select()
					.single();

				if (orgError) {
					console.error("Failed to create business organization:", orgError);
					toast.error(
						"Your account was created, but there was an issue setting up your business. Please log in and try again."
					);
					navigate("/login");
					return;
				}

				// Manually create the organization_members relationship
				if (data?.user?.id && newOrg) {
					const { error: memberError } = await supabase
						.from("organization_members")
						.insert({
							organization_id: newOrg.id,
							user_id: data.user.id,
							role: "owner",
						});

					if (memberError) {
						console.error(
							"Failed to create organization membership:",
							memberError
						);
						// Don't fail the whole operation if this fails, the trigger might have succeeded
					}
				}

				toast.success("Business registration successful!");
				// Store flag to indicate business signup, will be used to show setup modal if navigating directly to dashboard
				localStorage.setItem("business_signup", "true");
				// Redirect to pricing page for subscription selection
				navigate("/pricing");
			} catch (orgError: any) {
				console.error("Organization creation exception:", orgError);
				toast.error(
					"Account created, but failed to set up business. Please sign in and try again."
				);
				navigate("/login");
			}
		} catch (error: any) {
			toast.error("An unexpected error occurred");
			console.error("Registration exception:", error);
		} finally {
			setIsLoading(false);
		}
	}

	// Function to log terms acceptance in a separate table for audit purposes
	async function logTermsAcceptance(userId?: string, email?: string) {
		try {
			if (!userId || !email) return;

			const termsAcceptanceData = {
				user_id: userId,
				email: email,
				terms_version: "1.0",
				privacy_version: "1.0",
				accepted_at: new Date().toISOString(),
				ip_address: "Logged client-side", // In production, you'd log this server-side
				user_agent: navigator.userAgent,
			};

			// Insert into terms_acceptances table
			const { error } = await supabase
				.from("terms_acceptances")
				.insert(termsAcceptanceData);

			if (error) {
				console.error("Failed to log terms acceptance:", error);
				// Don't block registration if this fails - just log the error
			} else {
				console.log("Terms acceptance logged successfully");
			}
		} catch (error) {
			console.error("Error logging terms acceptance:", error);
		}
	}

	const handleGoogleSignIn = async () => {
		setIsGoogleLoading(true);
		try {
			console.log("Starting Google sign-in for business process...");

			// Set session flag to indicate business signup BEFORE redirect
			localStorage.setItem("business_signup", "true");

			// Use direct Supabase client call with specific redirectTo
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
				localStorage.removeItem("business_signup");
			} else {
				console.log("Google auth initialized, redirecting to:", data?.url);
				// The browser will be redirected automatically by Supabase
			}
		} catch (error) {
			console.error("Exception during Google sign in:", error);
			toast.error("An error occurred during Google sign in");
			localStorage.removeItem("business_signup");
		} finally {
			setIsGoogleLoading(false);
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-muted p-4">
			<div className="w-full max-w-xl">
				<Card className="border-none shadow-lg">
					<CardHeader className="text-center">
						<CardTitle className="text-xl">Register Your Business</CardTitle>
						<CardDescription>
							Create your business account to start managing employee schedules
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="space-y-6">
							<div className="flex flex-col gap-4 mb-6">
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
											Register with Google
										</>
									)}
								</Button>
							</div>

							<div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
								<span className="relative z-10 bg-card px-2 text-muted-foreground">
									Or register with email
								</span>
							</div>

							<div className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="businessName">Business Name</Label>
									<Input
										id="businessName"
										placeholder="Enter your business name"
										{...form.register("businessName")}
									/>
									{form.formState.errors.businessName && (
										<p className="text-sm text-destructive">
											{form.formState.errors.businessName.message}
										</p>
									)}
								</div>

								<div className="space-y-2">
									<Label htmlFor="businessDescription">
										Business Description (Optional)
									</Label>
									<Input
										id="businessDescription"
										placeholder="Enter a short description of your business"
										{...form.register("businessDescription")}
									/>
								</div>

								<div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
									<div className="space-y-2">
										<Label htmlFor="firstName">First Name</Label>
										<Input
											id="firstName"
											placeholder="Enter your first name"
											{...form.register("firstName")}
										/>
										{form.formState.errors.firstName && (
											<p className="text-sm text-destructive">
												{form.formState.errors.firstName.message}
											</p>
										)}
									</div>

									<div className="space-y-2">
										<Label htmlFor="lastName">Last Name</Label>
										<Input
											id="lastName"
											placeholder="Enter your last name"
											{...form.register("lastName")}
										/>
										{form.formState.errors.lastName && (
											<p className="text-sm text-destructive">
												{form.formState.errors.lastName.message}
											</p>
										)}
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor="email">Email</Label>
									<Input
										id="email"
										type="email"
										placeholder="m@example.com"
										{...form.register("email")}
									/>
									{form.formState.errors.email && (
										<p className="text-sm text-destructive">
											{form.formState.errors.email.message}
										</p>
									)}
								</div>

								<div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
									<div className="space-y-2">
										<Label htmlFor="password">Password</Label>
										<Input
											id="password"
											type="password"
											placeholder="••••••••"
											{...form.register("password")}
										/>
										{form.formState.errors.password && (
											<p className="text-sm text-destructive">
												{form.formState.errors.password.message}
											</p>
										)}
									</div>

									<div className="space-y-2">
										<Label htmlFor="confirmPassword">Confirm Password</Label>
										<Input
											id="confirmPassword"
											type="password"
											placeholder="••••••••"
											{...form.register("confirmPassword")}
										/>
										{form.formState.errors.confirmPassword && (
											<p className="text-sm text-destructive">
												{form.formState.errors.confirmPassword.message}
											</p>
										)}
									</div>
								</div>

								<div className="flex items-center space-x-2">
									<Checkbox
										id="termsAccepted"
										onCheckedChange={(checked) => {
											form.setValue("termsAccepted", checked === true);
										}}
									/>
									<label
										htmlFor="termsAccepted"
										className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
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
									</label>
									{form.formState.errors.termsAccepted && (
										<p className="text-sm text-destructive">
											{form.formState.errors.termsAccepted.message}
										</p>
									)}
								</div>
							</div>

							<Button
								type="submit"
								className="w-full"
								disabled={isLoading}>
								{isLoading ? "Registering..." : "Register Your Business"}
							</Button>

							<div className="text-center text-sm">
								<p className="text-muted-foreground">
									Already have an account?{" "}
									<Link
										to="/login"
										className="underline underline-offset-4 hover:text-primary">
										Login
									</Link>
								</p>
							</div>
						</form>
					</CardContent>
				</Card>
				<div className="text-balance text-center text-xs text-muted-foreground mt-6 [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
					By registering, you agree to our <a href="/terms">Terms of Service</a>{" "}
					and <a href="/privacy">Privacy Policy</a>.
				</div>
			</div>
		</div>
	);
}
