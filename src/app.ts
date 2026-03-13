import express from 'express';
import cors from 'cors';
import path from 'path'; // Path module add cheyyali
import { exportRouter } from './controllers/exportController';

const app = express();

app.use(cors());
app.use(express.json());

// 1. Static files serve cheyadaniki (CSS/JS emaina unte)
app.use(express.static(path.join(__dirname, '../')));

// 2. Root route (/) ki index.html pampali
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

// Existing routes
app.use('/api/exports', exportRouter);
app.get('/health', (req, res) => res.sendStatus(200));

export default app;