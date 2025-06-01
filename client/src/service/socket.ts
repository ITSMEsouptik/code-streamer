import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';

// Use Vite's import.meta.env to access environment variables
const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'; // Fallback

console.log(`INFO: Client connecting to backend at ${SOCKET_URL}`);

let socket: Socket;

export const connectSocket = (): Socket => {
    if (!socket) {
        socket = io(SOCKET_URL, {
            // Optional: add transports for better compatibility in some environments
            // transports: ['websocket', 'polling'],
        });

        socket.on('connect', () => {
            console.log('CLIENT: Connected to socket server with ID:', socket.id);
        });

        socket.on('disconnect', (reason) => {
            console.log('CLIENT: Disconnected from socket server. Reason:', reason);
        });

        socket.on('connect_error', (err) => {
            console.error('CLIENT: Socket connection error:', err.message);
        });

        // Listener for testing (can be removed or adapted)
        socket.on('server-message', (data) => {
            console.log('CLIENT: Message from server:', data);
        });

        // --- Add new event listeners for session management ---
        // These will be used by InterviewRoomPage.vue
        // No need to duplicate them here if they are handled directly in the Vue component,
        // but this service file is a good place for shared listeners if any.
        // For now, the Vue component will directly attach its listeners.
    }
    return socket;
};

export const getSocket = (): Socket => {
    if (!socket) {
        // Consider auto-connecting if not connected, or make connectSocket explicit in app startup
        console.warn("Socket not connected. Call connectSocket first or ensure it's called during app initialization.");
        // For robustness, you might want connectSocket to be called once in App.vue or main.ts
        // and then getSocket used everywhere else.
        return connectSocket(); // Attempt to connect if not already
        // throw new Error("Socket not connected. Call connectSocket first.");
    }
    return socket;
};

export const sendClientMessage = (message: string) => { // Example, adapt for actual events
    const currentSocket = getSocket(); // Ensure socket is initialized
    currentSocket.emit('client-message', message);
};

// --- Add specific emit functions for session management ---
export const emitCreateSession = () => {
    getSocket().emit('create-session');
};

export const emitJoinSession = (sessionId: string) => {
    getSocket().emit('join-session', { sessionId });
};