<script lang="ts">
    import NoiseBackground from "$lib/components/NoiseBackground.svelte";
    import ClassifiedsWheel from "$lib/components/ClassifiedsWheel.svelte";
    import { onMount } from "svelte";

    let mounted = false;
    onMount(() => {
        mounted = true;
    });
</script>

<NoiseBackground />

<main
    class="min-h-screen relative overflow-hidden flex flex-col pointer-events-none"
>
    <!-- Top Bar / Newspaper Header -->
    <header
        class="w-full border-b-[3px] border-neutral-900 bg-[#f4f1ea] pt-4 pb-2 px-6 flex justify-between items-end rotate-[0.5deg] shadow-lg pointer-events-auto z-50"
    >
        <div class="flex flex-col">
            <span
                class="font-share text-xs tracking-[0.3em] text-neutral-700 uppercase"
                >Vol. 420 • Est. 2026 • Price: $0.00</span
            >
            <h1
                class="font-russo text-6xl md:text-8xl tracking-tighter uppercase leading-[0.8]"
            >
                <span class="text-neutral-900">THE DAILY</span>
                <span class="text-[#f0f] animate-pulse">GLITCH</span>
            </h1>
        </div>
        <div
            class="hidden md:flex flex-col items-end text-right font-merriweather text-xs italic text-neutral-800 max-w-[200px] leading-tight"
        >
            <p>"All the slop that's fit to compute."</p>
            <p class="mt-1 font-bold not-italic font-share text-neutral-900">
                WEATHER: DIGITAL RAIN
            </p>
        </div>
    </header>

    <!-- Marquee Banner -->
    <div
        class="bg-neutral-900 text-[#0f0] font-share overflow-hidden whitespace-nowrap py-1 border-b border-black rotate-[-0.5deg] z-40"
    >
        <div class="animate-marquee inline-block">
            BREAKING NEWS: AI GENERATES GAME, HUMANS CONFUSED +++ VOID RUNNER
            UPDATED +++ BALLOON ASCENT READY +++ BIT CRAWL RELEASED +++ COSMIC
            CLASH IMMINENT +++ NO REFUNDS +++ BREAKING NEWS: AI GENERATES GAME,
            HUMANS CONFUSED +++ VOID RUNNER UPDATED +++ BALLOON ASCENT READY +++
            BIT CRAWL RELEASED +++ COSMIC CLASH IMMINENT +++ NO REFUNDS +++
        </div>
    </div>

    <!-- Main Content Area -->
    <div
        class="flex-1 relative flex items-center justify-center pointer-events-auto"
    >
        {#if mounted}
            <ClassifiedsWheel />
        {/if}

        <!-- Decoration: Coffee Stain -->
        <div
            class="absolute bottom-10 right-10 w-32 h-32 rounded-full border-4 border-[#5a3a1a]/20 pointer-events-none z-[-1] blur-[1px]"
        ></div>
        <div
            class="absolute bottom-12 right-12 w-28 h-28 rounded-full border-2 border-[#5a3a1a]/10 pointer-events-none z-[-1]"
        ></div>
    </div>

    <!-- Footer / Legal -->
    <footer
        class="absolute bottom-2 left-4 text-[0.5rem] font-merriweather text-neutral-500 max-w-lg opacity-60 z-50 leading-tight"
    >
        <div class="mb-1">
            PRIVACY: This site does not collect any personal data or use
            tracking cookies.
        </div>
        <div>
            DISCLAIMER: A collection of experimental mini-games. Inspired by
            classic arcade mechanics. No affiliation with original creators.
            This interface is for entertainment purposes only using "Vibe OS"
            technology. Do not feed the code.
        </div>
    </footer>
</main>

<style>
    @keyframes marquee {
        0% {
            transform: translateX(0);
        }
        100% {
            transform: translateX(-50%);
        }
    }
    .animate-marquee {
        animation: marquee 20s linear infinite;
    }
</style>
