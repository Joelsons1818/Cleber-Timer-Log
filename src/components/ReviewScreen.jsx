import React, { useState } from 'react';

const ReviewScreen = ({ recipe, onSave, onSkip }) => {
    const [coffeeName, setCoffeeName] = useState('');
    const [grind, setGrind] = useState(recipe.grind || '');
    const [notes, setNotes] = useState('');
    const [temp, setTemp] = useState(recipe.temp); // Allow editing trigger temp

    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (saving) return;
        setSaving(true);

        const log = {
            id: Date.now(),
            date: new Date().toISOString(),
            water: recipe.water,
            coffee: recipe.coffee,
            temp: temp,
            coffeeName: coffeeName || 'Unknown Coffee',
            grind: grind || 'Medium',
            notes: notes
        };

        // onSave is async in App.jsx, so we await it
        await onSave(log);
        // Note: App.jsx will unmount us by changing mode, so we don't strictly need to setSaving(false)
        // unless onSave fails or doesn't change mode immediately.
        // But for safety/cleanup (and if logic changes later):
        if (typeof onSave.then === 'function') {
            // It's a promise, so we wait.
        } else {
            // If not a promise, we might just unmount.
        }
    };

    return (
        <div className="card">
            <h2>Brew Complete! ☕</h2>
            <p className="subtitle">How was it?</p>

            <div className="review-form">
                <div className="input-group">
                    <label>Coffee Name</label>
                    <input
                        type="text"
                        placeholder="e.g. Ethiopia Yirgacheffe"
                        value={coffeeName}
                        onChange={(e) => setCoffeeName(e.target.value)}
                        disabled={saving}
                    />
                </div>

                <div className="row">
                    <div className="input-group">
                        <label>Temp (°C)</label>
                        <input
                            type="number"
                            value={temp}
                            onChange={(e) => setTemp(e.target.value)}
                            disabled={saving}
                        />
                    </div>
                    <div className="input-group">
                        <label>Grind (Clicks)</label>
                        <input
                            type="text"
                            placeholder="e.g. 18"
                            value={grind}
                            onChange={(e) => setGrind(e.target.value)}
                            disabled={saving}
                        />
                    </div>
                </div>

                <div className="input-group">
                    <label>Notes</label>
                    <textarea
                        rows="3"
                        placeholder="Tasting notes..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        disabled={saving}
                    />
                </div>

                <button className="btn-primary" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Log'}
                </button>
                <button className="btn-secondary" onClick={onSkip} disabled={saving}>
                    Skip
                </button>
            </div>
        </div>
    );
};

export default ReviewScreen;
