class AudioController {
    constructor() {
        this.context = null;
        this.isUnlocked = false;
    }

    getContext() {
        if (!this.context) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.context = new AudioContext();
        }
        return this.context;
    }

    // Call this on a user interaction event (click/touch)
    // Call this on a user interaction event (click/touch)
    resume() {
        const ctx = this.getContext();

        // 1. Resume context immediately
        if (ctx.state === 'suspended') {
            ctx.resume();
        }

        // 2. Play silent buffer immediately (synchronous creation/start)
        if (!this.isUnlocked) {
            const buffer = ctx.createBuffer(1, 1, 22050);
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(ctx.destination);
            source.start(0);
            this.isUnlocked = true;
        }
    }

    playTone(freq, type, duration) {
        const ctx = this.getContext();

        // Ensure context is running (attempt resume if needed, though interaction is best)
        if (ctx.state === 'suspended') {
            ctx.resume();
        }

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.value = freq;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        const now = ctx.currentTime;
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        osc.stop(now + duration);
    }
}

const audioController = new AudioController();
export default audioController;
