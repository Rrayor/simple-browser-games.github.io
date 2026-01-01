<script lang="ts">
    import { page } from "$app/state"; // Svelte 5 state
    import { onMount, onDestroy } from "svelte";
    import { type Game } from "$lib/types/game";
    import { games } from "$lib/games/registry";

    // In Svelte 5 with $app/state, page is reactive.
    // However, page store is usually imported from '$app/stores' in SvelteKit 1/2.
    // SvelteKit 2+ still uses '$app/stores'.
    import { page as pageStore } from "$app/stores";

    let container: HTMLElement;
    let currentGame: Game | null = null;
    let error: string | null = $state(null);

    // We need to react to slug changes.
    // We can use a derived store or $effect.

    let slug = $derived($pageStore.params.slug);
    let meta = $derived(games.find((g) => g.slug === slug));

    $effect(() => {
        // Cleanup previous game
        if (currentGame) {
            currentGame.destroy();
            currentGame = null;
            if (container) container.innerHTML = "";
        }

        // Load new game
        error = null;
        if (!slug) return;

        loadGame(slug);
    });

    // Use import.meta.glob to load all game modules eagerly or lazily.
    // We use keys to find the matching module.
    const modules = import.meta.glob("$lib/games/*/index.ts");

    async function loadGame(gameSlug: string) {
        try {
            // Construct key expected by glob
            // $lib alias might not work in glob keys directly depending on setup, usually it's relative or absolute-ish.
            // glob keys are relative to the file or root.
            // Let's check keys: they usually look like '/src/lib/games/flappy-balloon/index.ts'

            // We can iterate to find the partial match.
            console.log("Available modules:", Object.keys(modules));
            const match = Object.keys(modules).find((path) => {
                const isMatch = path.includes(`/games/${gameSlug}/index.ts`);
                console.log(
                    `Checking "${path}" against "/games/${gameSlug}/index.ts": ${isMatch}`,
                );
                return isMatch;
            });

            if (!match) {
                throw new Error(`Game module not found for: ${gameSlug}`);
            }

            if (!container) return; // Unmounted during load

            const loader = modules[match];
            const module: any = await loader();

            if (
                module &&
                typeof module.mount === "function" &&
                typeof module.destroy === "function"
            ) {
                const { mount, destroy } = module;
                currentGame = { mount, destroy };
                await currentGame.mount(container);
            } else {
                throw new Error(
                    "Invalid game module format: missing mount/destroy",
                );
            }
        } catch (e: any) {
            console.error(e);
            error = `Failed to load game: ${e.message}`;
        }
    }

    onDestroy(() => {
        if (currentGame) {
            currentGame.destroy();
        }
    });
</script>

<div class="w-full max-w-6xl mx-auto py-8">
    <div class="mb-6 flex items-center justify-between">
        <a
            href="/games"
            class="flex items-center text-sm font-medium text-neutral-400 hover:text-white transition-colors"
        >
            <span aria-hidden="true" class="mr-2">&larr;</span> Back to Gallery
        </a>
        {#if meta}
            <h1 class="text-2xl font-bold text-white">{meta.title}</h1>
        {/if}
    </div>

    <div
        class="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10 ring-1 ring-white/5"
    >
        {#if error}
            <div
                class="absolute inset-0 flex items-center justify-center text-red-400 bg-red-950/20"
            >
                <p>{error}</p>
            </div>
        {/if}

        <div bind:this={container} class="w-full h-full"></div>
    </div>

    {#if meta}
        <div class="mt-8 prose prose-invert max-w-none">
            <p>{meta.description}</p>
        </div>
    {/if}
</div>
