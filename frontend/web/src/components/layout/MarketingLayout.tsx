import { Outlet, Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
} from "../ui/navigation-menu";
import {
	Menu,
	X,
	Facebook,
	Twitter,
	Linkedin,
	Instagram,
	Github,
	Mail,
} from "lucide-react";
import { useState } from "react";
import { RequestDemo } from "../marketing";
import { COMPANY_NAME, COMPANY_LEGAL_NAME } from "../../constants";

// Marketing navigation items - removed Enterprise, Resources, Blog, and Contact
const marketingLinks = [
	{ title: "Home", href: "/" },
	{ title: "Features", href: "/features" },
	{ title: "Pricing", href: "/pricing" },
];

// Primary footer links
const primaryFooterLinks = [
	{ title: "Features", href: "/features" },
	{ title: "Pricing", href: "/pricing" },
	{ title: "Enterprise", href: "/enterprise" },
	{ title: "About", href: "/about" },
];

// Secondary footer links
const secondaryFooterLinks = [
	{ title: "Resources", href: "/resources" },
	{ title: "Blog", href: "/blog" },
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
							</NavigationMenuList>
						</NavigationMenu>
					</div>
					<div className="flex items-center gap-4">
						<div className="hidden md:flex gap-4">
							<RequestDemo>
								<Button variant="outline">Request Demo</Button>
							</RequestDemo>
							<Button
								asChild
								variant="outline">
								<Link to="/login">Log In</Link>
							</Button>
							<Button asChild>
								<Link to="/pricing">Get Started</Link>
							</Button>
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
							<ul className="space-y-4">
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
							</div>
						</nav>
					</div>
				)}
			</header>

			<main className="flex-1">
				<Outlet />
			</main>

			<footer className="w-full border-t bg-muted/40 py-12">
				<div className="container mx-auto px-4">
					<div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
						{/* Company info column */}
						<div className="md:col-span-1">
							<Link
								to="/"
								className="flex items-center gap-2 font-bold text-xl mb-4">
								{COMPANY_NAME}
							</Link>
							<p className="text-muted-foreground text-sm mb-6">
								Simplify team scheduling with our intuitive platform. Plan
								shifts, manage time off, and optimize your workforce.
							</p>
							<div className="flex space-x-3 mb-6">
								<Link
									to="#"
									className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
									aria-label="Facebook">
									<Facebook className="h-4 w-4" />
								</Link>
								<Link
									to="#"
									className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
									aria-label="Twitter">
									<Twitter className="h-4 w-4" />
								</Link>
								<Link
									to="#"
									className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
									aria-label="LinkedIn">
									<Linkedin className="h-4 w-4" />
								</Link>
								<Link
									to="#"
									className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
									aria-label="Instagram">
									<Instagram className="h-4 w-4" />
								</Link>
							</div>
						</div>

						{/* Links columns */}
						<div className="md:col-span-2 grid grid-cols-2 gap-8">
							{/* Primary Links */}
							<div>
								<h3 className="font-medium text-base mb-4">Product</h3>
								<ul className="space-y-3">
									{primaryFooterLinks.map((link) => (
										<li key={link.href}>
											<Link
												to={link.href}
												className="text-sm text-muted-foreground hover:text-foreground transition-colors">
												{link.title}
											</Link>
										</li>
									))}
								</ul>
							</div>

							{/* Secondary Links */}
							<div>
								<h3 className="font-medium text-base mb-4">Resources</h3>
								<ul className="space-y-3">
									{secondaryFooterLinks.map((link) => (
										<li key={link.href}>
											<Link
												to={link.href}
												className="text-sm text-muted-foreground hover:text-foreground transition-colors">
												{link.title}
											</Link>
										</li>
									))}
								</ul>
							</div>
						</div>

						{/* Newsletter column */}
						<div className="md:col-span-1">
							<h3 className="font-medium text-base mb-4">Stay Updated</h3>
							<div className="mb-6">
								<p className="text-sm text-muted-foreground mb-3">
									Get our latest features and news directly to your inbox.
								</p>
								<div className="flex gap-2">
									<div className="relative flex-1">
										<Mail className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
										<Input
											type="email"
											placeholder="Enter your email"
											className="pl-8 h-9 text-sm"
										/>
									</div>
									<Button size="sm">Subscribe</Button>
								</div>
							</div>

							<div className="mb-6">
								<RequestDemo>
									<Button
										variant="outline"
										size="sm"
										className="w-full">
										Request Demo
									</Button>
								</RequestDemo>
							</div>
						</div>
					</div>

					{/* Bottom bar with copyright and legal links */}
					<div className="border-t border-border/40 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center max-w-6xl mx-auto">
						<p className="text-sm text-muted-foreground order-2 md:order-1 mt-4 md:mt-0">
							© {new Date().getFullYear()} {COMPANY_LEGAL_NAME}. All rights
							reserved.
						</p>
						<div className="flex gap-6 order-1 md:order-2">
							{legalLinks.map((link) => (
								<Link
									key={link.href}
									to={link.href}
									className="text-sm text-muted-foreground hover:text-foreground transition-colors">
									{link.title}
								</Link>
							))}
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
}
