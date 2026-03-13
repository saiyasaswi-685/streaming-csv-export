import { Server } from 'socket.io';
import { redisClient } from '../config/redis';

export const setupExportWS = (io: Server) => {
    // Client connect ayinappudu
    io.on('connection', async (socket) => {
        const exportId = socket.handshake.query.exportId as string;
        
        if (exportId) {
            console.log(`Client connected for export: ${exportId}`);
            
            // 1. Requirement 10: Listen for cancel action from Frontend
            socket.on('action', async (msg) => {
                if (msg.action === 'cancel') {
                    console.log(`Sending cancel signal to Redis for: ${exportId}`);
                    // ExportService ki signal pampisthunnam
                    await redisClient.publish(`export-action:${exportId}`, 'cancel');
                }
            });

            // Redis nunchi updates subscribe cheskovali
            const subscriber = redisClient.duplicate();
            await subscriber.connect();

            await subscriber.subscribe(`export-progress:${exportId}`, (message) => {
                socket.emit('progress', JSON.parse(message));
            });

            socket.on('disconnect', () => {
                console.log(`Client disconnected from export: ${exportId}`);
                subscriber.quit();
            });
        }

        // Heartbeat mechanism (Requirement 12)
        socket.on('ping', () => socket.emit('pong'));
    });
};