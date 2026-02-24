import React, { useState } from 'react';

const Calculator = ({ onStart, onQuickLog, onHistory }) => {
    const RATIO = 15.385;
    const [water, setWater] = useState(500);
    const [coffee, setCoffee] = useState(32.5);
    const [temp, setTemp] = useState(96); // Default 96°C
    const [grind, setGrind] = useState(20); // Default 20
    const [minutes, setMinutes] = useState(2);
    const [seconds, setSeconds] = useState(20);

    const handleWaterChange = (e) => {
        const val = parseFloat(e.target.value);
        setWater(val);
        if (!isNaN(val)) {
            const c = val / RATIO;
            setCoffee(Math.round(c * 2) / 2);
        }
    };

    const handleCoffeeChange = (e) => {
        const val = parseFloat(e.target.value);
        setCoffee(val);
        if (!isNaN(val)) {
            const w = val * RATIO;
            setWater(Math.round(w / 5) * 5);
        }
    };

    const handleTempChange = (e) => {
        let val = parseFloat(e.target.value);
        if (val > 100) val = 100;
        setTemp(val);
    };

    // Calculate duration in seconds
    const getTotalSeconds = () => {
        const min = parseInt(minutes) || 0;
        const sec = parseInt(seconds) || 0;
        return (min * 60) + sec;
    };

    const handleStart = () => {
        // Pass to App to handle Audio Unlock & Video Play (Must be synchronous in event bubbling)
        onStart({ water, coffee, temp, grind, duration: getTotalSeconds() });
    };

    return (
        <div className="card">
            <div className="header-row">
                <h2>Clever Dripper</h2>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <button className="btn-icon" onClick={() => onQuickLog({ water, coffee, temp, grind, duration: getTotalSeconds() })} title="Quick Log">
                        📝
                    </button>
                    <button className="btn-icon" onClick={onHistory} title="History">
                        📜
                    </button>
                </div>
            </div>

            {/* Water */}
            <div className="input-group">
                <label>Water (ml)</label>
                <input
                    type="number"
                    inputMode="decimal"
                    pattern="[0-9]*"
                    value={water}
                    onChange={handleWaterChange}
                    step="5"
                />
            </div>

            {/* Coffee */}
            <div className="input-group">
                <label>Coffee (g)</label>
                <input
                    type="number"
                    inputMode="decimal"
                    pattern="[0-9]*"
                    value={coffee}
                    onChange={handleCoffeeChange}
                    step="0.5"
                />
            </div>

            <div className="row">
                {/* Temperature */}
                <div className="input-group">
                    <label>Temp (°C)</label>
                    <input
                        type="number"
                        inputMode="decimal"
                        pattern="[0-9]*"
                        value={temp}
                        onChange={handleTempChange}
                        max="100"
                        placeholder="96"
                    />
                </div>

                {/* Grind */}
                <div className="input-group">
                    <label>Grind</label>
                    <input
                        type="number"
                        inputMode="decimal"
                        pattern="[0-9]*"
                        value={grind}
                        onChange={(e) => setGrind(e.target.value)}
                        placeholder="20"
                    />
                </div>
            </div>

            {/* Time Input Row */}
            <div className="row">
                <div className="input-group" style={{ flex: 1 }}>
                    <label>Time (Min : Sec)</label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input
                            type="number"
                            inputMode="decimal"
                            pattern="[0-9]*"
                            value={minutes}
                            onChange={(e) => setMinutes(e.target.value)}
                            placeholder="2"
                            style={{ textAlign: 'center' }}
                        />
                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>:</span>
                        <input
                            type="number"
                            inputMode="decimal"
                            pattern="[0-9]*"
                            value={seconds}
                            onChange={(e) => setSeconds(e.target.value)}
                            placeholder="20"
                            style={{ textAlign: 'center' }}
                        />
                    </div>
                </div>
            </div>

            <div className="controls-col" style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <button className="btn-primary" onClick={handleStart}>
                    Start Timer
                </button>
                <div className="app-footer">
                    Created by Daniel Joelsons
                </div>
            </div>
        </div>
    );
};

export default Calculator;
