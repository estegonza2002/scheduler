import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { useOrganization } from "@/lib/organization-context";
import { ContentContainer } from "@/components/ui/content-container";
import { ContentSection } from "@/components/ui/content-section";
import { GoogleBusinessButton } from "@/components/auth/GoogleBusinessButton";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";

// Define form schema for validation
const signUpSchema = z
	.object({
		firstName: z.string().min(1, "First name is required"),
		lastName: z.string().min(1, "Last name is required"),
		email: z.string().email("Invalid email address"),
		password: z.string().min(6, "Password must be at least 6 characters"),
		confirmPassword: z.string(),
		businessName: z
			.string()
			.min(2, "Business name must be at least 2 characters"),
		terms: z.boolean().refine((val) => val === true, {
			message: "You must accept the terms and conditions",
		}),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

type SignUpFormValues = z.infer<typeof signUpSchema>;

export default function BusinessSignUpPage() {
	const { signUp, user } = useAuth();
	const { createOrganization } = useOrganization();
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
			businessName: "",
			terms: false,
		},
	});

	useEffect(() => {
		if (user) {
			console.log("User already logged in, redirecting...");
			navigate("/dashboard");
		}
	}, [user, navigate]);

	async function onSubmit(values: SignUpFormValues) {
		setIsLoading(true);
		try {
			console.log("Attempting user sign up via Firebase...");
			const profileData = {
				firstName: values.firstName,
				lastName: values.lastName,
			};
			await signUp(values.email, values.password, profileData);
			console.log("User sign up successful (Firebase).");

			console.log("Attempting to create organization via context...");
			const organization = await createOrganization(values.businessName);

			if (organization) {
				console.log("Organization created successfully:", organization);
				toast.success("Business account created successfully!");
				navigate(`/business/${organization.id}/dashboard`);
			} else {
				console.error(
					"Organization creation failed (returned null), user might be created."
				);
				toast.error(
					"Account created, but failed to set up business. Please log in and try creating an organization manually."
				);
				navigate("/login");
			}
		} catch (error: any) {
			console.error("Business Sign Up Process Error:", error);
			let errorMessage = "Business sign up failed. Please try again.";
			if (error.message) {
				if (error.code === "auth/email-already-in-use") {
					errorMessage =
						"This email is already registered. Please login instead.";
				} else {
					errorMessage = error.message;
				}
			}
			toast.error(errorMessage);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-muted">
			<ContentContainer className="w-full max-w-lg">
				<ContentSection
					title="Create your Business Account"
					description="Get started by creating your business profile and first user account."
					footer={
						<div className="text-sm text-center">
							<span className="text-muted-foreground">
								Already have an account?
							</span>{" "}
							<Link
								to="/login"
								className="font-medium text-primary hover:underline">
								Sign in
							</Link>
						</div>
					}>
					<div className="mb-6">
						<GoogleBusinessButton />
					</div>

					<div className="relative mb-6">
						<div className="absolute inset-0 flex items-center">
							<span className="w-full border-t" />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-card px-2 text-muted-foreground">
								Or continue with email
							</span>
						</div>
					</div>

					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="firstName"
									render={({ field }) => (
										<FormItem>
											<FormLabel>First Name</FormLabel>
											<FormControl>
												<Input
													placeholder="Your first name"
													{...field}
												/>
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
											<FormLabel>Last Name</FormLabel>
											<FormControl>
												<Input
													placeholder="Your last name"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input
												type="email"
												placeholder="you@company.com"
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
												placeholder="••••••••"
												{...field}
											/>
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
										<FormLabel>Confirm Password</FormLabel>
										<FormControl>
											<Input
												type="password"
												placeholder="••••••••"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="businessName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Business Name</FormLabel>
										<FormControl>
											<Input
												placeholder="Your Company Inc."
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="terms"
								render={({ field }) => (
									<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
										<FormControl>
											<Checkbox
												checked={field.value}
												onCheckedChange={field.onChange}
											/>
										</FormControl>
										<div className="space-y-1 leading-none">
											<FormLabel>Accept terms and conditions</FormLabel>
											<FormDescription>
												You agree to our Terms of Service and Privacy Policy.
											</FormDescription>
											<FormMessage />
										</div>
									</FormItem>
								)}
							/>
							<Button
								type="submit"
								className="w-full"
								disabled={isLoading}>
								{isLoading ? "Creating Account..." : "Create Account"}
							</Button>
						</form>
					</Form>
				</ContentSection>
			</ContentContainer>
		</div>
	);
}
