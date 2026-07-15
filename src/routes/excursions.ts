import { Router } from 'express';
import { ExcursionService } from '../services/excursionService.js';
import type { Difficulty } from '../models.js';

export const excursionsRouter = Router();
const service = new ExcursionService();

excursionsRouter.get('/', (req, res) => {
  const difficulty = typeof req.query.difficulty === 'string' ? (req.query.difficulty as Difficulty) : undefined;
  const port = typeof req.query.port === 'string' ? req.query.port : undefined;

  res.json({ data: service.listExcursions({ port, difficulty }) });
});

excursionsRouter.get('/search', (req, res) => {
  const port = typeof req.query.port === 'string' ? req.query.port : undefined;
  const date = typeof req.query.date === 'string' ? req.query.date : undefined;
  const q = typeof req.query.q === 'string' ? req.query.q : undefined;
  const maxPrice = typeof req.query.maxPrice === 'string' ? Number(req.query.maxPrice) : undefined;

  res.json({ data: service.search({ port, date, maxPrice, q }) });
});

excursionsRouter.get('/recommendations', (req, res) => {
  const guestId = typeof req.query.guestId === 'string' ? req.query.guestId.trim() : '';

  if (!guestId) {
    res.status(400).json({ error: 'guestId query parameter is required' });
    return;
  }

  res.json(service.getRecommendations(guestId));
});

excursionsRouter.get('/:id', (req, res) => {
  const excursion = service.getExcursion(req.params.id);

  if (!excursion) {
    res.status(404).json({ error: 'Excursion not found' });
    return;
  }

  res.json({ data: excursion });
});
