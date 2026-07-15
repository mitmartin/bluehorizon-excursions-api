import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { bookingsRouter } from './routes/bookings.js';
import { excursionsRouter } from './routes/excursions.js';
import { healthRouter } from './routes/health.js';
import { portsRouter } from './routes/ports.js';
import { errorHandler } from './middleware/errorHandler.js';

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/health', healthRouter);
app.use('/ports', portsRouter);
app.use('/excursions', excursionsRouter);
app.use('/bookings', bookingsRouter);

app.use(errorHandler);
