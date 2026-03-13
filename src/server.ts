import http from 'http';
import app from './app';
import { Server } from 'socket.io';
import { setupExportWS } from './websocket/exports';

const server = http.createServer(app);

// WebSocket Setup
const io = new Server(server, {
    cors: { origin: "*" }
});

setupExportWS(io);

const PORT = 8080;
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});