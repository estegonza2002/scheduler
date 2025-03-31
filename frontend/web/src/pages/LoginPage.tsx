import { useState } from "react";
import { Link } from "react-router-dom";
import { LoginForm } from "@/components/auth/LoginForm";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";

export default function LoginPage() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-muted p-4">
			<div className="w-full max-w-md">
				<Card className="border-none shadow-lg">
					<CardHeader className="text-center">
						<CardTitle className="text-xl">Employee Scheduler</CardTitle>
						<CardDescription>Log in to manage your schedule</CardDescription>
					</CardHeader>
					<CardContent>
						<LoginForm />
						<div className="text-center text-sm mt-6 space-y-2">
							<p className="text-muted-foreground">
								Don't have an account?{" "}
								<Link
									to="/signup"
									className="underline underline-offset-4 hover:text-primary">
									Sign up as an employee
								</Link>
							</p>
							<p className="text-muted-foreground">
								<Link
									to="/business-signup"
									className="underline underline-offset-4 hover:text-primary">
									Register a business account
								</Link>
							</p>
							<p className="text-muted-foreground mt-2">
								<Link
									to="/forgot-password"
									className="underline underline-offset-4 hover:text-primary">
									Forgot your password?
								</Link>
							</p>
						</div>
					</CardContent>
				</Card>
				<div className="text-balance text-center text-xs text-muted-foreground mt-6 [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
					By logging in, you agree to our <a href="/terms">Terms of Service</a>{" "}
					and <a href="/privacy">Privacy Policy</a>.
				</div>
			</div>
		</div>
	);
}
