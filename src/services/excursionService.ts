import { randomUUID } from 'node:crypto';
import { ExcursionRepository } from '../repositories/excursionRepository.js';
import type { Booking, BookingRequest, Difficulty, Excursion, ExcursionSearchCriteria, Port } from '../models.js';

export interface ExcursionDetail extends Excursion {
  port: Port | undefined;
  availableSeatsByDeparture: Record<string, number>;
}

export interface ExcursionRecommendation {
  excursionId: string;
  score: number;
  reasons: string[];
}

export interface GuestExcursionRecommendations {
  guestId: string;
  generatedAt: string;
  recommendations: ExcursionRecommendation[];
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

  listExcursions(filters?: { port?: string; difficulty?: Difficulty }): Excursion[] {
    return this.repository.listExcursions(filters);
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

  getRecommendations(guestId: string): GuestExcursionRecommendations {
    const excursionsByScore = this.repository
      .listExcursions()
      .map((excursion) => {
        const detail = this.withAvailability(excursion);
        const availableSeats = Object.values(detail.availableSeatsByDeparture);
        const hasAvailability = availableSeats.some((seats) => seats > 0);
        const isFamilyFriendly = excursion.tags.includes('family-friendly');
        const moderatePriceScore = Math.max(0, 1 - Math.abs(excursion.adultPrice - 130) / 130);
        const score = Number(
          (
            (hasAvailability ? 0.5 : 0) +
            (isFamilyFriendly ? 0.25 : 0) +
            moderatePriceScore * 0.25
          ).toFixed(2)
        );

        const reasons = [
          hasAvailability ? 'available during itinerary' : 'limited availability',
          isFamilyFriendly ? 'matches family-friendly preference' : 'matches guest activity interests',
          moderatePriceScore >= 0.7 ? 'moderately priced for this itinerary' : 'premium or value pricing option'
        ];

        return {
          excursionId: excursion.id,
          portCode: excursion.portCode,
          score,
          reasons
        };
      })
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }

        return a.excursionId < b.excursionId ? -1 : a.excursionId > b.excursionId ? 1 : 0;
      });

    const recommendations: ExcursionRecommendation[] = [];
    const seenPorts = new Set<string>();
    const recommendedExcursionIds = new Set<string>();

    for (const candidate of excursionsByScore) {
      if (!seenPorts.has(candidate.portCode)) {
        seenPorts.add(candidate.portCode);
        recommendedExcursionIds.add(candidate.excursionId);
        recommendations.push({
          excursionId: candidate.excursionId,
          score: candidate.score,
          reasons: candidate.reasons
        });
      }
    }

    for (const candidate of excursionsByScore) {
      if (!recommendedExcursionIds.has(candidate.excursionId)) {
        recommendedExcursionIds.add(candidate.excursionId);
        recommendations.push({
          excursionId: candidate.excursionId,
          score: candidate.score,
          reasons: candidate.reasons
        });
      }
    }

    return {
      guestId,
      generatedAt: new Date().toISOString(),
      recommendations
    };
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
}
