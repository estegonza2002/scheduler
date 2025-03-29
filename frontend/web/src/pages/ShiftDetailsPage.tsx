import { ShiftDetails } from "@/components/shift/ShiftDetails";
import { ContentContainer } from "@/components/ui/content-container";
import { PageHeader } from "@/components/ui/page-header";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ShiftDetailsPage() {
	const navigate = useNavigate();

	return (
		<>
			<div className="sticky top-0 flex h-16 shrink-0 items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 z-40">
				<div className="flex flex-1 items-center">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => navigate(-1)}
						className="h-8 w-8 mr-2"
						title="Go back">
						<ChevronLeft className="h-5 w-5" />
					</Button>
					<div className="mx-2">
						<h1 className="text-lg font-semibold">Shift Details</h1>
						<p className="text-xs text-muted-foreground">
							View and manage shift information, assigned employees, and tasks
						</p>
					</div>
				</div>
			</div>
			<ContentContainer>
				<ShiftDetails />
			</ContentContainer>
		</>
	);
}
