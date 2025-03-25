import { SignUpForm } from "../components/auth/SignUpForm";
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

export default function SignUpPage() {
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
						<CardDescription>Create an account to get started</CardDescription>
					</CardHeader>
					<CardContent>
						<SignUpForm />
					</CardContent>
					<CardFooter className="flex flex-col">
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
					</CardFooter>
				</Card>
			</ContentContainer>
		</div>
	);
}
