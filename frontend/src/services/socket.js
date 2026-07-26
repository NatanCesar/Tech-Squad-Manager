import { io } from 'socket.io-client';

const defaultHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || `http://${defaultHost}:3001`;

let socket = null;
let lastJoinParams = null;

export function getSocket() {
    if (!socket) {
        socket = io(SOCKET_URL, { autoConnect: false });
        socket.on('connect', () => {
            if (lastJoinParams) {
                socket.emit('session:join', lastJoinParams);
            }
        });
    }
    return socket;
}

export function connectToSession(code, playerId, role) {
    lastJoinParams = { code, playerId, role };
    const s = getSocket();
    if (!s.connected) {
        s.connect();
    } else {
        s.emit('session:join', lastJoinParams);
    }
    return s;
}

export function disconnectSocket() {
    lastJoinParams = null;
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}
