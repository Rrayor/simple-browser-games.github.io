export class SoundManager {
    private audioCtx: AudioContext;
    private gainNode: GainNode;
    private initialized = false;
    private noiseBuffer: AudioBuffer | null = null;

    constructor() {
        this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.gainNode = this.audioCtx.createGain();
        this.gainNode.gain.value = 0.3; // Master volume
        this.gainNode.connect(this.audioCtx.destination);
    }

    async init() {
        if (this.audioCtx.state === 'suspended') {
            await this.audioCtx.resume();
        }
        if (!this.noiseBuffer) {
            this.noiseBuffer = this.createNoiseBuffer();
        }
        this.initialized = true;
    }

    private createNoiseBuffer(): AudioBuffer {
        const bufferSize = this.audioCtx.sampleRate * 2; // 2 seconds of noise
        const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        return buffer;
    }

    playJump() {
        if (!this.initialized || !this.noiseBuffer) { this.init(); return; }

        // "Whoosh" - Air Dash effect
        const t = this.audioCtx.currentTime;
        const src = this.audioCtx.createBufferSource();
        src.buffer = this.noiseBuffer;

        const filter = this.audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.Q.value = 1;
        filter.frequency.setValueAtTime(200, t);
        filter.frequency.exponentialRampToValueAtTime(3000, t + 0.15); // Sweep up

        const gain = this.audioCtx.createGain();
        gain.gain.setValueAtTime(0.01, t);
        gain.gain.linearRampToValueAtTime(0.4, t + 0.05); // Attack
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2); // Decay

        src.connect(filter);
        filter.connect(gain);
        gain.connect(this.gainNode);

        src.start(t);
        src.stop(t + 0.2);
    }

    playDoubleJump() {
        if (!this.initialized || !this.noiseBuffer) return;

        // Sharper, faster "Blade" whoosh
        const t = this.audioCtx.currentTime;
        const src = this.audioCtx.createBufferSource();
        src.buffer = this.noiseBuffer;

        const filter = this.audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.Q.value = 2; // Resonant
        filter.frequency.setValueAtTime(600, t);
        filter.frequency.exponentialRampToValueAtTime(8000, t + 0.1); // Fast high sweep

        const gain = this.audioCtx.createGain();
        gain.gain.setValueAtTime(0.01, t);
        gain.gain.linearRampToValueAtTime(0.5, t + 0.02); // Sharp attack
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15); // Fast decay

        src.connect(filter);
        filter.connect(gain);
        gain.connect(this.gainNode);

        src.start(t);
        src.stop(t + 0.15);
    }

    playStep() {
        if (!this.initialized || !this.noiseBuffer) return;

        // Tighter, high-end "Click/Scuff"
        const t = this.audioCtx.currentTime;
        const src = this.audioCtx.createBufferSource();
        src.buffer = this.noiseBuffer;

        const filter = this.audioCtx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 800; // Remove mud

        const gain = this.audioCtx.createGain();
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.04); // Very short

        src.connect(filter);
        filter.connect(gain);
        gain.connect(this.gainNode);

        src.start(t);
        src.stop(t + 0.05);
    }
}
