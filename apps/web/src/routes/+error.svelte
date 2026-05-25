<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>404 — Page Not Found</title>
</svelte:head>

<div
	class="flex min-h-full items-center justify-center px-6 py-24 text-white"
>
	<div class="max-w-xl text-center">
		<div
			class="mb-6 text-sm font-medium uppercase tracking-[0.2em] text-blue-400"
		>
			Error 404
		</div>

		<h1
			class="mb-6 text-5xl font-bold tracking-tight md:text-7xl"
		>
			Page not found.
		</h1>

		<p class="mb-10 text-lg leading-8 text-slate-300">
			The page you’re looking for doesn’t exist,
			was moved, or is still being built.
		</p>

		<div class="flex justify-center gap-4">
			<a
				href="/"
				class="rounded-xl bg-blue-500 px-6 py-3 font-medium text-white transition hover:bg-blue-400"
			>
				Go Home
			</a>

			<a
				href="/blog"
				class="rounded-xl border border-slate-700 bg-slate-800/50 px-6 py-3 font-medium text-slate-200 transition hover:bg-slate-700"
			>
				Read Blog
			</a>
		</div>
	</div>
</div>
