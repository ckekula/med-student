import { auth } from "@clerk/nextjs/server";

export default async function LongCaseAttemptsPage() {
	await auth.protect();

	return (
			<section className="flex min-h-full w-full flex-col gap-8 rounded-tl-2xl border border-neutral-200 bg-white p-6 md:p-10 dark:border-neutral-700 dark:bg-neutral-900">
				<div>
					<p className="text-sm font-medium text-neutral-500">OSCE</p>
					<h1 className="mt-1 text-3xl font-semibold text-neutral-900 dark:text-white">Long Case Attempts</h1>
				</div>
				<div className="rounded-lg border border-dashed border-neutral-300 p-8 text-sm text-neutral-500 dark:border-neutral-700">
					No long case attempts have been recorded yet.
				</div>
			</section>
	);
}
