import { Router } from 'express';
import { ExcursionService } from '../services/excursionService.js';
import type { BookingRequest } from '../models.js';

export const bookingsRouter = Router();
const service = new ExcursionService();

bookingsRouter.post('/', (req, res, next) => {
  try {
    const booking = service.createBooking(req.body as BookingRequest);
    res.status(201).json({ data: booking });
  } catch (error) {
    next(error);
  }
});
