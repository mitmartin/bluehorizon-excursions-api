export type Difficulty = 'easy' | 'moderate' | 'active';

export interface Port {
  code: string;
  name: string;
  country: string;
  timezone: string;
  arrivalTime: string;
  departureTime: string;
}

export interface ExcursionDeparture {
  id: string;
  startsAt: string;
  durationMinutes: number;
}

export interface Excursion {
  id: string;
  portCode: string;
  title: string;
  description: string;
  adultPrice: number;
  childPrice: number;
  currency: 'USD';
  difficulty: Difficulty;
  tags: string[];
  capacity: number;
  departures: ExcursionDeparture[];
}

export interface Booking {
  id: string;
  excursionId: string;
  departureId: string;
  guestId: string;
  guestName: string;
  partySize: number;
  status: 'confirmed' | 'waitlisted' | 'cancelled';
  createdAt: string;
}

export interface BookingRequest {
  excursionId: string;
  departureId: string;
  guestId: string;
  guestName: string;
  partySize: number;
}

export interface ExcursionSearchCriteria {
  port?: string;
  date?: string;
  maxPrice?: number;
  q?: string;
}
