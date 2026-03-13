import express from 'express';
import cors from 'cors';
import { exportRouter } from './controllers/exportController';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/exports', exportRouter);
app.get('/health', (req, res) => res.sendStatus(200));

export default app;