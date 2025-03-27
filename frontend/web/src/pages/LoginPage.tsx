import { LoginForm, LoginFormRef } from "@/components/auth/LoginForm";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ContentContainer } from "@/components/ui/content-container";
import { ContentSection } from "@/components/ui/content-section";

export default function LoginPage() {
	const loginFormRef = useRef<LoginFormRef>(null);

	return (
		<div className="min-h-screen flex items-center justify-center bg-muted">
			<ContentContainer
				maxWidth="max-w-md"
				className="flex justify-center items-center">
				<ContentSection
					title="Employee Scheduler"
					description="Log in to manage your schedule"
					footer={
						<div className="flex flex-col space-y-2">
							<p className="text-sm text-muted-foreground mb-2">
								Don't have an account?
							</p>
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
							<div className="text-sm text-center mt-2">
								<Link
									to="/forgot-password"
									className="underline text-primary hover:text-primary/90">
									Forgot your password?
								</Link>
							</div>
						</div>
					}>
					<LoginForm ref={loginFormRef} />
				</ContentSection>
			</ContentContainer>
		</div>
	);
}
