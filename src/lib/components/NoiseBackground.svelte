<script lang="ts">
    // Noise Background Component
</script>

<div
    class="fixed inset-0 pointer-events-none z-[-1] overflow-hidden bg-[#1a1a1a]"
>
    <!-- Paper Texture Base -->
    <div
        class="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"
    ></div>

    <!-- Scanlines -->
    <div
        class="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none z-10 w-full h-full"
    ></div>

    <!-- Random Glitch Textures/Blobs (Optional, kept simple for now) -->

    <!-- Vignette -->
    <div
        class="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]"
    ></div>
</div>
