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
				navigate("/admin-dashboard"); // Redirect to admin dashboard
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

	return (
		<div className="min-h-screen flex items-center justify-center bg-muted">
			<ContentContainer maxWidth="max-w-2xl">
				<ContentSection
					title="Register Your Business"
					description="Create your business account to start managing employee schedules"
					footer={
						<div className="text-center">
							<p className="text-sm text-muted-foreground">
								Already have a business account?{" "}
								<Link
									to="/login"
									className="text-primary font-semibold hover:underline">
									Login
								</Link>
							</p>
						</div>
					}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-6">
						{/* Business Information Section */}
						<FormSection
							title="Business Information"
							description="Enter details about your business">
							<div className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="businessName">Business Name</Label>
									<Input
										id="businessName"
										placeholder="Enter your business name"
										{...form.register("businessName")}
									/>
									{form.formState.errors.businessName && (
										<p className="text-sm text-red-500">
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
							</div>
						</FormSection>

						{/* Admin Account Information Section */}
						<FormSection
							title="Your Admin Account"
							description="Create your administrator account">
							<div className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="firstName">First Name</Label>
										<Input
											id="firstName"
											placeholder="Enter your first name"
											{...form.register("firstName")}
										/>
										{form.formState.errors.firstName && (
											<p className="text-sm text-red-500">
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
											<p className="text-sm text-red-500">
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
										placeholder="your@email.com"
										{...form.register("email")}
									/>
									{form.formState.errors.email && (
										<p className="text-sm text-red-500">
											{form.formState.errors.email.message}
										</p>
									)}
								</div>

								<div className="space-y-2">
									<Label htmlFor="password">Password</Label>
									<Input
										id="password"
										type="password"
										placeholder="Create a password"
										{...form.register("password")}
									/>
									{form.formState.errors.password && (
										<p className="text-sm text-red-500">
											{form.formState.errors.password.message}
										</p>
									)}
								</div>

								<div className="space-y-2">
									<Label htmlFor="confirmPassword">Confirm Password</Label>
									<Input
										id="confirmPassword"
										type="password"
										placeholder="Confirm your password"
										{...form.register("confirmPassword")}
									/>
									{form.formState.errors.confirmPassword && (
										<p className="text-sm text-red-500">
											{form.formState.errors.confirmPassword.message}
										</p>
									)}
								</div>
							</div>
						</FormSection>

						<div className="py-2">
							<div className="flex items-start space-x-3">
								<Checkbox
									id="termsAccepted"
									checked={form.watch("termsAccepted")}
									onCheckedChange={(checked) =>
										form.setValue("termsAccepted", checked === true)
									}
								/>
								<div className="space-y-1 leading-none">
									<Label
										htmlFor="termsAccepted"
										className="text-sm font-normal">
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
									</Label>
									{form.formState.errors.termsAccepted && (
										<p className="text-sm text-red-500">
											{form.formState.errors.termsAccepted.message}
										</p>
									)}
								</div>
							</div>
						</div>

						<Button
							type="submit"
							className="w-full"
							disabled={isLoading}>
							{isLoading ? "Creating Account..." : "Register Business"}
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

						<GoogleBusinessButton text="Sign up with Google" />
					</form>
				</ContentSection>
			</ContentContainer>
		</div>
	);
}
