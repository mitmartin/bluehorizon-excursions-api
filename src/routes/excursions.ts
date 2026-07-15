import { Router } from 'express';
import { ExcursionService } from '../services/excursionService.js';
import type { Difficulty, ExcursionSortField, SortOrder } from '../models.js';

export const excursionsRouter = Router();
const service = new ExcursionService();

excursionsRouter.get('/', (req, res) => {
  const difficulty = typeof req.query.difficulty === 'string' ? (req.query.difficulty as Difficulty) : undefined;
  const port = typeof req.query.port === 'string' ? req.query.port : undefined;
  const sort = typeof req.query.sort === 'string' ? (req.query.sort as ExcursionSortField) : undefined;
  const order = typeof req.query.order === 'string' ? (req.query.order as SortOrder) : undefined;
  const limit = typeof req.query.limit === 'string' ? Number(req.query.limit) : undefined;
  const offset = typeof req.query.offset === 'string' ? Number(req.query.offset) : undefined;

  res.json({ data: service.listExcursions({ port, difficulty, sort, order, limit, offset }) });
});

excursionsRouter.get('/search', (req, res) => {
  const port = typeof req.query.port === 'string' ? req.query.port : undefined;
  const date = typeof req.query.date === 'string' ? req.query.date : undefined;
  const q = typeof req.query.q === 'string' ? req.query.q : undefined;
  const maxPrice = typeof req.query.maxPrice === 'string' ? Number(req.query.maxPrice) : undefined;

  res.json({ data: service.search({ port, date, maxPrice, q }) });
});

excursionsRouter.get('/:id', (req, res) => {
  const excursion = service.getExcursion(req.params.id);

  if (!excursion) {
    res.status(404).json({ error: 'Excursion not found' });
    return;
  }

  res.json({ data: excursion });
});
