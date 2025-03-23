import { ShiftDetails } from "../components/shift/ShiftDetails";
import { Card, CardContent } from "../components/ui/card";

export default function ShiftDetailsPage() {
	return (
		<Card className="w-full h-full">
			<CardContent className="p-6">
				<ShiftDetails />
			</CardContent>
		</Card>
	);
}
