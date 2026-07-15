import { excursions } from '../data/excursions.js';
import { ports } from '../data/ports.js';
import type { Booking, Difficulty, Excursion, Port } from '../models.js';

const bookings: Booking[] = [
  {
    id: 'book-seed-1001',
    excursionId: 'exc-nas-reef-01',
    departureId: 'dep-nas-reef-20260815-am',
    guestId: 'guest-1001',
    guestName: 'Jordan Lee',
    partySize: 4,
    status: 'confirmed',
    createdAt: '2026-07-01T14:20:00.000Z'
  },
  {
    id: 'book-seed-1002',
    excursionId: 'exc-czm-reef-01',
    departureId: 'dep-czm-reef-20260817-am',
    guestId: 'guest-1002',
    guestName: 'Riley Chen',
    partySize: 2,
    status: 'confirmed',
    createdAt: '2026-07-04T18:05:00.000Z'
  }
];

export class ExcursionRepository {
  listPorts(): Port[] {
    return ports;
  }

  getPort(code: string): Port | undefined {
    return ports.find((port) => port.code.toLowerCase() === code.toLowerCase());
  }

  listExcursions(filters?: { port?: string; difficulty?: Difficulty }): Excursion[] {
    return excursions.filter((excursion) => {
      const matchesPort = !filters?.port || excursion.portCode.toLowerCase() === filters.port.toLowerCase();
      const matchesDifficulty = !filters?.difficulty || excursion.difficulty === filters.difficulty;
      return matchesPort && matchesDifficulty;
    });
  }

  getExcursionById(id: string): Excursion | undefined {
    return excursions.find((excursion) => excursion.id === id);
  }

  listBookingsForDeparture(excursionId: string, departureId: string): Booking[] {
    return bookings.filter(
      (booking) =>
        booking.excursionId === excursionId &&
        booking.departureId === departureId &&
        booking.status === 'confirmed'
    );
  }

  createBooking(booking: Booking): Booking {
    bookings.push(booking);
    return booking;
  }
}
