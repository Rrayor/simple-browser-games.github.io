<script lang="ts">
	import favicon from "$lib/assets/favicon.svg";
	import "../app.css";

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Simple Browser Games</title>
</svelte:head>

<div
	class="min-h-screen bg-[#0a0a0a] text-stone-300 font-merriweather selection:bg-[#f0f]/30"
>
	<main class="mx-auto max-w-7xl">
		{@render children()}
	</main>
</div>
