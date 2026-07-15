import type { Port } from '../models.js';

export const ports: Port[] = [
  {
    code: 'NAS',
    name: 'Nassau',
    country: 'Bahamas',
    timezone: 'America/Nassau',
    arrivalTime: '2026-08-15T07:00:00-04:00',
    departureTime: '2026-08-15T17:00:00-04:00'
  },
  {
    code: 'CZM',
    name: 'Cozumel',
    country: 'Mexico',
    timezone: 'America/Cancun',
    arrivalTime: '2026-08-17T08:00:00-05:00',
    departureTime: '2026-08-17T18:00:00-05:00'
  },
  {
    code: 'STT',
    name: 'Charlotte Amalie',
    country: 'U.S. Virgin Islands',
    timezone: 'America/St_Thomas',
    arrivalTime: '2026-08-20T08:00:00-04:00',
    departureTime: '2026-08-20T17:30:00-04:00'
  },
  {
    code: 'SJU',
    name: 'San Juan',
    country: 'Puerto Rico',
    timezone: 'America/Puerto_Rico',
    arrivalTime: '2026-08-21T07:30:00-04:00',
    departureTime: '2026-08-21T16:00:00-04:00'
  },
  {
    code: 'GCM',
    name: 'George Town',
    country: 'Cayman Islands',
    timezone: 'America/Cayman',
    arrivalTime: '2026-08-23T09:00:00-05:00',
    departureTime: '2026-08-23T17:00:00-05:00'
  },
  {
    code: 'BZE',
    name: 'Belize City',
    country: 'Belize',
    timezone: 'America/Belize',
    arrivalTime: '2026-08-25T08:00:00-06:00',
    departureTime: '2026-08-25T17:30:00-06:00'
  }
];
