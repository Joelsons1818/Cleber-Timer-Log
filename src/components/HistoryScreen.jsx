import React, { useState, useEffect } from 'react';

const HistoryScreen = ({ onBack, onDelete, onRefresh }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('clever_logs');
        if (saved) {
            setLogs(JSON.parse(saved).reverse()); // Newest first
        }
    }, []);

    const handleRefresh = async () => {
        setLoading(true);
        try {
            await onRefresh();
            // Re-read from local storage after refresh
            const saved = localStorage.getItem('clever_logs');
            if (saved) {
                setLogs(JSON.parse(saved).reverse());
            }
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (isoString) => {
        return new Date(isoString).toLocaleDateString() + ' ' +
            new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const deleteLog = (id) => {
        if (confirm('Delete this log?')) {
            // Optimistic update locally
            const updated = logs.filter(l => l.id !== id);
            setLogs(updated);
            // Notify parent to handle API and persistent storage
            onDelete(id, updated);
        }
    }

    return (
        <div className="card history-card">
            <div className="header-row">
                <h2>Brew History</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn-icon" onClick={handleRefresh} disabled={loading}>
                        {loading ? '⏳' : '🔄'}
                    </button>
                    <button className="btn-icon" onClick={onBack}>✖️</button>
                </div>
            </div>

            <div className="log-list">
                {logs.length === 0 ? (
                    <p className="empty-msg">No brews recorded yet.</p>
                ) : (
                    logs.map(log => (
                        <div key={log.id} className="log-item">
                            <div className="log-header">
                                <span className="log-date">{formatDate(log.date)}</span>
                                <span className="log-coffee">{log.coffeeName}</span>
                            </div>
                            <div className="log-details">
                                <span>💧 {log.water}ml</span>
                                <span>🫘 {log.coffee}g</span>
                                <span>🌡️ {log.temp}°C</span>
                                <span>⚙️ {log.grind}</span>
                            </div>
                            {log.notes && <div className="log-notes">"{log.notes}"</div>}
                            <button className="btn-mini-delete" onClick={() => deleteLog(log.id)}>🗑️</button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default HistoryScreen;
