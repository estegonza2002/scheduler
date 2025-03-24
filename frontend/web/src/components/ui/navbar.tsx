"use client";

import * as React from "react";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { cva } from "class-variance-authority";
import { Menu, ChevronDown } from "lucide-react";

import { cn } from "../../lib/utils";
import { Button } from "./button";

const navigationMenuTriggerStyle = cva(
	"group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
);

const NavigationMenu = React.forwardRef<
	React.ElementRef<typeof NavigationMenuPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root>
>(({ className, children, ...props }, ref) => (
	<NavigationMenuPrimitive.Root
		ref={ref}
		className={cn(
			"relative z-10 flex max-w-max flex-1 items-center justify-center",
			className
		)}
		{...props}>
		{children}
		<NavigationMenuViewport />
	</NavigationMenuPrimitive.Root>
));
NavigationMenu.displayName = NavigationMenuPrimitive.Root.displayName;

const NavigationMenuList = React.forwardRef<
	React.ElementRef<typeof NavigationMenuPrimitive.List>,
	React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List>
>(({ className, ...props }, ref) => (
	<NavigationMenuPrimitive.List
		ref={ref}
		className={cn(
			"group flex flex-1 list-none items-center justify-center space-x-1",
			className
		)}
		{...props}
	/>
));
NavigationMenuList.displayName = NavigationMenuPrimitive.List.displayName;

const NavigationMenuItem = NavigationMenuPrimitive.Item;

const NavigationMenuTrigger = React.forwardRef<
	React.ElementRef<typeof NavigationMenuPrimitive.Trigger>,
	React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
	<NavigationMenuPrimitive.Trigger
		ref={ref}
		className={cn(navigationMenuTriggerStyle(), "group", className)}
		{...props}>
		{children}{" "}
		<ChevronDown
			className="relative top-[1px] ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180"
			aria-hidden="true"
		/>
	</NavigationMenuPrimitive.Trigger>
));
NavigationMenuTrigger.displayName = NavigationMenuPrimitive.Trigger.displayName;

const NavigationMenuContent = React.forwardRef<
	React.ElementRef<typeof NavigationMenuPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
	<NavigationMenuPrimitive.Content
		ref={ref}
		className={cn(
			"left-0 top-0 w-full bg-popover data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 md:absolute md:w-auto",
			className
		)}
		{...props}
	/>
));
NavigationMenuContent.displayName = NavigationMenuPrimitive.Content.displayName;

const NavigationMenuLink = NavigationMenuPrimitive.Link;

const NavigationMenuViewport = React.forwardRef<
	React.ElementRef<typeof NavigationMenuPrimitive.Viewport>,
	React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Viewport>
>(({ className, ...props }, ref) => (
	<div className={cn("absolute left-0 top-full flex justify-center")}>
		<NavigationMenuPrimitive.Viewport
			className={cn(
				"origin-top-center relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 md:w-[var(--radix-navigation-menu-viewport-width)]",
				className
			)}
			ref={ref}
			{...props}
		/>
	</div>
));
NavigationMenuViewport.displayName =
	NavigationMenuPrimitive.Viewport.displayName;

const NavigationMenuIndicator = React.forwardRef<
	React.ElementRef<typeof NavigationMenuPrimitive.Indicator>,
	React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Indicator>
>(({ className, ...props }, ref) => (
	<NavigationMenuPrimitive.Indicator
		ref={ref}
		className={cn(
			"top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in",
			className
		)}
		{...props}>
		<div className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-border shadow-md" />
	</NavigationMenuPrimitive.Indicator>
));
NavigationMenuIndicator.displayName =
	NavigationMenuPrimitive.Indicator.displayName;

interface NavbarProps extends React.HTMLAttributes<HTMLElement> {
	items: {
		title: string;
		href: string;
		items?: {
			title: string;
			href: string;
			description?: string;
		}[];
	}[];
	logo?: React.ReactNode;
	actions?: React.ReactNode;
}

const Navbar = React.forwardRef<HTMLElement, NavbarProps>(
	({ className, items, logo, actions, ...props }, ref) => {
		const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

		return (
			<header
				ref={ref}
				className={cn(
					"sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
					className
				)}
				{...props}>
				<div className="container flex h-14 items-center">
					{logo && <div className="mr-4">{logo}</div>}

					{/* Desktop Navigation */}
					<NavigationMenu className="hidden md:flex">
						<NavigationMenuList>
							{items.map((item) => (
								<NavigationMenuItem key={item.title}>
									{item.items ? (
										<>
											<NavigationMenuTrigger>
												{item.title}
											</NavigationMenuTrigger>
											<NavigationMenuContent>
												<ul className="grid w-[400px] gap-1 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
													{item.items.map((subItem) => (
														<ListItem
															key={subItem.title}
															title={subItem.title}
															href={subItem.href}>
															{subItem.description}
														</ListItem>
													))}
												</ul>
											</NavigationMenuContent>
										</>
									) : (
										<NavigationMenuLink asChild>
											<a
												href={item.href}
												className={navigationMenuTriggerStyle()}>
												{item.title}
											</a>
										</NavigationMenuLink>
									)}
								</NavigationMenuItem>
							))}
						</NavigationMenuList>
					</NavigationMenu>

					{/* Mobile Navigation */}
					<div className="flex md:hidden">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
							<Menu className="h-5 w-5" />
							<span className="sr-only">Toggle menu</span>
						</Button>
					</div>

					{/* Actions */}
					{actions && <div className="ml-auto">{actions}</div>}
				</div>

				{/* Mobile Menu */}
				{isMobileMenuOpen && (
					<div className="md:hidden">
						<div className="space-y-1 px-2 pb-3 pt-2">
							{items.map((item) => (
								<div key={item.title}>
									{item.items ? (
										<>
											<div className="px-3 py-2 text-sm font-medium">
												{item.title}
											</div>
											<div className="space-y-1">
												{item.items.map((subItem) => (
													<a
														key={subItem.title}
														href={subItem.href}
														className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground">
														{subItem.title}
													</a>
												))}
											</div>
										</>
									) : (
										<a
											href={item.href}
											className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
											{item.title}
										</a>
									)}
								</div>
							))}
						</div>
					</div>
				)}
			</header>
		);
	}
);
Navbar.displayName = "Navbar";

const ListItem = React.forwardRef<
	React.ElementRef<"a">,
	React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
	return (
		<li>
			<NavigationMenuLink asChild>
				<a
					ref={ref}
					className={cn(
						"block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
						className
					)}
					{...props}>
					<div className="text-sm font-medium leading-none">{title}</div>
					{children && (
						<p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
							{children}
						</p>
					)}
				</a>
			</NavigationMenuLink>
		</li>
	);
});
ListItem.displayName = "ListItem";

export {
	NavigationMenu,
	NavigationMenuList,
	NavigationMenuItem,
	NavigationMenuContent,
	NavigationMenuTrigger,
	NavigationMenuLink,
	NavigationMenuIndicator,
	NavigationMenuViewport,
	Navbar,
	ListItem,
};
