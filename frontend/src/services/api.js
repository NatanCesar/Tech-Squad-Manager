const defaultHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const BASE_URL = import.meta.env.VITE_API_URL || `http://${defaultHost}:3001/api`;

async function request(method, path, body) {
    const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro na requisição');
    return data;
}

export const api = {
    createSession:  (difficulty)         => request('POST', '/sessions', { difficulty }),
    getSession:     (code)               => request('GET',  `/sessions/${code}`),
    joinSession:    (code, name)         => request('POST', `/sessions/${code}/join`, { name }),
    startSession:   (code)               => request('POST', `/sessions/${code}/start`),
    finishPlayer:   (playerId, payload)  => request('POST', `/players/${playerId}/finish`, payload),
    getRanking:     (code)               => request('GET',  `/sessions/${code}/ranking`),
    getReport:      (code)               => request('GET',  `/sessions/${code}/report`),
    endSession:     (code)               => request('POST', `/sessions/${code}/end`),
};
