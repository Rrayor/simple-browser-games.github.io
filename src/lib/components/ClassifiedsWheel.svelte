<script lang="ts">
    import { onMount } from "svelte";
    import { games } from "$lib/games/registry";
    import { fade, fly } from "svelte/transition";

    let rotation = 0;
    let isDragging = false;
    let startX = 0;
    let startRotation = 0;
    let velocity = 0;
    let requestFrame: number;
    let container: HTMLDivElement;

    const FRICTION = 0.95;
    const SENSITIVITY = 0.5;

    function handleStart(clientX: number) {
        isDragging = true;
        startX = clientX;
        startRotation = rotation;
        velocity = 0;
        cancelAnimationFrame(requestFrame);
    }

    function handleMove(clientX: number) {
        if (!isDragging) return;
        const delta = clientX - startX;
        rotation = startRotation + delta * SENSITIVITY;
        velocity = delta * 0.1; // Track velocity for inertia
    }

    function handleEnd() {
        isDragging = false;
        applyInertia();
    }

    function applyInertia() {
        if (Math.abs(velocity) > 0.1) {
            rotation += velocity;
            velocity *= FRICTION;
            requestFrame = requestAnimationFrame(applyInertia);
        }
    }

    // Simplified messy grid positions for 4 items
    const gridPositions = [
        { x: -180, y: -180, rot: -4 },
        { x: 160, y: -150, rot: 2 },
        { x: -140, y: 170, rot: 3 },
        { x: 190, y: 140, rot: -2 },
    ];
</script>

<div
    class="relative w-full h-[80vh] flex items-center justify-center perspective-1000 overflow-hidden cursor-grab active:cursor-grabbing"
    onmousedown={(e) => handleStart(e.clientX)}
    onmousemove={(e) => handleMove(e.clientX)}
    onmouseup={handleEnd}
    onmouseleave={handleEnd}
    ontouchstart={(e) => handleStart(e.touches[0].clientX)}
    ontouchmove={(e) => handleMove(e.touches[0].clientX)}
    ontouchend={handleEnd}
    bind:this={container}
    role="application"
    aria-label="Game Selection Grid"
>
    <!-- The Rotating Collage -->
    <div
        class="absolute w-full h-full flex items-center justify-center transition-transform duration-75 will-change-transform"
        style="transform: rotateY({rotation * 0.5}deg) rotateZ({rotation *
            0.1}deg);"
    >
        {#each games as game, i}
            {@const pos = gridPositions[i] || { x: 0, y: 0, rot: 0 }}

            <a
                href={`/games/${game.slug}`}
                class="absolute block w-64 p-4 bg-[#f0f0f0] border-2 border-neutral-900 shadow-[8px_8px_0px_#000] hover:shadow-[12px_12px_0px_#f0f] hover:border-[#f0f] transition-all group hover:scale-110 z-10"
                style="transform: translate({pos.x}px, {pos.y}px) rotate({pos.rot}deg);"
                draggable="false"
            >
                <!-- Tape/Sticker Effect -->
                <div
                    class="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-6 bg-yellow-200/80 rotate-[-2deg] shadow-sm transform skew-x-12"
                ></div>

                <div class="border-b-2 border-neutral-900 mb-2 pb-1">
                    <h3
                        class="font-orbitron font-bold text-lg uppercase leading-none text-neutral-900 group-hover:text-[#f0f]"
                    >
                        {game.title}
                    </h3>
                    <span
                        class="text-[0.6rem] font-share text-neutral-600 uppercase tracking-widest font-bold"
                        >Ad #{1000 + i}</span
                    >
                </div>

                <div
                    class="relative h-24 bg-neutral-800 mb-2 overflow-hidden grayscale group-hover:grayscale-0 transition-all text-center"
                >
                    <!-- Placeholder for thumbnail if missing -->
                    <div
                        class="absolute inset-0 flex items-center justify-center text-neutral-100 font-mono text-xs font-bold"
                    >
                        {game.slug.toUpperCase()}
                    </div>
                </div>

                <p
                    class="font-merriweather text-[0.65rem] leading-tight text-justify line-clamp-3 text-neutral-800"
                >
                    {game.description}
                    <span class="block mt-1 font-bold text-red-600 uppercase"
                        >Call Now!</span
                    >
                </p>

                {#if game.slug === "void-runner"}
                    <div
                        class="absolute -right-6 -bottom-6 w-16 h-16 bg-neon-green rounded-full flex items-center justify-center animate-pulse rotate-12 border-2 border-black bg-[#0f0]"
                    >
                        <span
                            class="font-russo text-[0.6rem] text-center leading-none text-black"
                            >New!<br />HOT!</span
                        >
                    </div>
                {/if}
            </a>
        {/each}
    </div>

    <!-- Center Background Decor -->
    <div
        class="absolute pointer-events-none flex flex-col items-center justify-center z-0 opacity-50"
    >
        <h1
            class="text-[8rem] font-russo text-neutral-200/10 rotate-[-15deg] select-none whitespace-nowrap"
        >
            CLASSIFIEDS
        </h1>
    </div>
</div>

<style>
    .perspective-1000 {
        perspective: 1000px;
    }
</style>
