import { useState } from "react";
import { Location } from "@/api";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BulkLocationImport } from "./BulkLocationImport";

interface BulkLocationImportDialogProps {
	/**
	 * The organization ID to create locations in
	 */
	organizationId: string;
	/**
	 * Controls whether the dialog is open
	 */
	open?: boolean;
	/**
	 * Callback fired when the open state changes
	 */
	onOpenChange?: (open: boolean) => void;
	/**
	 * Callback fired when locations are created
	 */
	onLocationsCreated?: (locations: Location[]) => void;
}

/**
 * Dialog component for bulk importing locations
 */
export function BulkLocationImportDialog({
	organizationId,
	open,
	onOpenChange,
	onLocationsCreated,
}: BulkLocationImportDialogProps) {
	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}>
			<DialogContent className="max-w-3xl max-h-[85vh]">
				<DialogHeader>
					<DialogTitle>Bulk Import Locations</DialogTitle>
				</DialogHeader>
				<ScrollArea className="h-[calc(100vh-200px)]">
					<div className="p-1">
						<BulkLocationImport
							organizationId={organizationId}
							onLocationsCreated={onLocationsCreated}
							onCancel={() => onOpenChange?.(false)}
						/>
					</div>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
}
