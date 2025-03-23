import { useState, useRef } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Bold, Italic, List, ListOrdered, Info } from "lucide-react";
import { formatSelectedText } from "../../utils/text-formatting";
import { ScrollArea } from "../ui/scroll-area";

interface ShiftNotesDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	notes: string;
	onSave: (notes: string) => void;
}

export function ShiftNotesDialog({
	open,
	onOpenChange,
	notes,
	onSave,
}: ShiftNotesDialogProps) {
	const [editNotes, setEditNotes] = useState("");
	const [saving, setSaving] = useState(false);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	// Update local notes when dialog opens
	const onDialogOpenChange = (open: boolean) => {
		if (open) {
			setEditNotes(notes || "");
		}
		onOpenChange(open);
	};

	// Handle format text
	const handleFormatText = (
		formatType: "bold" | "italic" | "list" | "ordered-list"
	) => {
		if (!textareaRef.current) return;

		const result = formatSelectedText(textareaRef.current, formatType);
		if (result) {
			setEditNotes(result.value);

			// Wait for the state to update before setting selection
			setTimeout(() => {
				if (textareaRef.current) {
					textareaRef.current.focus();
					textareaRef.current.setSelectionRange(
						result.selectionStart,
						result.selectionEnd
					);
				}
			}, 0);
		}
	};

	// Handle save notes
	const handleSaveNotes = () => {
		setSaving(true);
		onSave(editNotes);
		setSaving(false);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={onDialogOpenChange}>
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>Edit Shift Notes</DialogTitle>
					<DialogDescription>
						Add or edit notes for this shift. Use the formatting toolbar to
						style your text.
					</DialogDescription>
				</DialogHeader>

				<div className="py-4">
					<div className="flex items-center gap-1 px-1 py-2 mb-2 bg-muted/50 rounded-md">
						<div className="flex items-center gap-1">
							<Button
								type="button"
								variant="ghost"
								size="icon"
								className="h-8 w-8"
								onClick={() => handleFormatText("bold")}
								title="Bold">
								<Bold className="h-4 w-4" />
							</Button>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								className="h-8 w-8"
								onClick={() => handleFormatText("italic")}
								title="Italic">
								<Italic className="h-4 w-4" />
							</Button>
							<span className="mx-1 h-5 w-px bg-muted-foreground/30"></span>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								className="h-8 w-8"
								onClick={() => handleFormatText("list")}
								title="Bullet List">
								<List className="h-4 w-4" />
							</Button>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								className="h-8 w-8"
								onClick={() => handleFormatText("ordered-list")}
								title="Numbered List">
								<ListOrdered className="h-4 w-4" />
							</Button>
						</div>
						<div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
							<Info className="h-3.5 w-3.5" />
							<span>Use **text** for bold, *text* for italic</span>
						</div>
					</div>

					<ScrollArea className="h-[280px] rounded-md border">
						<Textarea
							ref={textareaRef}
							placeholder="Add notes about this shift..."
							value={editNotes}
							onChange={(e) => setEditNotes(e.target.value)}
							className="min-h-[280px] border-0 resize-none focus-visible:ring-0 rounded-none p-3"
						/>
					</ScrollArea>

					<div className="mt-3 flex flex-col gap-2">
						<div className="text-xs text-muted-foreground">
							<p className="mb-1">
								Tip: You can use special keywords for important information:
							</p>
							<ul className="list-disc pl-4 space-y-1">
								<li>
									<span className="font-semibold">VIP</span> - Highlights VIP
									information
								</li>
								<li>
									<span className="font-semibold">Training</span> - Indicates
									training requirements
								</li>
								<li>
									<span className="font-semibold">Meeting</span> - Highlights
									meeting information
								</li>
								<li>
									<span className="font-semibold">Inspection</span> - Notes
									about inspections
								</li>
							</ul>
						</div>
					</div>
				</div>

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button
						type="button"
						onClick={handleSaveNotes}
						disabled={saving}>
						{saving && (
							<div className="mr-2 animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
						)}
						Save Notes
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
