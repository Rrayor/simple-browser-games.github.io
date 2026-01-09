export class SoundManager {
    private audioCtx: AudioContext;
    private gainNode: GainNode;
    private initialized = false;
    private noiseBuffer: AudioBuffer | null = null;

    public muteMusic = false;
    public muteSfx = false;

    // Music Sequencing
    private isPlayingMusic = false;
    private tempo = 110;
    private lookahead = 25.0; // ms
    private scheduleAheadTime = 0.1; // s
    private nextNoteTime = 0.0;
    private current16thNote = 0;
    private timerID: number | null = null;
    private measureCount = 0; // Track bars

    // Instruments
    // Cm - Ab - Bb - Gm (Root Notes)
    private bassRoots = [32.70, 26.16, 29.14, 24.50]; // C1, Ab0, Bb0, G0
    // Arpeggio scales (Cm, AbM, BbM, Gm)
    private arps = [
        [261.63, 311.13, 392.00, 523.25], // Cm: C4, Eb4, G4, C5
        [207.65, 261.63, 311.13, 415.30], // Ab: Ab3, C4, Eb4, Ab4
        [233.08, 293.66, 349.23, 466.16], // Bb: Bb3, D4, F4, Bb4
        [196.00, 233.08, 293.66, 392.00]  // Gm: G3, Bb3, D4, G4
    ];

    constructor() {
        this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.gainNode = this.audioCtx.createGain();
        this.gainNode.gain.value = 0.2; // Master volume
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
        const bufferSize = this.audioCtx.sampleRate * 2; // 2 seconds
        const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        return buffer;
    }

    // --- SFX ---

    playJump() {
        if (this.muteSfx || !this.initialized || !this.noiseBuffer) { this.init(); return; }
        const t = this.audioCtx.currentTime;
        const src = this.audioCtx.createBufferSource();
        src.buffer = this.noiseBuffer;

        const filter = this.audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.Q.value = 1;
        filter.frequency.setValueAtTime(200, t);
        filter.frequency.exponentialRampToValueAtTime(3000, t + 0.15);

        const gain = this.audioCtx.createGain();
        gain.gain.setValueAtTime(0.01, t);
        gain.gain.linearRampToValueAtTime(0.4, t + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

        src.connect(filter);
        filter.connect(gain);
        gain.connect(this.gainNode);
        src.start(t);
        src.stop(t + 0.2);
    }

    playDoubleJump() {
        if (this.muteSfx || !this.initialized || !this.noiseBuffer) return;
        const t = this.audioCtx.currentTime;
        const src = this.audioCtx.createBufferSource();
        src.buffer = this.noiseBuffer;

        const filter = this.audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.Q.value = 2;
        filter.frequency.setValueAtTime(600, t);
        filter.frequency.exponentialRampToValueAtTime(8000, t + 0.1);

        const gain = this.audioCtx.createGain();
        gain.gain.setValueAtTime(0.01, t);
        gain.gain.linearRampToValueAtTime(0.5, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

        src.connect(filter);
        filter.connect(gain);
        gain.connect(this.gainNode);
        src.start(t);
        src.stop(t + 0.15);
    }

    playStep() {
        if (this.muteSfx || !this.initialized || !this.noiseBuffer) return;
        const t = this.audioCtx.currentTime;
        const src = this.audioCtx.createBufferSource();
        src.buffer = this.noiseBuffer;

        const filter = this.audioCtx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 800;

        const gain = this.audioCtx.createGain();
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.04);

        src.connect(filter);
        filter.connect(gain);
        gain.connect(this.gainNode);
        src.start(t);
        src.stop(t + 0.05);
    }

    // --- MUSIC ---

    playMusic() {
        if (this.muteMusic || this.isPlayingMusic) return;
        this.isPlayingMusic = true;
        this.nextNoteTime = this.audioCtx.currentTime;
        this.timerID = window.setInterval(() => this.scheduler(), this.lookahead);
    }

    stopMusic() {
        this.isPlayingMusic = false;
        if (this.timerID !== null) {
            window.clearInterval(this.timerID);
            this.timerID = null;
        }
    }

    private scheduler() {
        while (this.nextNoteTime < this.audioCtx.currentTime + this.scheduleAheadTime) {
            this.scheduleNote(this.current16thNote, this.nextNoteTime);
            this.nextStep();
        }
    }

    private nextStep() {
        const secondsPerBeat = 60.0 / this.tempo;
        this.nextNoteTime += 0.25 * secondsPerBeat; // Add quarter note time
        this.current16thNote++;
        if (this.current16thNote === 16) {
            this.current16thNote = 0;
            this.measureCount++; // Track bars
            if (this.measureCount > 3) this.measureCount = 0; // 4 Bar Loop
        }
    }

    private scheduleNote(beatNumber: number, time: number) {
        if (this.muteMusic) return; // Mute check

        // Current Chord index based on measure (0-3)
        const chordIdx = this.measureCount;

        // Kick: 1, 5, 9, 13
        if (beatNumber % 4 === 0) {
            this.playKick(time);
        }

        // Snare: 5, 13
        if (beatNumber === 4 || beatNumber === 12) {
            this.playSnare(time);
        }

        // Bass: Offbeat 8ths
        if (beatNumber % 2 === 0) {
            this.playBass(time, this.bassRoots[chordIdx]);
        }

        // Arp: Rising pattern
        const noteIndex = beatNumber % 4; // 0,1,2,3

        // Vary pattern slightly per bar
        let pitch = this.arps[chordIdx][noteIndex];
        if (chordIdx % 2 !== 0) {
            // Backward arp on odd bars
            pitch = this.arps[chordIdx][3 - noteIndex];
        }

        this.playArp(time, pitch);
    }

    private playKick(time: number) {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
        gain.gain.setValueAtTime(0.5, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
        osc.connect(gain);
        gain.connect(this.gainNode);
        osc.start(time);
        osc.stop(time + 0.5);
    }

    private playSnare(time: number) {
        if (!this.noiseBuffer) return;
        const src = this.audioCtx.createBufferSource();
        src.buffer = this.noiseBuffer;
        const filter = this.audioCtx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 1000;
        const gain = this.audioCtx.createGain();
        gain.gain.setValueAtTime(0.3, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
        src.connect(filter);
        filter.connect(gain);
        gain.connect(this.gainNode);
        src.start(time);
        src.stop(time + 0.2);
    }

    private playBass(time: number, freq: number) {
        const osc = this.audioCtx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, time);

        const filter = this.audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(100, time);
        filter.frequency.linearRampToValueAtTime(500, time + 0.1);
        filter.frequency.linearRampToValueAtTime(100, time + 0.2);

        const gain = this.audioCtx.createGain();
        gain.gain.setValueAtTime(0.2, time);
        gain.gain.linearRampToValueAtTime(0.1, time + 0.1);
        gain.gain.linearRampToValueAtTime(0, time + 0.2);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.gainNode);
        osc.start(time);
        osc.stop(time + 0.2);
    }

    private playArp(time: number, freq: number) {
        const osc = this.audioCtx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, time);
        const gain = this.audioCtx.createGain();
        gain.gain.setValueAtTime(0.05, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
        osc.connect(gain);
        gain.connect(this.gainNode);
        osc.start(time);
        osc.stop(time + 0.1);
    }
}
