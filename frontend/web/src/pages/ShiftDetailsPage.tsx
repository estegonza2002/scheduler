import { ShiftDetails } from "@/components/shift/ShiftDetails";
import { ContentContainer } from "@/components/ui/content-container";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHeader } from "@/lib/header-context";
import { useEffect } from "react";

export default function ShiftDetailsPage() {
	const navigate = useNavigate();
	const { updateHeader } = useHeader();

	useEffect(() => {
		updateHeader({
			title: "Shift Details",
			description:
				"View and manage shift information, assigned employees, and tasks",
			showBackButton: true,
		});
	}, [updateHeader]);

	return (
		<ContentContainer>
			<div className="mb-4">
				<Button
					variant="ghost"
					size="sm"
					onClick={() => navigate(-1)}
					className="flex items-center text-muted-foreground hover:text-foreground">
					<ChevronLeft className="h-4 w-4 mr-1" />
					Back
				</Button>
			</div>
			<ShiftDetails />
		</ContentContainer>
	);
}
