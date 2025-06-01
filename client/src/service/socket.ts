import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3001'; // Your backend server URL
let socket: Socket;

export const connectSocket = () => {
    if (!socket) {
        socket = io(SOCKET_URL);

        socket.on('connect', () => {
            console.log('Connected to socket server with ID:', socket.id);
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from socket server');
        });

        socket.on('server-message', (data) => {
            console.log('Message from server:', data);
        });
    }
    return socket;
};

export const getSocket = () => {
    if (!socket) {
        throw new Error("Socket not connected. Call connectSocket first.");
    }
    return socket;
};

export const sendClientMessage = (message: string) => {
    getSocket().emit('client-message', message);
}