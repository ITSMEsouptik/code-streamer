// server/src/server.ts

import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import { registerSocketHandlers } from './socketHandlers'; // Import the handler registration function

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:9000"; // Adjust to your Quasar dev port

console.log(`SERVER_MAIN: Server will listen on port ${PORT}`);
console.log(`SERVER_MAIN: Allowing client origin(s): ${CLIENT_ORIGIN}`);

const io = new SocketIOServer(server, {
    cors: {
        origin: CLIENT_ORIGIN.split(',').map(origin => origin.trim()),
        methods: ["GET", "POST"]
    }
});

// Middleware and Routes
app.use(express.json()); // If you plan to have REST API endpoints

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
    res.send('Codestreamer Backend is running! (Modularized)');
});

// Socket.IO Connection Handling
io.on('connection', (socket) => {
    console.log(`SERVER_MAIN: New client connected: ${socket.id}`);
    
    // Register all event handlers for this socket connection
    registerSocketHandlers(io, socket);

    socket.on('disconnect', () => {
        // The actual disconnect logic is now in socketHandlers.ts,
        // but we can log it here as well if needed, or just let the handler manage it.
        console.log(`SERVER_MAIN: Client disconnected: ${socket.id}`);
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(`SERVER_MAIN: Server listening on http://localhost:${PORT}`);
});