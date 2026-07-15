import { randomUUID } from 'node:crypto';
import { ExcursionRepository } from '../repositories/excursionRepository.js';
import type { Booking, BookingRequest, Excursion, ExcursionListOptions, ExcursionSearchCriteria, Port } from '../models.js';

export interface ExcursionDetail extends Excursion {
  port: Port | undefined;
  availableSeatsByDeparture: Record<string, number>;
}

export class ExcursionService {
  constructor(private readonly repository = new ExcursionRepository()) {}

  getHealth() {
    return {
      status: 'ok',
      service: 'bluehorizon-excursions-api',
      version: '1.0.0',
      uptimeSeconds: Math.round(process.uptime())
    };
  }

  listPorts(): Port[] {
    return this.repository.listPorts();
  }

  listExcursions(filters?: ExcursionListOptions): Excursion[] {
    let results = this.repository.listExcursions(filters);

    if (filters?.sort) {
      const direction = filters.order === 'desc' ? -1 : 1;

      results = [...results].sort((left, right) => {
        const leftValue = this.getSortValue(left, filters.sort!);
        const rightValue = this.getSortValue(right, filters.sort!);

        if (leftValue < rightValue) {
          return -1 * direction;
        }

        if (leftValue > rightValue) {
          return direction;
        }

        return 0;
      });
    }

    if (filters?.limit !== undefined || filters?.offset !== undefined) {
      const offset = filters.offset ?? 0;
      const end = filters.limit === undefined ? undefined : offset + filters.limit + 1;
      results = results.slice(offset, end);
    }

    return results;
  }

  getExcursion(id: string): ExcursionDetail | undefined {
    const excursion = this.repository.getExcursionById(id);
    if (!excursion) {
      return undefined;
    }

    return this.withAvailability(excursion);
  }

  search(criteria: ExcursionSearchCriteria): ExcursionDetail[] {
    const keywordMatcher = criteria.q ? new RegExp(criteria.q, 'i') : undefined;

    return this.repository.listExcursions().filter((excursion) => {
      const port = this.repository.getPort(excursion.portCode);
      const matchesPort = !criteria.port || excursion.portCode.toLowerCase() === criteria.port.toLowerCase();
      const matchesDate = !criteria.date || this.hasDepartureOnDate(excursion, criteria.date);
      const matchesPrice = criteria.maxPrice === undefined || excursion.adultPrice <= criteria.maxPrice;
      const searchBlob = `${excursion.title} ${excursion.description} ${excursion.tags.join(' ')} ${port?.name ?? ''}`;
      const matchesKeyword = !keywordMatcher || keywordMatcher.test(searchBlob);

      return matchesPort && matchesDate && matchesPrice && matchesKeyword;
    }).map((excursion) => this.withAvailability(excursion));
  }

  createBooking(request: BookingRequest): Booking {
    const excursion = this.repository.getExcursionById(request.excursionId);
    const departure = excursion?.departures.find((candidate) => candidate.id === request.departureId);
    const bookedSeats = this.repository
      .listBookingsForDeparture(request.excursionId, request.departureId)
      .reduce((total, booking) => total + booking.partySize, 0);

    const availableSeats = excursion!.capacity - bookedSeats;

    if (!departure) {
      throw new Error(`Departure ${request.departureId} does not exist for excursion ${request.excursionId}`);
    }

    if (request.partySize > availableSeats) {
      throw new Error(`Only ${availableSeats} seats are available for ${departure.id}`);
    }

    return this.repository.createBooking({
      id: randomUUID(),
      excursionId: request.excursionId,
      departureId: request.departureId,
      guestId: request.guestId,
      guestName: request.guestName,
      partySize: request.partySize,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    });
  }

  private withAvailability(excursion: Excursion): ExcursionDetail {
    const availableSeatsByDeparture = Object.fromEntries(
      excursion.departures.map((departure) => {
        const bookedSeats = this.repository
          .listBookingsForDeparture(excursion.id, departure.id)
          .reduce((total, booking) => total + booking.partySize, 0);

        return [departure.id, excursion.capacity - bookedSeats];
      })
    );

    return {
      ...excursion,
      port: this.repository.getPort(excursion.portCode),
      availableSeatsByDeparture
    };
  }

  private hasDepartureOnDate(excursion: Excursion, date: string): boolean {
    const requestedDate = new Date(date);

    return excursion.departures.some((departure) => {
      const departureDate = new Date(departure.startsAt);
      return departureDate.toDateString() === requestedDate.toDateString();
    });
  }

  private getSortValue(excursion: Excursion, sort: ExcursionListOptions['sort']): string | number {
    if (sort === 'durationMinutes') {
      return Math.min(...excursion.departures.map((departure) => departure.durationMinutes));
    }

    if (sort === 'adultPrice') {
      return excursion.adultPrice;
    }

    return excursion.title;
  }
}
