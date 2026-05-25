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

<div class="flex min-h-screen flex-col">
	<nav>
		<Navbar />
	</nav>

	<main
		class="flex-1 bg-linear-to-b from-slate-900 via-slate-950 to-black text-white"
	>
		<section class="mx-auto flex min-h-full max-w-5xl items-center px-6 py-24">
			{@render children()}
		</section>
	</main>
</div>

<div style="display:none">
	{#each locales as locale (locale)}
		<a
			href={resolve(localizeHref(page.url.pathname, { locale }) as Pathname)}
		>{locale}</a>
	{/each}
</div>
