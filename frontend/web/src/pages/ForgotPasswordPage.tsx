import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { FormSection } from "@/components/ui/form-section";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ContentContainer } from "@/components/ui/content-container";
import { ContentSection } from "@/components/ui/content-section";
import { Mail } from "lucide-react";

const forgotPasswordSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
	const { resetPassword } = useAuth();
	const [isLoading, setIsLoading] = useState(false);
	const [emailSent, setEmailSent] = useState(false);

	const form = useForm<ForgotPasswordFormValues>({
		resolver: zodResolver(forgotPasswordSchema),
		defaultValues: {
			email: "",
		},
	});

	const onSubmit = useCallback(
		async (values: ForgotPasswordFormValues) => {
			setIsLoading(true);
			try {
				const { error } = await resetPassword(values.email);

				if (error) {
					toast.error(error.message);
					return;
				}

				setEmailSent(true);
				toast.success("Password reset instructions sent to your email");
			} catch (error) {
				toast.error("An unexpected error occurred");
				console.error("Password reset error:", error);
			} finally {
				setIsLoading(false);
			}
		},
		[resetPassword]
	);

	return (
		<ContentContainer>
			<ContentSection
				title="Reset Password"
				className="max-w-md mx-auto">
				<div className="space-y-6">
					<div className="text-center">
						<h1 className="text-2xl font-bold tracking-tight">
							Reset your password
						</h1>
						<p className="text-sm text-muted-foreground mt-2">
							Enter your email address and we'll send you a link to reset your
							password
						</p>
					</div>

					{emailSent ? (
						<div className="bg-muted p-4 rounded-md">
							<p className="text-center">
								Check your email for a link to reset your password. If it
								doesn't appear within a few minutes, check your spam folder.
							</p>
							<div className="mt-4 text-center">
								<Link
									to="/login"
									className="text-primary hover:underline">
									Return to login
								</Link>
							</div>
						</div>
					) : (
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className="space-y-6">
								<FormSection
									title="Password Recovery"
									description="We'll send you a secure reset link">
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
								</FormSection>

								<Button
									type="submit"
									className="w-full"
									disabled={isLoading}>
									{isLoading ? "Sending..." : "Send reset link"}
								</Button>

								<div className="text-center text-sm">
									<Link
										to="/login"
										className="text-primary hover:underline">
										Back to login
									</Link>
								</div>
							</form>
						</Form>
					)}
				</div>
			</ContentSection>
		</ContentContainer>
	);
}
