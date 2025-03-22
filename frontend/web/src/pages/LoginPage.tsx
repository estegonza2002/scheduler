import { LoginForm, LoginFormRef } from "../components/auth/LoginForm";
import { useRef } from "react";
import { Link } from "react-router-dom";

export default function LoginPage() {
	const loginFormRef = useRef<LoginFormRef>(null);

	return (
		<div className="min-h-screen flex items-center justify-center p-4 bg-muted">
			<div className="w-full max-w-md">
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold text-primary mb-2">
						Employee Scheduler
					</h1>
					<p className="text-muted-foreground">
						Log in to manage your schedule
					</p>
				</div>
				<LoginForm ref={loginFormRef} />

				<div className="mt-8 text-center">
					<p className="text-sm text-muted-foreground mb-2">
						Don't have an account?
					</p>
					<div className="flex flex-col space-y-2">
						<Link
							to="/signup"
							className="text-primary hover:underline text-sm">
							Sign up as an employee
						</Link>
						<Link
							to="/business-signup"
							className="text-primary font-semibold hover:underline text-sm">
							Register a business account
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
