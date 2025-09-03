import { Skeleton } from "@/shared/components/ui/skeleton";

interface GroupListSkeletonProps {
	count?: number;
}

export function GroupListSkeleton({ count = 3 }: GroupListSkeletonProps) {
	return (
		<div className="space-y-4 overflow-y-auto max-h-full">
			{Array.from({ length: count }).map((_, index) => (
				<div key={index} className="block group">
					<div className="relative">
						<div className="relative flex items-center space-x-4 p-4 rounded-2xl border bg-card/50 backdrop-blur-sm">
							{/* Avatar skeleton */}
							<div className="w-14 h-14 rounded-xl flex-shrink-0">
								<Skeleton className="w-full h-full rounded-xl" />
							</div>

							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-2 mb-1">
									{/* Group name skeleton */}
									<Skeleton className="h-5 w-32" />
									{/* Badge skeleton */}
									<Skeleton className="h-5 w-16 rounded-full" />
								</div>
								{/* Group code skeleton */}
								<Skeleton className="h-4 w-24" />
							</div>

							{/* Indicator skeleton */}
							<Skeleton className="w-2 h-2 rounded-full" />
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
