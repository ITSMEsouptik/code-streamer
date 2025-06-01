import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
    cors: {
        origin: "http://localhost:9000", // Quasar default port for Vuejs
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3001;

app.get('/', (req, res) => {
    res.send('Codestreamer Backend [Monorepo] is running!');
});

io.on('connection', (socket) => {
    console.log('A user connected to server:', socket.id);

    socket.on('disconnect', () => {
        console.log('User disconnected from server:', socket.id);
    });

    socket.on('client-message', (data) => {
        console.log('Message from client:', data);
        socket.emit('server-message', `Server received: ${data}`);
    });
});

server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});