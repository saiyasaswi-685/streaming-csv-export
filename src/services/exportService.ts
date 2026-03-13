import { Client } from 'pg';
import Cursor from 'pg-cursor';
import { createWriteStream, statSync, unlinkSync } from 'fs';
import { redisClient } from '../config/redis';
import { ExportProgress } from '../models/types';

export const processExport = async (exportId: string) => {
    const startTime = Date.now();
    const client = new Client(process.env.DATABASE_URL);
    let isCancelled = false;
    let isFinished = false;

    // 1. Separate Subscriber Client (Requirement 10)
    const subClient = redisClient.duplicate();
    
    try {
        await subClient.connect();
        await subClient.subscribe(`export-action:${exportId}`, (message) => {
            if (message === 'cancel') {
                isCancelled = true;
                console.log(`❌ Cancel signal received for: ${exportId}`);
            }
        });

        await client.connect();
        const cursor = client.query(new Cursor('SELECT * FROM users'));
        const totalRows = 100000; 
        let processedRows = 0;

        const filePath = `./exports/export-${exportId}.csv`;
        const stream = createWriteStream(filePath);
        stream.write("id,name,email,created_at\n");

        // Helper function for safe cleanup
        const cleanup = async () => {
            if (isFinished) return;
            isFinished = true;
            
            stream.end();
            await client.end();
            if (subClient.isOpen) {
                await subClient.unsubscribe();
                await subClient.quit();
            }
        };

        const readRows = () => {
            // 2. CHECK: Stop recursion if cancelled (Requirement 10)
            if (isCancelled) {
                const cancelMsg = { 
                    exportId, 
                    status: 'cancelled', 
                    timestamp: new Date().toISOString() 
                };
                
                redisClient.publish(`export-progress:${exportId}`, JSON.stringify(cancelMsg))
                    .then(() => cleanup());

                try { unlinkSync(filePath); } catch (e) {}
                console.log(`🛑 Export ${exportId} cancelled and resources freed.`);
                return; 
            }

            cursor.read(10000, async (err, rows) => {
                if (err) {
                    console.error("Cursor Read Error:", err);
                    handleError("Database read error");
                    return;
                }

                // 3. Status: Completed (Requirement 8)
                if (rows.length === 0) {
                    const stats = statSync(filePath);
                    const finalMsg: Partial<ExportProgress> = {
                        exportId,
                        status: 'completed',
                        downloadUrl: `/api/exports/${exportId}/download`,
                        fileSize: stats.size,
                        timestamp: new Date().toISOString()
                    };
                    await redisClient.publish(`export-progress:${exportId}`, JSON.stringify(finalMsg));
                    await cleanup();
                    return;
                }

                // Write rows to CSV
                rows.forEach(row => {
                    stream.write(`${row.id},${row.name},${row.email},${row.created_at}\n`);
                    processedRows++;
                });

                // 4. Progress & ETA (Requirement 7)
                const elapsed = (Date.now() - startTime) / 1000;
                const speed = processedRows / elapsed;
                const eta = Math.round((totalRows - processedRows) / speed);

                const progressUpdate: ExportProgress = {
                    exportId,
                    status: 'processing',
                    progress: {
                        total: totalRows,
                        processed: processedRows,
                        percentage: Math.min(Math.round((processedRows / totalRows) * 100), 99),
                        etaSeconds: eta
                    },
                    timestamp: new Date().toISOString()
                };

                await redisClient.publish(`export-progress:${exportId}`, JSON.stringify(progressUpdate));
                
                // Recursive call for next batch
                readRows(); 
            });
        };

        const handleError = async (reason: string) => {
            const errorMsg = { 
                exportId, 
                status: 'failed', 
                error: reason, 
                timestamp: new Date().toISOString() 
            };
            await redisClient.publish(`export-progress:${exportId}`, JSON.stringify(errorMsg));
            await cleanup();
        };

        readRows();

    } catch (error) {
        console.error(`Critical Error in export ${exportId}:`, error);
        // Requirement 11: Failure status
        const errorMsg = { exportId, status: 'failed', error: 'Internal Server Error' };
        await redisClient.publish(`export-progress:${exportId}`, JSON.stringify(errorMsg));
        
        // Final fallback cleanup
        await client.end().catch(() => {});
        if (subClient.isOpen) await subClient.quit().catch(() => {});
    }
};