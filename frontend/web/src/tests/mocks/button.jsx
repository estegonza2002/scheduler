import React from "react";

export const Button = ({
	children,
	variant = "default",
	size = "default",
	asChild = false,
	className = "",
	disabled = false,
	...props
}) => {
	const baseClass =
		"inline-flex items-center justify-center rounded-md font-medium";

	const getVariantClass = () => {
		switch (variant) {
			case "destructive":
				return "bg-red-500 text-white hover:bg-red-600";
			case "outline":
				return "border border-input bg-background hover:bg-accent hover:text-accent-foreground";
			case "secondary":
				return "bg-secondary text-secondary-foreground hover:bg-secondary/80";
			case "ghost":
				return "hover:bg-accent hover:text-accent-foreground";
			case "link":
				return "text-primary underline-offset-4 hover:underline";
			default:
				return "bg-primary text-primary-foreground hover:bg-primary/90";
		}
	};

	const getSizeClass = () => {
		switch (size) {
			case "sm":
				return "h-9 px-3 text-xs";
			case "lg":
				return "h-11 px-8 text-base";
			case "icon":
				return "h-10 w-10";
			default:
				return "h-10 px-4 py-2 text-sm";
		}
	};

	const classNames = [
		baseClass,
		getVariantClass(),
		getSizeClass(),
		disabled ? "opacity-50 cursor-not-allowed" : "",
		className,
	]
		.filter(Boolean)
		.join(" ");

	return (
		<button
			className={classNames}
			disabled={disabled}
			{...props}>
			{children}
		</button>
	);
};
