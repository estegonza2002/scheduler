import { Outlet, Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuList,
	NavigationMenuContent,
	NavigationMenuTrigger,
	NavigationMenuLink,
} from "../ui/navigation-menu";
import {
	Menu,
	X,
	Calendar,
	FileCheck,
	Zap,
	ListChecks,
	Clock,
	BarChart2,
	Building2,
	CheckCircle2,
	Globe,
	Smartphone,
	Users,
} from "lucide-react";
import { useState } from "react";
import { RequestDemo } from "../marketing";
import { COMPANY_NAME, COMPANY_LEGAL_NAME } from "../../constants";
import { useAuth } from "../../lib/auth";

// Marketing navigation items (keep Home and Pricing as direct links)
const marketingLinks = [
	{ title: "Home", href: "/" },
	{ title: "Integrations", href: "/integrations" },
	{ title: "Pricing", href: "/pricing" },
];

// Features sub-menu items
const featureSubmenuItems = [
	{
		title: "Shift Scheduling Software",
		description:
			"Create and share your schedule in minutes, keeping your team updated on any changes.",
		href: "/features/shift-scheduling",
		icon: <Calendar className="h-5 w-5 text-primary" />,
	},
	{
		title: "Leave Management Software",
		description: "Manage time off and annual leave requests all in one place.",
		href: "/features/leave-management",
		icon: <FileCheck className="h-5 w-5 text-primary" />,
	},
	{
		title: "Auto Scheduling Software",
		description:
			"Save hours managing your team with our automatic rota schedule maker.",
		href: "/features/auto-scheduling",
		icon: <Zap className="h-5 w-5 text-primary" />,
	},
	{
		title: "Task Management Software",
		description:
			"Monitor, create and manage your teams one-off or recurring tasks in one place.",
		href: "/features/task-management",
		icon: <ListChecks className="h-5 w-5 text-primary" />,
	},
	{
		title: "Clock-In/Out Software",
		description:
			"Easy time tracking for precise payroll and effective workforce management.",
		href: "/features/clock-in-out",
		icon: <Clock className="h-5 w-5 text-primary" />,
	},
];

// Additional features
const additionalFeatures = [
	{
		title: "Mobile App",
		href: "/features/all",
		icon: <Smartphone className="h-5 w-5 text-primary" />,
	},
	{
		title: "Reports & Analytics",
		href: "/features/all",
		icon: <BarChart2 className="h-5 w-5 text-primary" />,
	},
];

// Primary footer links
const primaryFooterLinks = [
	{ title: "Enterprise", href: "/enterprise" },
	{ title: "About", href: "/about" },
];

// Secondary footer links
const secondaryFooterLinks = [
	{ title: "Resources", href: "/resources" },
	{ title: "Blog", href: "/blog" },
	{ title: "Integrations", href: "/integrations" },
	{ title: "Contact", href: "/contact" },
	{ title: "Developers", href: "/developers" },
];

// Legal links
const legalLinks = [
	{ title: "Terms", href: "/terms" },
	{ title: "Privacy", href: "/privacy" },
];

export default function MarketingLayout() {
	const location = useLocation();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const { user, signOut } = useAuth();

	// Determine the appropriate dashboard link based on user role
	const getDashboardLink = () => {
		if (!user) return "/login";

		// Check if user is an admin
		const isAdmin = user.user_metadata?.role === "admin";
		return isAdmin ? "/admin-dashboard" : "/dashboard";
	};

	const toggleMobileMenu = () => {
		setMobileMenuOpen(!mobileMenuOpen);
	};

	return (
		<div className="flex min-h-screen flex-col">
			<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
					<div className="flex items-center gap-8">
						<Link
							to="/"
							className="flex items-center gap-2 font-bold text-xl">
							{COMPANY_NAME}
						</Link>
						<NavigationMenu className="hidden md:flex">
							<NavigationMenuList>
								{marketingLinks.map((link) => (
									<NavigationMenuItem key={link.href}>
										<Link to={link.href}>
											<div
												className={cn(
													"group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
													location.pathname === link.href &&
														"bg-accent text-accent-foreground"
												)}>
												{link.title}
											</div>
										</Link>
									</NavigationMenuItem>
								))}

								{/* Features Dropdown Menu */}
								<NavigationMenuItem>
									<NavigationMenuTrigger
										className={cn(
											"group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
											location.pathname.includes("/features") &&
												"bg-accent text-accent-foreground"
										)}>
										Features
									</NavigationMenuTrigger>
									<NavigationMenuContent>
										<div className="w-[600px] p-4 md:grid md:grid-cols-2 gap-3">
											<div className="p-3 space-y-3">
												{featureSubmenuItems.map((item) => (
													<Link
														key={item.href}
														to={item.href}
														className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
														<div className="flex items-center gap-2">
															{item.icon}
															<div className="text-sm font-medium leading-none">
																{item.title}
															</div>
														</div>
														<p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
															{item.description}
														</p>
													</Link>
												))}
											</div>
											<div className="p-3 space-y-4">
												<div className="bg-muted rounded-lg p-3">
													<div className="text-sm font-medium mb-2">
														More Features
													</div>
													<div className="space-y-2">
														{additionalFeatures.map((item) => (
															<Link
																key={item.href}
																to={item.href}
																className="block select-none rounded-md p-2 text-sm leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
																<div className="flex items-center gap-2">
																	{item.icon}
																	<span>{item.title}</span>
																</div>
															</Link>
														))}
													</div>
												</div>
												<div>
													<Link
														to="/features/all"
														className="block select-none rounded-md p-2 text-sm font-medium leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
														View all features →
													</Link>
												</div>
											</div>
										</div>
									</NavigationMenuContent>
								</NavigationMenuItem>
							</NavigationMenuList>
						</NavigationMenu>
					</div>
					<div className="flex items-center gap-4">
						<div className="hidden md:flex gap-4">
							<RequestDemo>
								<Button variant="outline">Request Demo</Button>
							</RequestDemo>
							{user ? (
								<>
									<Button
										asChild
										variant="outline">
										<Link to={getDashboardLink()}>Dashboard</Link>
									</Button>
									<Button
										variant="outline"
										onClick={() => signOut()}>
										Log Out
									</Button>
								</>
							) : (
								<>
									<Button
										asChild
										variant="outline">
										<Link to="/login">Log In</Link>
									</Button>
									<Button asChild>
										<Link to="/pricing">Get Started</Link>
									</Button>
								</>
							)}
						</div>
						<button
							onClick={toggleMobileMenu}
							className="md:hidden"
							aria-label="Toggle mobile menu">
							{mobileMenuOpen ? (
								<X className="h-6 w-6" />
							) : (
								<Menu className="h-6 w-6" />
							)}
						</button>
					</div>
				</div>

				{/* Mobile menu */}
				{mobileMenuOpen && (
					<div className="md:hidden border-t bg-background">
						<nav className="container mx-auto py-4 px-4">
							<ul className="space-y-2">
								{marketingLinks.map((link) => (
									<li key={link.href}>
										<Link
											to={link.href}
											onClick={() => setMobileMenuOpen(false)}
											className={cn(
												"block py-2 px-3 rounded-md text-sm font-medium transition-colors",
												location.pathname === link.href
													? "bg-accent text-accent-foreground"
													: "hover:bg-accent/50"
											)}>
											{link.title}
										</Link>
									</li>
								))}
								{/* Mobile Features Menu */}
								<li>
									<div className="py-2 px-3 font-medium">Features</div>
									<ul className="pl-4 space-y-1 mt-1">
										{featureSubmenuItems.map((item) => (
											<li key={item.href}>
												<Link
													to={item.href}
													onClick={() => setMobileMenuOpen(false)}
													className="block py-2 px-3 rounded-md text-sm transition-colors hover:bg-accent/50">
													<div className="flex items-center gap-2">
														{item.icon}
														<span>{item.title}</span>
													</div>
												</Link>
											</li>
										))}
										<li className="pt-1">
											<Link
												to="/features/all"
												onClick={() => setMobileMenuOpen(false)}
												className="block py-2 px-3 rounded-md text-sm font-medium transition-colors hover:bg-accent/50">
												View all features
											</Link>
										</li>
									</ul>
								</li>
							</ul>

							<div className="mt-4 pt-4 border-t">
								<h3 className="text-sm font-medium mb-3">More Links</h3>
								<ul className="space-y-2">
									{secondaryFooterLinks.map((link) => (
										<li key={link.href}>
											<Link
												to={link.href}
												onClick={() => setMobileMenuOpen(false)}
												className="block py-2 px-3 rounded-md text-sm text-muted-foreground hover:text-foreground transition-colors">
												{link.title}
											</Link>
										</li>
									))}
								</ul>
							</div>

							<div className="flex flex-col gap-3 mt-6">
								{user ? (
									<>
										<Button
											asChild
											className="w-full">
											<Link
												to={getDashboardLink()}
												onClick={() => setMobileMenuOpen(false)}>
												Dashboard
											</Link>
										</Button>
										<Button
											variant="outline"
											className="w-full"
											onClick={() => {
												signOut();
												setMobileMenuOpen(false);
											}}>
											Log Out
										</Button>
									</>
								) : (
									<>
										<Button
											asChild
											className="w-full">
											<Link
												to="/pricing"
												onClick={() => setMobileMenuOpen(false)}>
												Get Started
											</Link>
										</Button>
										<RequestDemo>
											<Button
												variant="outline"
												className="w-full">
												Request Demo
											</Button>
										</RequestDemo>
										<Button
											asChild
											variant="outline"
											className="w-full">
											<Link
												to="/login"
												onClick={() => setMobileMenuOpen(false)}>
												Log In
											</Link>
										</Button>
									</>
								)}
							</div>
						</nav>
					</div>
				)}
			</header>

			<main className="flex-1">
				<Outlet />
			</main>

			<footer className="w-full border-t bg-muted/40 py-6">
				<div className="container mx-auto px-4">
					{/* Compact footer with all elements in one row */}
					<div className="flex flex-col sm:flex-row items-center justify-between gap-4">
						{/* Left side: Company name and links */}
						<div className="flex flex-wrap justify-center sm:justify-start gap-x-6 gap-y-2">
							{primaryFooterLinks.map((link) => (
								<Link
									key={link.href}
									to={link.href}
									className="text-xs text-muted-foreground hover:text-foreground transition-colors">
									{link.title}
								</Link>
							))}
							{secondaryFooterLinks.map((link) => (
								<Link
									key={link.href}
									to={link.href}
									className="text-xs text-muted-foreground hover:text-foreground transition-colors">
									{link.title}
								</Link>
							))}
							{legalLinks.map((link) => (
								<Link
									key={link.href}
									to={link.href}
									className="text-xs text-muted-foreground hover:text-foreground transition-colors">
									{link.title}
								</Link>
							))}
						</div>

						{/* Right side: Copyright */}
						<p className="text-xs text-muted-foreground text-center sm:text-right">
							© {new Date().getFullYear()} {COMPANY_LEGAL_NAME}
						</p>
					</div>
				</div>
			</footer>
		</div>
	);
}
