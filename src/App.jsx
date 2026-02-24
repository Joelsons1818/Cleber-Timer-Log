import React, { useState, useEffect } from 'react'
import Calculator from './components/Calculator'
import TimerDisplay from './components/TimerDisplay'
import ReviewScreen from './components/ReviewScreen'
import HistoryScreen from './components/HistoryScreen'
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import './index.css'
import { getLogs, saveLog, syncLogs, deleteLog } from './utils/api';

function App() {
  const [mode, setMode] = useState('setup'); // setup | timer | review | history
  const [recipe, setRecipe] = useState({ water: 500, coffee: 32.5, temp: 96, grind: 20, duration: 140 });

  const refreshLogs = async () => {
    const serverLogs = await getLogs();
    if (serverLogs && serverLogs.length > 0) {
      localStorage.setItem('clever_logs', JSON.stringify(serverLogs));
      return serverLogs; // Return so caller can know it finished
    } else {
      // If server is empty but we have local logs, sync them up?
      // Ideally we should do a merge, but for now let's trust server if it has data.
      // Or if server is empty, maybe we push our local logs there?
      const local = localStorage.getItem('clever_logs');
      if (local) {
        const parsed = JSON.parse(local);
        if (parsed.length > 0) {
          await syncLogs(parsed);
        }
      }
    }
    return [];
  };

  // Load logs from server on startup
  useEffect(() => {
    refreshLogs();
  }, []);

  // Start Timer
  const handleStart = (data) => {
    setRecipe(data);
    setMode('timer');
  };

  // Quick Log -> Go directly to Review
  const handleQuickLog = (data) => {
    setRecipe(data);
    setMode('review');
  };

  // Save Log -> Back to Setup
  const handleSaveLog = async (logData) => {
    // 1. Save to local (optimistic update)
    const existing = localStorage.getItem('clever_logs');
    const logs = existing ? JSON.parse(existing) : [];
    logs.push(logData);
    localStorage.setItem('clever_logs', JSON.stringify(logs));

    // 2. Save to server
    await saveLog(logData);

    setMode('setup');
  };



  const handleFinish = () => {
    setMode('review');
    // Keep screen awake during review? Maybe. 
    // Or let it sleep. Let's keep it awake until they save/skip.
  };

  const handleSkip = () => {
    setMode('setup');
  };

  const handleDeleteLog = async (id, updatedLogs) => {
    // 1. Update local storage (HistoryScreen passes the updated list reversed, so we need to be careful)
    // Actually, HistoryScreen passes 'updated' which is the filtered list of what is currently shown.
    // Let's just trust what HistoryScreen gives us OR re-filter ourselves to be safe.

    // Safer: Filter from current local storage
    const existing = localStorage.getItem('clever_logs');
    if (existing) {
      const logs = JSON.parse(existing);
      const newLogs = logs.filter(l => l.id !== id);
      localStorage.setItem('clever_logs', JSON.stringify(newLogs));
    }

    // 2. Call API to delete from Google Sheet
    await deleteLog(id);
  };

  return (
    <div className="app-container">
      {mode === 'setup' && (
        <Calculator
          onStart={handleStart}
          onQuickLog={handleQuickLog}
          onHistory={() => setMode('history')}
        />
      )}

      {mode === 'timer' && (
        <TimerDisplay
          recipe={recipe}
          onReset={() => setMode('setup')}
          onFinish={handleFinish}
        />
      )}

      {mode === 'review' && (
        <ReviewScreen
          recipe={recipe}
          onSave={handleSaveLog}
          onSkip={handleSkip}
        />
      )}

      {mode === 'history' && (
        <HistoryScreen
          onBack={() => setMode('setup')}
          onDelete={handleDeleteLog}
          onRefresh={refreshLogs}
        />
      )}

      <Analytics />
      <SpeedInsights />
    </div>
  );
}

export default App;
