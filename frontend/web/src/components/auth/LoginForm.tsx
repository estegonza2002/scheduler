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
	FormLabel,
	FormMessage,
} from "../ui/form";
import { toast } from "sonner";
import { Label } from "../ui/label";
import { supabase } from "../../lib/supabase";

const loginSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
	const { signIn, signInWithGoogle } = useAuth();
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);
	const [isGoogleLoading, setIsGoogleLoading] = useState(false);

	const form = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const onSubmit = useCallback(
		async (values: LoginFormValues) => {
			setIsLoading(true);
			try {
				const { data, error } = await signIn({
					email: values.email,
					password: values.password,
				});

				if (error) {
					if (error.message.includes("Invalid login credentials")) {
						toast.error("Invalid email or password. Please try again.");
					} else if (error.message.includes("Email not confirmed")) {
						toast.error("Please confirm your email address before logging in.");
					} else {
						toast.error(error.message);
					}
					console.error("Login error:", error);
					return;
				}

				toast.success("Logged in successfully");

				// Check if user is an admin and redirect to appropriate dashboard
				const isAdmin = data.user?.user_metadata?.role === "admin";
				navigate(isAdmin ? "/admin-dashboard" : "/dashboard");
			} catch (error) {
				toast.error("An unexpected error occurred");
				console.error("Login exception:", error);
			} finally {
				setIsLoading(false);
			}
		},
		[signIn, navigate]
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
									Login with Google
								</>
							)}
						</Button>
					</div>
					<div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
						<span className="relative z-10 bg-card px-2 text-muted-foreground">
							Or continue with
						</span>
					</div>
					<div className="grid gap-4">
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
												required
												disabled={isLoading}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="grid gap-2">
							<div className="flex items-center">
								<Label htmlFor="password">Password</Label>
								<a
									href="/forgot-password"
									className="ml-auto text-sm underline-offset-4 hover:underline">
									Forgot your password?
								</a>
							</div>
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
												required
												disabled={isLoading}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<Button
							type="submit"
							className="w-full"
							disabled={isLoading}>
							{isLoading ? "Logging in..." : "Login"}
						</Button>
					</div>
				</div>
			</form>
		</Form>
	);
}
