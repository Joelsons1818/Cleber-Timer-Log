export const API_URL = 'https://script.google.com/macros/s/AKfycbzdRg5O5cfr1lYaulDt5nsuOLYgdruBH1IXakOOhx7Ljs4iZOV22Rh_U7fpoh9g-9Lh/exec';

export const getLogs = async () => {
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Failed to fetch logs');
        return await res.json();
    } catch (e) {
        console.error('API Error:', e);
        return [];
    }
};

export const saveLog = async (logData) => {
    try {
        // Use text/plain to avoid CORS Preflight (OPTIONS) which GAS doesn't like
        const res = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify(logData)
        });
        if (!res.ok) throw new Error('Failed to save log');
        return await res.json();
    } catch (e) {
        console.error('API Save Error:', e);
        return null;
    }
};

export const deleteLog = async (id) => {
    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'delete', id: id })
        });
        if (!res.ok) throw new Error('Failed to delete log');
        return await res.json();
    } catch (e) {
        console.error('API Delete Error:', e);
        return null;
    }
};

export const syncLogs = async (localLogs) => {
    // Basic sync: send local logs to server to merge
    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify(localLogs)
        });
        if (!res.ok) throw new Error('Failed to sync');
        return await res.json();
    } catch (e) {
        console.error('Sync Error:', e);
        return null;
    }
};
