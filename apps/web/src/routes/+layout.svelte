<script lang="ts">
	import type { Pathname } from '$app/types';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	import Navbar from "./Navbar.svelte";

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<!-- to force-generate the 404 route -->
<link href="/404" />

<div class="flex min-h-screen flex-col">
	<nav>
		<Navbar />
	</nav>

	<main
		class="flex-1 bg-linear-to-b from-slate-900 via-slate-950 to-black text-white"
	>
		{@render children()}
	</main>
</div>

<div style="display:none">
	{#each locales as locale (locale)}
		<a
			href={resolve(localizeHref(page.url.pathname, { locale }) as Pathname)}
		>{locale}</a>
	{/each}
</div>
