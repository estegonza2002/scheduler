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
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";

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
		<div className="flex min-h-screen items-center justify-center bg-muted p-4">
			<div className="w-full max-w-md">
				<Card className="border-none shadow-lg">
					<CardHeader className="text-center">
						<CardTitle className="text-xl">Reset your password</CardTitle>
						<CardDescription>
							Enter your email address and we'll send you a link to reset your
							password
						</CardDescription>
					</CardHeader>
					<CardContent>
						{emailSent ? (
							<div className="bg-muted p-6 rounded-lg text-center space-y-4">
								<p className="text-sm">
									Check your email for a link to reset your password. If it
									doesn't appear within a few minutes, check your spam folder.
								</p>
								<Button
									asChild
									variant="outline"
									className="w-full">
									<Link to="/login">Return to login</Link>
								</Button>
							</div>
						) : (
							<Form {...form}>
								<form
									onSubmit={form.handleSubmit(onSubmit)}
									className="space-y-6">
									<div className="space-y-4">
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
									</div>

									<Button
										type="submit"
										className="w-full"
										disabled={isLoading}>
										{isLoading ? "Sending..." : "Send reset link"}
									</Button>

									<div className="text-center text-sm">
										<Link
											to="/login"
											className="underline underline-offset-4 hover:text-primary">
											Back to login
										</Link>
									</div>
								</form>
							</Form>
						)}
					</CardContent>
				</Card>
				<div className="text-balance text-center text-xs text-muted-foreground mt-6 [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
					Need help? <a href="#">Contact support</a>
				</div>
			</div>
		</div>
	);
}
