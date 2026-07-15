import type { Excursion } from '../models.js';

export function calculateBookingTotal(excursion: Excursion, partySize: number): number {
  const subtotal = excursion.adultPrice * partySize;
  const discountedSubtotal = partySize >= 4 ? subtotal * 0.9 : subtotal;

  return discountedSubtotal * 1.075;
}
