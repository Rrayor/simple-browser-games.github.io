<script lang="ts">
    import balloonUrl from "$lib/games/flappy-balloon/assets/balloon.png";
</script>

<div class="space-y-16">
    <!-- Hero Section -->
    <section class="relative isolate overflow-hidden">
        <div
            class="mx-auto max-w-7xl px-6 lg:px-8 pt-16 pb-12 sm:pt-32 sm:pb-20 text-center"
        >
            <h1
                class="text-4xl font-bold tracking-tight text-white sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 pb-2"
            >
                Simple Browser Games
            </h1>
            <p
                class="mt-6 text-lg leading-8 text-neutral-300 max-w-2xl mx-auto"
            >
                A collection of vibe-coded, barely-polished browser games.
                Expect generic shapes, AI-generated assets, and classic concepts
                reimagined with absolutely zero budget.
            </p>
        </div>
    </section>

    <!-- Games Grid -->
    <section class="mx-auto max-w-7xl px-6 lg:px-8">
        <h2
            class="text-2xl font-semibold leading-7 text-white mb-8 border-l-4 border-indigo-500 pl-4"
        >
            Available Games
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <!-- Flappy Balloon Card -->
            <a
                href="/games/flappy-balloon"
                class="group relative block overflow-hidden rounded-2xl bg-neutral-900 border border-white/10 transition-all hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/20"
            >
                <div
                    class="aspect-video w-full overflow-hidden bg-sky-900 relative"
                >
                    <!-- Abstract Visual for Card -->
                    <div
                        class="absolute inset-0 bg-gradient-to-b from-sky-300 to-sky-600 opacity-80"
                    ></div>
                    <!-- Mock Game Scene -->
                    <div
                        class="absolute inset-0 flex items-center justify-center translate-y-4 group-hover:translate-y-2 transition-transform duration-500"
                    >
                        <!-- Custom rendered balloon for the card -->
                        <div
                            class="w-16 h-16 rounded-full bg-orange-500 relative shadow-lg"
                        >
                            <div
                                class="absolute top-3 left-3 w-4 h-2 rounded-full bg-white/40 -rotate-45"
                            ></div>
                            <div
                                class="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-white/80 translate-y-full origin-top animate-pulse"
                            ></div>
                        </div>
                    </div>
                    <div
                        class="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-neutral-900 via-neutral-900/60 to-transparent"
                    ></div>
                </div>

                <div class="p-6 relative">
                    <h3
                        class="mt-3 text-xl font-semibold leading-6 text-white group-hover:text-indigo-300 transition-colors"
                    >
                        Flappy Balloon
                    </h3>
                    <p class="mt-2 text-sm leading-6 text-neutral-400">
                        Navigate the balloon through dangerous spikes. A modern
                        take on the classic Flappy Bird mechanics.
                    </p>
                    <div
                        class="mt-4 flex items-center gap-x-2 text-xs font-semibold uppercase tracking-wide text-indigo-400"
                    >
                        <span>Play Now</span>
                        <svg
                            class="h-4 w-4 transition-transform group-hover:translate-x-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="2"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                            />
                        </svg>
                    </div>
                </div>
            </a>

            <!-- Snake Clone Card (Coming Soon) -->
            <!-- Snake Clone Card -->
            <a
                href="/games/snake"
                class="group relative block overflow-hidden rounded-2xl bg-neutral-900 border border-white/10 transition-all hover:border-green-500/50 hover:shadow-2xl hover:shadow-green-500/20"
            >
                <div
                    class="aspect-video w-full overflow-hidden bg-neutral-800 relative flex items-center justify-center"
                >
                    <div
                        class="text-neutral-600 font-mono text-6xl opacity-20 select-none group-hover:text-green-500/40 transition-colors"
                    >
                        SNAKE
                    </div>
                    <!-- Simple snake visual -->
                    <div
                        class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    >
                        <div
                            class="absolute top-1/2 left-1/4 w-32 h-4 bg-green-500 rounded-sm"
                        ></div>
                        <div
                            class="absolute top-1/2 left-[calc(25%+8rem)] w-4 h-4 bg-red-500 rounded-sm animate-pulse"
                        ></div>
                    </div>
                </div>
                <div class="p-6">
                    <h3
                        class="mt-3 text-xl font-semibold leading-6 text-white group-hover:text-green-400 transition-colors"
                    >
                        Snake Clone
                    </h3>
                    <p class="mt-2 text-sm leading-6 text-neutral-400">
                        The classic Nokia game. Eat apples, grow longer, don't
                        hit the wall.
                    </p>
                    <div
                        class="mt-4 flex items-center gap-x-2 text-xs font-semibold uppercase tracking-wide text-green-400"
                    >
                        <span>Play Now</span>
                        <svg
                            class="h-4 w-4 transition-transform group-hover:translate-x-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="2"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                            />
                        </svg>
                    </div>
                </div>
            </a>
        </div>
    </section>
</div>
