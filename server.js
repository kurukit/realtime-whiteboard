const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = process.env.PORT || 3000;

app.use(express.static('public')); // Serve static files from 'public' directory

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('drawing', (data) => {
        socket.broadcast.emit('drawing', data); // Broadcast drawing data to all other connected clients
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
