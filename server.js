const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = process.env.PORT || 3000;

app.use(express.static('public')); // Serve static files from 'public' directory

// Store drawing history and image history
let drawingHistory = [];
let imageHistory = [];

io.on('connection', (socket) => {
    console.log('A user connected');

    // Send existing history to the newly connected client
    socket.emit('history', { drawings: drawingHistory, images: imageHistory });

    socket.on('drawing', (data) => {
        // Handle clear command
        if (data.clear) {
            drawingHistory = []; // Clear history on server
            imageHistory = []; // Clear image history on server
            socket.broadcast.emit('drawing', { clear: true }); // Broadcast clear to others
            return;
        }

        // Handle image data
        if (data.image) {
            // Check if image with this ID already exists (important for avoiding duplicates on reconnect)
            const existingImageIndex = imageHistory.findIndex(img => img.id === data.id);
            if (existingImageIndex === -1) {
                imageHistory.push(data); // Store new image
            }
        }
        
        // Handle image movement
        if (data.moveImage) {
            const imgIndex = imageHistory.findIndex(img => img.id === data.id);
            if (imgIndex > -1) {
                imageHistory[imgIndex].x = data.x;
                imageHistory[imgIndex].y = data.y;
            }
        }
        
        // Handle drawing strokes
        if (!data.image && !data.moveImage) { // Only store strokes if not image or image move
            drawingHistory.push(data);
        }

        // Broadcast data to all other connected clients
        socket.broadcast.emit('drawing', data);
    });

    // Handle history requests from new clients (redundant since history is sent on connect, but good fallback)
    socket.on('requestHistory', () => {
        socket.emit('history', { drawings: drawingHistory, images: imageHistory });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});