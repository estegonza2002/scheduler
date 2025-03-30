import { ShiftDetails } from "@/components/shift/ShiftDetails";
import { ContentContainer } from "@/components/ui/content-container";
import { useNavigate, useParams } from "react-router-dom";
import { useHeader } from "@/lib/header-context";
import { useEffect } from "react";

export default function ShiftDetailsPage() {
	const navigate = useNavigate();
	const { shiftId } = useParams<{ shiftId: string }>();
	const { updateHeader } = useHeader();

	// Do not include a default title/description here
	// We'll let the ShiftDetails component update the header with shift-specific info
	useEffect(() => {
		updateHeader({
			title: "Loading...",
			description: "Please wait while we load shift information",
			showBackButton: true,
		});
	}, [updateHeader]);

	return (
		<ContentContainer>
			<ShiftDetails hideHeader={true} />
		</ContentContainer>
	);
}
