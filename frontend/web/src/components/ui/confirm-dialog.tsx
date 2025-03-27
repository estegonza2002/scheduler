import React from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "./alert-dialog";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
	/**
	 * The title of the confirmation dialog
	 */
	title: string;
	/**
	 * The description text explaining what the user is confirming
	 */
	description: string;
	/**
	 * Callback function to execute when the action is confirmed
	 */
	onConfirm: () => void;
	/**
	 * Optional callback function when the dialog is canceled
	 */
	onCancel?: () => void;
	/**
	 * The trigger element that opens the dialog when clicked
	 */
	trigger: React.ReactNode;
	/**
	 * Optional label for the confirm button
	 * @default "Confirm"
	 */
	confirmLabel?: string;
	/**
	 * Optional label for the cancel button
	 * @default "Cancel"
	 */
	cancelLabel?: string;
	/**
	 * Optional variant for the confirm button
	 * @default "destructive" for dangerous actions
	 */
	confirmVariant?:
		| "default"
		| "destructive"
		| "outline"
		| "secondary"
		| "ghost"
		| "link";
	/**
	 * Whether the action is dangerous and should use destructive styling
	 * @default true
	 */
	destructive?: boolean;
	/**
	 * Whether the dialog is currently open
	 */
	open?: boolean;
	/**
	 * Callback when the open state changes
	 */
	onOpenChange?: (open: boolean) => void;
}

/**
 * ConfirmDialog component for confirming destructive actions
 */
export function ConfirmDialog({
	title,
	description,
	onConfirm,
	onCancel,
	trigger,
	confirmLabel = "Confirm",
	cancelLabel = "Cancel",
	confirmVariant,
	destructive = true,
	open,
	onOpenChange,
}: ConfirmDialogProps) {
	// Default the confirm variant to destructive if the action is destructive
	const defaultVariant = destructive ? "destructive" : "default";
	const variant = confirmVariant || defaultVariant;

	const handleConfirm = () => {
		onConfirm();
	};

	const handleCancel = () => {
		onCancel?.();
	};

	return (
		<AlertDialog
			open={open}
			onOpenChange={onOpenChange}>
			<AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					<AlertDialogDescription>{description}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel
						onClick={handleCancel}
						className={cn("mt-0")}>
						{cancelLabel}
					</AlertDialogCancel>
					<AlertDialogAction asChild>
						<Button
							variant={variant}
							onClick={handleConfirm}>
							{confirmLabel}
						</Button>
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
