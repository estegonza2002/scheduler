import { SignUpForm } from "../components/auth/SignUpForm";
import { Link } from "react-router-dom";

export default function SignUpPage() {
	return (
		<div className="min-h-screen flex items-center justify-center p-4 bg-muted">
			<div className="w-full max-w-md">
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold text-primary mb-2">
						Employee Scheduler
					</h1>
					<p className="text-muted-foreground">
						Create an account to get started
					</p>
				</div>
				<SignUpForm />

				<div className="mt-8 text-center">
					<p className="text-sm text-muted-foreground mb-2">
						Are you a business owner?
					</p>
					<Link
						to="/business-signup"
						className="text-primary font-semibold hover:underline text-sm">
						Register a business account instead
					</Link>
				</div>
			</div>
		</div>
	);
}
