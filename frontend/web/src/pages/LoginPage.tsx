import { LoginForm, LoginFormRef } from "../components/auth/LoginForm";
import { useRef } from "react";
import { Link } from "react-router-dom";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
	CardDescription,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ContentContainer } from "../components/ui/content-container";

export default function LoginPage() {
	const loginFormRef = useRef<LoginFormRef>(null);

	return (
		<div className="min-h-screen flex items-center justify-center bg-muted">
			<ContentContainer
				maxWidth="max-w-md"
				className="flex justify-center items-center">
				<Card className="w-full">
					<CardHeader className="text-center">
						<CardTitle className="text-4xl font-bold text-primary mb-2">
							Employee Scheduler
						</CardTitle>
						<CardDescription>Log in to manage your schedule</CardDescription>
					</CardHeader>
					<CardContent>
						<LoginForm ref={loginFormRef} />
					</CardContent>
					<CardFooter className="flex flex-col">
						<p className="text-sm text-muted-foreground mb-2">
							Don't have an account?
						</p>
						<div className="flex flex-col space-y-2">
							<Button
								variant="link"
								className="h-auto p-0"
								asChild>
								<Link to="/signup">Sign up as an employee</Link>
							</Button>
							<Button
								variant="link"
								className="h-auto p-0 font-semibold"
								asChild>
								<Link to="/business-signup">Register a business account</Link>
							</Button>
						</div>
					</CardFooter>
				</Card>
			</ContentContainer>
		</div>
	);
}
