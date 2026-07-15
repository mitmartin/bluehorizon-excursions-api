import { Router } from 'express';
import { ExcursionService } from '../services/excursionService.js';

export const healthRouter = Router();
const service = new ExcursionService();

healthRouter.get('/', (_req, res) => {
  res.json(service.getHealth());
});
