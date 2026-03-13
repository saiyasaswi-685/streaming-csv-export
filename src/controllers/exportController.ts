import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { processExport } from '../services/exportService';

export const exportRouter = Router();

// Requirement 4: Start Export
exportRouter.post('/', async (req, res) => {
    const exportId = uuidv4();
    // Background lo run avvali, await cheyoddu
    processExport(exportId); 
    res.status(202).json({ exportId });
});

// Requirement 9: Download CSV
exportRouter.get('/:exportId/download', (req, res) => {
    const { exportId } = req.params;
    const filePath = `./exports/export-${exportId}.csv`;
    res.download(filePath);
});