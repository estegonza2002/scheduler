import { SignUpForm } from "@/components/auth/SignUpForm";
import { Link } from "react-router-dom";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";

export default function SignUpPage() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-muted p-4">
			<div className="w-full max-w-md">
				<Card className="border-none shadow-lg">
					<CardHeader className="text-center">
						<CardTitle className="text-xl">Employee Scheduler</CardTitle>
						<CardDescription>Create an account to get started</CardDescription>
					</CardHeader>
					<CardContent>
						<SignUpForm />
						<div className="text-center text-sm mt-6">
							<p className="text-muted-foreground">
								Are you a business owner?{" "}
								<Link
									to="/business-signup"
									className="underline underline-offset-4 hover:text-primary">
									Register a business account
								</Link>
							</p>
							<p className="text-muted-foreground mt-2">
								Already have an account?{" "}
								<Link
									to="/login"
									className="underline underline-offset-4 hover:text-primary">
									Login
								</Link>
							</p>
						</div>
					</CardContent>
				</Card>
				<div className="text-balance text-center text-xs text-muted-foreground mt-6 [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
					By signing up, you agree to our <a href="/terms">Terms of Service</a>{" "}
					and <a href="/privacy">Privacy Policy</a>.
				</div>
			</div>
		</div>
	);
}
