<script lang="ts">
    import { games } from "$lib/games/registry";
</script>

<div class="py-12">
    <div class="mb-12 text-center">
        <h1
            class="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 sm:text-5xl"
        >
            Choose Your Game
        </h1>
        <p class="mt-4 text-xl text-neutral-400">
            A collection of vibe-coded browser games.
        </p>
    </div>

    <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {#each games as game}
            <a
                href="/games/{game.slug}"
                class="group relative flex flex-col overflow-hidden rounded-2xl bg-neutral-900 border border-white/5 shadow-2xl transition-all hover:-translate-y-1 hover:border-indigo-500/30 hover:shadow-indigo-500/10"
            >
                <div
                    class="aspect-video w-full bg-neutral-800 object-cover group-hover:opacity-90"
                >
                    <!-- Thumbnail Placeholder or Implementation -->
                    <div
                        class="flex h-full items-center justify-center text-neutral-600"
                    >
                        <span class="text-sm font-mono">NO SIGNAL</span>
                    </div>
                </div>
                <div class="flex flex-1 flex-col justify-between p-6">
                    <div>
                        <h3
                            class="text-xl font-semibold text-white group-hover:text-indigo-400 transition-colors"
                        >
                            {game.title}
                        </h3>
                        <p class="mt-4 text-sm leading-6 text-neutral-400">
                            {game.description}
                        </p>
                    </div>
                    <div class="mt-6">
                        <span
                            class="inline-flex items-center text-sm font-medium text-indigo-400 group-hover:text-indigo-300"
                        >
                            Play Now <span
                                aria-hidden="true"
                                class="ml-1 transition-transform group-hover:translate-x-1"
                                >&rarr;</span
                            >
                        </span>
                    </div>
                </div>
            </a>
        {/each}
    </div>
</div>
