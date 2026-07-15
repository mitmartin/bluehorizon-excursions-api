import { Router } from 'express';
import { ExcursionService } from '../services/excursionService.js';

export const portsRouter = Router();
const service = new ExcursionService();

portsRouter.get('/', (_req, res) => {
  res.json({ data: service.listPorts() });
});
