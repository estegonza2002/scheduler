import React from "react";
import { cn } from "../../lib/utils";
import { Input } from "./input";
import { Search, X } from "lucide-react";
import { Button } from "./button";

interface SearchInputProps
	extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
	/**
	 * The current search term
	 */
	value: string;
	/**
	 * Callback function when search term changes
	 */
	onChange: (value: string) => void;
	/**
	 * Optional additional className for the container
	 */
	className?: string;
	/**
	 * Optional additional className for the input
	 */
	inputClassName?: string;
	/**
	 * Optional placeholder text
	 * @default "Search..."
	 */
	placeholder?: string;
	/**
	 * Whether to show the clear button when there is input
	 * @default true
	 */
	showClear?: boolean;
	/**
	 * Callback function when pressing Enter
	 */
	onSearch?: () => void;
}

/**
 * SearchInput component for consistent search functionality
 */
export function SearchInput({
	value,
	onChange,
	className,
	inputClassName,
	placeholder = "Search...",
	showClear = true,
	onSearch,
	...props
}: SearchInputProps) {
	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && onSearch) {
			onSearch();
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		onChange(e.target.value);
	};

	return (
		<div className={cn("relative", className)}>
			<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
				<Search className="h-4 w-4 text-muted-foreground" />
			</div>
			<Input
				type="text"
				className={cn("pl-10 pr-10", inputClassName)}
				placeholder={placeholder}
				value={value}
				onChange={handleChange}
				onKeyDown={handleKeyDown}
				{...props}
			/>
			{showClear && value && (
				<Button
					variant="ghost"
					size="icon"
					type="button"
					className="absolute inset-y-0 right-0 flex items-center pr-3"
					onClick={() => onChange("")}>
					<X className="h-4 w-4 text-muted-foreground" />
					<span className="sr-only">Clear search</span>
				</Button>
			)}
		</div>
	);
}
