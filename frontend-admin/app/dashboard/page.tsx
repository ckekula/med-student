import { auth } from "@clerk/nextjs/server";

export default async function DashboardPage() {
	await auth.protect();

	return (
			<section className="flex min-h-full w-full flex-col gap-8 rounded-tl-2xl border border-neutral-200 bg-white p-6 md:p-10 dark:border-neutral-700 dark:bg-neutral-900">
				<div>
					<p className="text-sm font-medium text-neutral-500">Overview</p>
					<h1 className="mt-1 text-3xl font-semibold text-neutral-900 dark:text-white">Dashboard</h1>
				</div>
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{["Long cases", "Active attempts", "Completed attempts", "Learners"].map((label) => (
						<div key={label} className="rounded-lg border border-neutral-200 p-5 dark:border-neutral-700">
							<p className="text-sm text-neutral-500">{label}</p>
							<p className="mt-3 text-3xl font-semibold text-neutral-900 dark:text-white">0</p>
						</div>
					))}
				</div>
			</section>
	);
}
