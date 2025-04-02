import { SignUpForm } from "@/components/auth/SignUpForm";
import { Helmet } from "react-helmet";
import { COMPANY_NAME } from "@/constants";

export default function SignUpPage() {
	return (
		<>
			<Helmet>
				<title>Create Account | {COMPANY_NAME}</title>
			</Helmet>
			<div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
				<div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex">
					<div className="absolute inset-0 bg-primary" />
					<div className="relative z-20 flex items-center text-lg font-medium">
						{COMPANY_NAME}
					</div>
					<div className="relative z-20 mt-auto">
						<blockquote className="space-y-2">
							<p className="text-lg">
								"This platform has made managing our staff scheduling so much
								easier. We've reduced time spent on scheduling by 70%."
							</p>
							<footer className="text-sm">Sofia Davis, Retail Manager</footer>
						</blockquote>
					</div>
				</div>
				<div className="lg:p-8">
					<div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
						<div className="flex flex-col space-y-2 text-center">
							<h1 className="text-2xl font-semibold tracking-tight">
								Create an account
							</h1>
							<p className="text-sm text-muted-foreground">
								Enter your details to create your account
							</p>
						</div>

						<SignUpForm />

						<p className="px-8 text-center text-sm text-muted-foreground">
							Already have an account?{" "}
							<a
								href="/login"
								className="underline underline-offset-4 hover:text-primary">
								Sign in
							</a>
						</p>
					</div>
				</div>
			</div>
		</>
	);
}
