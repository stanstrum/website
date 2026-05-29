<script>
	import { m } from "$lib/paraglide/messages";
</script>

<svelte:head>
	<title>Stan Strum</title>
	<meta
		name="description"
		content="Personal website and portfolio."
	/>
</svelte:head>

<div class="flex justify-center px-6 py-24">
	<div class="w-full max-w-3xl">
		<h1 class="mb-6 text-6xl font-bold tracking-tight text-white">
			{m["pages.main.header"]()}
		</h1>

		<p class="text-lg leading-8 text-slate-300">
			{m["pages.main.body"]()}
		</p>
	</div>
</div>
