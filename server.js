const WebSocket = require('ws');
const http = require('http');

const PORT = process.env.PORT || 3001;

// Create HTTP server
const server = http.createServer();

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Store connected clients
const clients = new Map();

// Generate unique client ID
function generateClientId() {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Broadcast to all clients except sender
function broadcast(senderId, message) {
    clients.forEach((client, clientId) => {
        if (clientId !== senderId && client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify(message));
        }
    });
}

// Send to specific client
function sendToClient(clientId, message) {
    const client = clients.get(clientId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(message));
    }
}

wss.on('connection', (ws) => {
    const clientId = generateClientId();

    clients.set(clientId, {
        ws,
        username: null,
        status: 'online'
    });

    console.log(`Client connected: ${clientId}`);
    console.log(`Total clients: ${clients.size}`);

    // Send client their ID
    ws.send(JSON.stringify({
        type: 'connected',
        clientId,
        timestamp: Date.now()
    }));

    // Notify others about new client
    broadcast(clientId, {
        type: 'user-joined',
        clientId,
        timestamp: Date.now()
    });

    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data);

            console.log(`Message from ${clientId}:`, message.type);

            switch (message.type) {
                case 'join':
                    // Register username
                    const client = clients.get(clientId);
                    if (client) {
                        client.username = message.username;
                        console.log(`Client ${clientId} joined as: ${message.username}`);
                    }

                    // Notify others about new user
                    broadcast(clientId, {
                        type: 'user-joined',
                        userId: clientId,
                        username: message.username,
                        timestamp: Date.now()
                    });
                    break;

                case 'offer':
                    // Forward offer to target
                    if (message.to) {
                        sendToClient(message.to, {
                            type: 'offer',
                            from: clientId,
                            fromUsername: clients.get(clientId)?.username,
                            offer: message.offer,
                            timestamp: Date.now()
                        });
                    }
                    break;

                case 'answer':
                    // Forward answer to target
                    if (message.to) {
                        sendToClient(message.to, {
                            type: 'answer',
                            from: clientId,
                            answer: message.answer,
                            timestamp: Date.now()
                        });
                    }
                    break;

                case 'ice-candidate':
                    // Forward ICE candidate to target
                    if (message.to) {
                        sendToClient(message.to, {
                            type: 'ice-candidate',
                            from: clientId,
                            candidate: message.candidate,
                            timestamp: Date.now()
                        });
                    }
                    break;

                case 'chat-message':
                    // Forward chat message
                    if (message.recipient) {
                        // Private message
                        sendToClient(message.recipient, message);
                    } else {
                        // Broadcast to all
                        broadcast(clientId, message);
                    }
                    break;

                case 'status-update':
                    // Update user status
                    const userClient = clients.get(clientId);
                    if (userClient) {
                        userClient.status = message.status;
                    }

                    broadcast(clientId, {
                        type: 'user-status',
                        clientId,
                        status: message.status,
                        timestamp: Date.now()
                    });
                    break;

                case 'ping':
                    // Respond to ping with pong
                    ws.send(JSON.stringify({
                        type: 'pong',
                        timestamp: Date.now()
                    }));
                    break;

                default:
                    console.log(`Unknown message type: ${message.type}`);
            }
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    });

    ws.on('close', () => {
        console.log(`Client disconnected: ${clientId}`);

        clients.delete(clientId);

        // Notify others
        broadcast(clientId, {
            type: 'user-left',
            clientId,
            timestamp: Date.now()
        });

        console.log(`Total clients: ${clients.size}`);
    });

    ws.on('error', (error) => {
        console.error(`WebSocket error for ${clientId}:`, error);
    });
});

// Start server
server.listen(PORT, () => {
    console.log('===========================================');
    console.log(`Voice App Signaling Server`);
    console.log(`WebSocket server running on port ${PORT}`);
    console.log(`ws://localhost:${PORT}`);
    console.log('===========================================');
});

// Handle server errors
server.on('error', (error) => {
    console.error('Server error:', error);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, closing server...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, closing server...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});