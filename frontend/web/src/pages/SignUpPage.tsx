import { SignUpForm } from "@/components/auth/SignUpForm";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ContentContainer } from "@/components/ui/content-container";
import { ContentSection } from "@/components/ui/content-section";

export default function SignUpPage() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-muted">
			<ContentContainer
				maxWidth="max-w-md"
				className="flex justify-center items-center">
				<ContentSection
					title="Employee Scheduler"
					description="Create an account to get started"
					footer={
						<div className="flex flex-col mt-4">
							<p className="text-sm text-muted-foreground mb-2">
								Are you a business owner?
							</p>
							<Button
								variant="link"
								className="h-auto p-0 font-semibold"
								asChild>
								<Link to="/business-signup">
									Register a business account instead
								</Link>
							</Button>
						</div>
					}>
					<SignUpForm />
				</ContentSection>
			</ContentContainer>
		</div>
	);
}
