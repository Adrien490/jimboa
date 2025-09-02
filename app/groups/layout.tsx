import { BackgroundElements } from "@/shared/components/background-elements";

export default function GroupsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			<BackgroundElements />
			{children}
		</>
	);
}
