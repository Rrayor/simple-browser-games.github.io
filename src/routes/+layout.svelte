<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Simple Browser Games</title>
</svelte:head>

<div class="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-indigo-500/30">
	<nav class="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-neutral-950/80 backdrop-blur-md">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="flex h-16 items-center justify-between">
				<div class="flex items-center gap-8">
					<a href="/" class="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
						Simple Browser Games
					</a>
					<div class="hidden md:flex items-center gap-6">
						<a href="/" class="text-sm font-medium text-neutral-400 hover:text-white transition-colors">Home</a>
						<!-- Future links can go here -->
					</div>
				</div>
				<div>
					<a href="https://github.com/bsimon/simple-browser-games.github.io" target="_blank" rel="noreferrer" class="text-neutral-400 hover:text-white transition-colors">
						GitHub
					</a>
				</div>
			</div>
		</div>
	</nav>

	<main class="pt-24 pb-12 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
		{@render children()}
	</main>
</div>
