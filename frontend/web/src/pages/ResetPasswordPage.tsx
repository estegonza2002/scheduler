import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ContentContainer } from "@/components/ui/content-container";
import { ContentSection } from "@/components/ui/content-section";

const resetPasswordSchema = z
	.object({
		password: z.string().min(8, "Password must be at least 8 characters"),
		confirmPassword: z
			.string()
			.min(8, "Password must be at least 8 characters"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);
	const [isResetSuccessful, setIsResetSuccessful] = useState(false);
	const [tokenError, setTokenError] = useState(false);

	const form = useForm<ResetPasswordFormValues>({
		resolver: zodResolver(resetPasswordSchema),
		defaultValues: {
			password: "",
			confirmPassword: "",
		},
	});

	// Check if we have a valid hash in the URL
	useEffect(() => {
		const checkHashParams = async () => {
			const hash = window.location.hash.substring(1);
			if (!hash) {
				setTokenError(true);
				toast.error("Invalid or expired password reset link");
				return;
			}

			// Parse the hash parameters to get access_token
			const params = new URLSearchParams(hash);
			const accessToken = params.get("access_token");

			if (!accessToken) {
				setTokenError(true);
				toast.error("Invalid or expired password reset link");
			}
		};

		checkHashParams();
	}, []);

	async function onSubmit(values: ResetPasswordFormValues) {
		setIsLoading(true);
		try {
			// Get the access token from the URL hash
			const hash = window.location.hash.substring(1);
			const params = new URLSearchParams(hash);
			const accessToken = params.get("access_token");

			if (!accessToken) {
				throw new Error("No access token found");
			}

			// Update the user's password
			const { error } = await supabase.auth.updateUser({
				password: values.password,
			});

			if (error) {
				toast.error(error.message);
				return;
			}

			setIsResetSuccessful(true);
			toast.success("Password reset successfully");
		} catch (error) {
			toast.error("Failed to reset password");
			console.error("Password reset error:", error);
		} finally {
			setIsLoading(false);
		}
	}

	function handleReturnToLogin() {
		navigate("/login");
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-muted">
			<ContentContainer
				maxWidth="max-w-md"
				className="flex justify-center items-center">
				<ContentSection
					title="Reset Password"
					description={
						isResetSuccessful
							? "Your password has been reset successfully"
							: tokenError
							? "Invalid or expired reset link"
							: "Create a new password for your account"
					}
					footer={
						!isResetSuccessful &&
						!tokenError && (
							<div className="text-sm text-center">
								<span className="text-muted-foreground">
									Remember your password?
								</span>{" "}
								<Button
									variant="link"
									className="p-0 h-auto"
									onClick={handleReturnToLogin}>
									Back to Login
								</Button>
							</div>
						)
					}>
					{tokenError ? (
						<div className="text-center space-y-4">
							<p className="text-sm text-muted-foreground">
								The password reset link is invalid or has expired. Please
								request a new password reset link.
							</p>
							<Button
								type="button"
								className="w-full"
								onClick={() => navigate("/forgot-password")}>
								Request New Reset Link
							</Button>
						</div>
					) : isResetSuccessful ? (
						<div className="text-center space-y-4">
							<p className="text-sm text-muted-foreground">
								Your password has been reset successfully. You can now log in
								with your new password.
							</p>
							<Button
								type="button"
								className="w-full"
								onClick={handleReturnToLogin}>
								Return to Login
							</Button>
						</div>
					) : (
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className="space-y-4">
								<FormField
									control={form.control}
									name="password"
									render={({ field }) => (
										<FormItem>
											<FormLabel>New Password</FormLabel>
											<FormControl>
												<Input
													type="password"
													placeholder="Enter your new password"
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
									name="confirmPassword"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Confirm Password</FormLabel>
											<FormControl>
												<Input
													type="password"
													placeholder="Confirm your new password"
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
									{isLoading ? "Resetting..." : "Reset Password"}
								</Button>
							</form>
						</Form>
					)}
				</ContentSection>
			</ContentContainer>
		</div>
	);
}
