<script lang="ts">
	import { m } from "$lib/paraglide/messages";

	const status = 404;
</script>

<svelte:head>
	<title>{status} — </title>
</svelte:head>

<div
	class="flex min-h-full items-center justify-center px-6 py-24 text-white"
>
	<div class="max-w-xl text-center">
		<div
			class="mb-6 text-sm font-medium uppercase tracking-[0.2em] text-blue-400"
		>
			{m['pages.404.error']({ status })}
		</div>

		<h1
			class="mb-6 text-5xl font-bold tracking-tight md:text-7xl"
		>
			{m["pages.404.header"]()}
		</h1>

		<p class="mb-10 text-lg leading-8 text-slate-300">
			{m["pages.404.body"]()}
		</p>

		<div class="flex justify-center gap-4">
			<a
				href="/"
				class="rounded-xl bg-blue-500 px-6 py-3 font-medium text-white transition hover:bg-blue-400"
			>
				{m['pages.404.go_home']()}
			</a>

			<!-- <a
				href="/blog"
				class="rounded-xl border border-slate-700 bg-slate-800/50 px-6 py-3 font-medium text-slate-200 transition hover:bg-slate-700"
			>
				Read Blog
			</a> -->
		</div>
	</div>
</div>
