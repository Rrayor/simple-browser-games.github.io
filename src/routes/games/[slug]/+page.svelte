<script lang="ts">
    import { page as pageStore } from "$app/stores";
    import { onDestroy } from "svelte";
    import { type Game } from "$lib/types/game";
    import { games } from "$lib/games/registry";
    import NoiseBackground from "$lib/components/NoiseBackground.svelte";

    let container: HTMLElement;
    let currentGame: Game | null = null;
    let error: string | null = $state(null);

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

    const modules = import.meta.glob("$lib/games/*/index.ts");

    async function loadGame(gameSlug: string) {
        try {
            const match = Object.keys(modules).find((path) =>
                path.includes(`/games/${gameSlug}/index.ts`),
            );

            if (!match) {
                throw new Error(`Game module not found for: ${gameSlug}`);
            }

            if (!container) return;

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

<NoiseBackground />

<div class="w-full max-w-6xl mx-auto py-8 px-4 relative">
    <div
        class="mb-10 flex flex-col md:flex-row items-baseline justify-between border-b-4 border-neutral-900 pb-2 bg-[#f4f1ea] px-4 shadow-sm rotate-[-0.5deg]"
    >
        <div class="flex items-baseline gap-4">
            <a
                href="/"
                class="font-share text-xs font-bold text-neutral-700 hover:text-[#f0f] transition-colors uppercase tracking-widest"
            >
                &larr; Return to The Daily Glitch
            </a>
            {#if meta}
                <h1
                    class="font-russo text-3xl md:text-5xl text-neutral-900 uppercase tracking-tighter"
                >
                    {meta.title}
                </h1>
            {/if}
        </div>

        <div
            class="font-share text-xs text-neutral-800 mt-2 md:mt-0 italic font-bold"
        >
            SECTION: VIBE-EXPERIMENTS // CLASSIFIED #{(
                Math.random() * 10000
            ).toFixed(0)}
        </div>
    </div>

    <div
        class="relative w-full aspect-video bg-black shadow-[15px_15px_0px_#000] border-4 border-neutral-900 overflow-hidden"
    >
        {#if error}
            <div
                class="absolute inset-0 flex items-center justify-center text-red-500 bg-black font-share text-xl p-10 text-center"
            >
                <p>
                    ERROR: {error}<br /><span class="text-sm mt-4 block"
                        >Please refresh or contact the void.</span
                    >
                </p>
            </div>
        {/if}

        <div bind:this={container} class="w-full h-full"></div>
    </div>

    {#if meta}
        <div class="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div
                class="md:col-span-2 bg-[#f4f1ea] p-6 border-2 border-neutral-900 shadow-[5px_5px_0px_#000] rotate-[0.2deg]"
            >
                <h2
                    class="font-orbitron font-bold text-lg border-b-2 border-black mb-3 pb-1 uppercase text-black"
                >
                    About this Experiment
                </h2>
                <div
                    class="font-merriweather text-sm leading-relaxed text-justify text-neutral-900"
                >
                    <p>{meta.description}</p>
                </div>
            </div>

            <div
                class="bg-yellow-100 p-4 border-2 border-neutral-900 shadow-[5px_5px_0px_#000] rotate-[-1deg] h-fit"
            >
                <h2
                    class="font-russo text-center text-red-800 border-b border-black/30 mb-2 uppercase"
                >
                    ADVERTISEMENT
                </h2>
                <p
                    class="font-share text-[0.65rem] text-center leading-tight text-neutral-900 font-bold"
                >
                    TIRED OF REALITY?<br />
                    <span class="text-lg font-bold">JUMP INTO THE VOID!</span
                    ><br />
                    NO SUBSRIPTION REQUIRED.<br />
                    AI CERTIFIED SLOP.
                </p>
            </div>
        </div>
    {/if}

    <!-- Footer / Bottom Bar -->
    <div
        class="mt-16 border-t border-neutral-300 pt-4 flex justify-between font-share text-[0.6rem] text-neutral-400 uppercase tracking-widest"
    >
        <span>EST. 2026 // SIMPLE BROWSER GAMES</span>
        <span>SCANLINE V3.0 // VIBE-OS ACTIVATED</span>
    </div>
</div>
