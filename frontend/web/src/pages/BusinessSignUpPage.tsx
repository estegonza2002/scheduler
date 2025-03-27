import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useAuth } from "../lib/auth";
import { OrganizationsAPI } from "../api";
import { ContentContainer } from "../components/ui/content-container";
import { FormSection } from "../components/ui/form-section";
import { ContentSection } from "../components/ui/content-section";

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
					},
				},
			});

			if (error) {
				toast.error(error.message);
				return;
			}

			// 2. Create the business organization
			try {
				const newOrg = await OrganizationsAPI.create({
					name: values.businessName,
					description: values.businessDescription,
				});

				toast.success("Business registration successful!");
				navigate("/admin-dashboard"); // Redirect to admin dashboard
			} catch (orgError: any) {
				toast.error(
					"Failed to create business: " + (orgError.message || "Unknown error")
				);
			}
		} catch (error: any) {
			toast.error("An unexpected error occurred");
			console.error(error);
		} finally {
			setIsLoading(false);
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

						<Button
							type="submit"
							className="w-full"
							disabled={isLoading}>
							{isLoading ? "Creating Account..." : "Register Business"}
						</Button>
					</form>
				</ContentSection>
			</ContentContainer>
		</div>
	);
}
