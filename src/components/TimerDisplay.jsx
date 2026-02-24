import React, { useEffect, useRef, useState } from 'react';

const TimerDisplay = ({ recipe, onReset, onFinish }) => {
    // Total Duration from recipe, default to 140s (2:20)
    const TOTAL_TIME = recipe.duration || 140;

    // State
    const [elapsed, setElapsed] = useState(0);
    const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
    const [isActive, setIsActive] = useState(false);
    const [isPreparing, setIsPreparing] = useState(true);
    const [prepCount, setPrepCount] = useState(3);
    const startTimeRef = useRef(null);
    const pausedTimeRef = useRef(0); // Track total paused duration

    // Audio Context Ref (Persistent - Local to Component like V60)
    const audioCtxRef = useRef(null);
    const lastPlayedRef = useRef(-1);

    // Format mm:ss
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // Initialize or Resume Audio Context
    const ensureAudioContext = () => {
        if (!audioCtxRef.current) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                audioCtxRef.current = new AudioContext();
            }
        }
        if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
        }
    };

    // Play Silent Buffer (iOS Unlock)
    const playSilentBuffer = () => {
        try {
            if (!audioCtxRef.current) ensureAudioContext();
            const ctx = audioCtxRef.current;
            if (!ctx) return;

            // Create a short empty buffer and play it to unlock iOS audio
            const buffer = ctx.createBuffer(1, 1, 22050);
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(ctx.destination);
            source.start(0);
            console.log("Silent buffer played (Audio Unlock)");
        } catch (e) {
            console.error("Silent buffer failed", e);
        }
    };

    // Play Tone Function
    const playTone = (freq, type, duration) => {
        try {
            if (!audioCtxRef.current) ensureAudioContext();
            const ctx = audioCtxRef.current;
            if (!ctx) return;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime);

            gain.gain.setValueAtTime(0.5, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch (e) {
            console.error("Audio play failed", e);
        }
    };

    // Prep Countdown Loop (NO BEEP usually, but let's keep it simple)
    useEffect(() => {
        let interval = null;
        if (isPreparing && prepCount > 0) {
            // Visual only
            interval = setInterval(() => {
                setPrepCount((prev) => prev - 1);
            }, 1000);
        } else if (isPreparing && prepCount === 0) {
            // GO!
            playTone(800, 'square', 0.3); // GO Sound
            setIsPreparing(false);
            setIsActive(true);
            startTimeRef.current = Date.now(); // Start checking drift from NOW
        }
        return () => clearInterval(interval);
    }, [isPreparing, prepCount]);

    // Init Logic on Mount
    useEffect(() => {
        // Attempt to init audio, but likely needs interaction on iOS
        ensureAudioContext();

        // Cleanup
        return () => {
            if (audioCtxRef.current) {
                audioCtxRef.current.close().catch(e => console.error("Error closing audio context", e));
                audioCtxRef.current = null;
            }
        }
    }, []);

    // Timer Loop
    useEffect(() => {
        let interval = null;

        if (isActive) {
            interval = setInterval(() => {
                const now = Date.now();
                // Real elapsed = (Now - Start) - PausedDuration
                const totalElapsedMs = now - startTimeRef.current - pausedTimeRef.current;
                const totalElapsedSec = Math.floor(totalElapsedMs / 1000);

                // Update Display
                setElapsed(totalElapsedSec);
                const remaining = Math.max(0, TOTAL_TIME - totalElapsedSec);
                setTimeLeft(remaining);

                // Triggers
                // 30s Mark (110 remaining)
                if (remaining <= 110 && remaining > 109 && totalElapsedSec >= 30) {
                    // Handled by sound effect loop
                }
            }, 100); // 100ms polling for better response
        }
        return () => clearInterval(interval);
    }, [isActive, TOTAL_TIME]);

    // Sound Logic (Separate Effect to avoid stutter)
    useEffect(() => {
        // Trigger at 30s elapsed (Standard Clever Logic) - Check elapsed directly
        if (elapsed === 30) {
            playTone(600, 'sine', 0.5);
        }

        // Final Countdown Beeps (3, 2, 1) - Play exactly when integer changes
        if (isActive && timeLeft <= 3 && timeLeft > 0) {
            // Play short blip for 3, 2, 1
            playTone(600, 'sine', 0.15);
        }

        // Finish
        if (elapsed >= TOTAL_TIME && isActive) {
            // Softer Final Sound (Melody-ish C Major)
            playTone(523.25, 'sine', 0.6); // C5
            setTimeout(() => playTone(659.25, 'sine', 0.6), 200); // E5
            setTimeout(() => playTone(783.99, 'sine', 1.2), 400); // G5

            setIsActive(false);
            // Wait 2.5s before showing review screen
            setTimeout(() => {
                if (onFinish) onFinish();
            }, 2500);
        }
    }, [timeLeft, elapsed, isActive, onFinish, TOTAL_TIME]);

    // Implementing Pause correctly with Delta:
    const [pauseStart, setPauseStart] = useState(null);

    const togglePause = () => {
        if (isActive) {
            setIsActive(false);
            setPauseStart(Date.now());
        } else {
            // Unlock audio on resume as well, just in case
            ensureAudioContext();
            playSilentBuffer();

            setIsActive(true);
            const pauseDuration = Date.now() - pauseStart;
            pausedTimeRef.current += pauseDuration;
            setPauseStart(null);
        }
    };

    return (
        <div className="card">
            {isPreparing ? (
                <div
                    className="prep-overlay"
                    onClick={() => {
                        // Explicitly unlock audio on tap
                        ensureAudioContext();
                        playSilentBuffer();
                    }}
                >
                    <h2>Get Ready</h2>
                    <div className="time-big animated">{prepCount > 0 ? prepCount : 'GO!'}</div>
                    <p className="hint" style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '10px' }}>(Tap anywhere to unlock audio)</p>
                    <button className="btn-secondary" onClick={(e) => {
                        e.stopPropagation();
                        onReset();
                    }}>Cancel</button>
                </div>
            ) : (
                <>
                    {/* Main Countdown (Big) */}
                    <div className="time-big">{formatTime(timeLeft)}</div>
                    <div className="time-small-label">Remaining</div>

                    {/* Alert Area - Logic specific to 2:20 (140s) but generic enough? 
                        Original logic: "Break Crust" at 30s elapsed.
                        Display condition: 30s elapsed + a few seconds.
                    */}
                    {elapsed >= 30 && elapsed < 35 && <div className="alert">Break Crust / Cover</div>}
                    {timeLeft === 0 && <div className="alert done">Enjoy! ☕</div>}

                    {/* Elapsed (Count Up) */}
                    <div className="time-secondary">
                        {formatTime(elapsed)}
                    </div>
                    <div className="time-small-label">Elapsed</div>

                    {/* Recipe Info */}
                    <div className="recipe-summary">
                        Water: {recipe.water}ml  |  Coffee: {recipe.coffee}g
                    </div>

                    <div className="controls">
                        {timeLeft === 0 ? (
                            <button className="btn-primary" onClick={onReset}>New Brew</button>
                        ) : (
                            <div className="controls-row">
                                <button className="btn-secondary" onClick={togglePause}>
                                    {isActive ? 'Pause' : 'Resume'}
                                </button>
                                <button className="btn-secondary" onClick={onReset}>
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default TimerDisplay;
