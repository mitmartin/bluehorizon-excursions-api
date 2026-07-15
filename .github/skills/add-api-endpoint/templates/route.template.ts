import { Router } from 'express';
import { ExcursionService } from '../services/excursionService.js';

// Template: one Router per resource. Replace <resource> and the handlers.
// Mount in src/app.ts:  app.use('/<resource>', <resource>Router);
export const resourceRouter = Router();
const service = new ExcursionService();

resourceRouter.get('/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id || id.trim().length === 0) {
      res.status(400).json({ error: 'id is required' });
      return;
    }

    const result = service.getExcursion(id);
    if (!result) {
      res.status(404).json({ error: 'not found' });
      return;
    }

    res.json({ data: result });
  } catch (err) {
    next(err);
  }
});
