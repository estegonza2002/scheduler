import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { toast } from "sonner";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../components/ui/form";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { ContentContainer } from "../components/ui/content-container";

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

	async function onSubmit(values: ForgotPasswordFormValues) {
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
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-muted">
			<ContentContainer
				maxWidth="max-w-md"
				className="flex justify-center items-center">
				<Card className="w-full">
					<CardHeader className="text-center">
						<CardTitle className="text-2xl font-bold text-primary mb-2">
							Forgot Password
						</CardTitle>
						<CardDescription>
							{emailSent
								? "Check your email for a link to reset your password"
								: "Enter your email address to reset your password"}
						</CardDescription>
					</CardHeader>
					<CardContent>
						{!emailSent ? (
							<Form {...form}>
								<form
									onSubmit={form.handleSubmit(onSubmit)}
									className="space-y-4">
									<FormField
										control={form.control}
										name="email"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Email</FormLabel>
												<FormControl>
													<Input
														type="email"
														placeholder="you@example.com"
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
										{isLoading ? "Sending..." : "Send Reset Instructions"}
									</Button>
								</form>
							</Form>
						) : (
							<div className="text-center space-y-4">
								<p className="text-sm text-muted-foreground">
									We've sent password reset instructions to your email. Please
									check your inbox and follow the instructions to reset your
									password.
								</p>
								<Button
									type="button"
									variant="outline"
									className="w-full"
									onClick={() => setEmailSent(false)}>
									Try Again
								</Button>
							</div>
						)}
					</CardContent>
					<CardFooter className="flex justify-center">
						<div className="text-sm text-center">
							<span className="text-muted-foreground">
								Remember your password?
							</span>{" "}
							<Link
								to="/login"
								className="underline text-primary hover:text-primary/90">
								Back to Login
							</Link>
						</div>
					</CardFooter>
				</Card>
			</ContentContainer>
		</div>
	);
}
