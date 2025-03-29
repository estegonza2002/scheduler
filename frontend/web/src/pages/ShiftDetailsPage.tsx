import { ShiftDetails } from "@/components/shift/ShiftDetails";
import { ContentContainer } from "@/components/ui/content-container";
import { useNavigate } from "react-router-dom";
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
			<ShiftDetails />
		</ContentContainer>
	);
}
