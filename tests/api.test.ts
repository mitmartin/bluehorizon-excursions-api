import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../src/app.js';

describe('Blue Horizon Excursions API', () => {
  it('returns a healthy status', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.service).toBe('bluehorizon-excursions-api');
  });

  it('lists ports of call', async () => {
    const response = await request(app).get('/ports');

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(6);
    expect(response.body.data.map((port: { code: string }) => port.code)).toContain('CZM');
  });

  it('lists excursions with a port filter', async () => {
    const response = await request(app).get('/excursions?port=NAS');

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(3);
    expect(response.body.data.every((excursion: { portCode: string }) => excursion.portCode === 'NAS')).toBe(true);
  });

  it('gets one excursion with availability by departure', async () => {
    const response = await request(app).get('/excursions/exc-nas-reef-01');

    expect(response.status).toBe(200);
    expect(response.body.data.title).toBe('Rainbow Reef Snorkel Safari');
    expect(response.body.data.availableSeatsByDeparture['dep-nas-reef-20260815-am']).toBe(40);
  });

  it('searches excursions by port and maximum price', async () => {
    const response = await request(app).get('/excursions/search?port=CZM&maxPrice=150');

    expect(response.status).toBe(200);
    expect(response.body.data.map((excursion: { id: string }) => excursion.id)).toEqual([
      'exc-czm-reef-01',
      'exc-czm-maya-02'
    ]);
  });

  it('returns ranked excursion recommendations for a guest', async () => {
    const response = await request(app).get('/excursions/recommendations?guestId=guest-1042');

    expect(response.status).toBe(200);
    expect(response.body.guestId).toBe('guest-1042');
    expect(response.body.generatedAt).toEqual(expect.any(String));
    expect(response.body.recommendations.length).toBeGreaterThan(0);
    expect(response.body.recommendations[0]).toEqual({
      excursionId: expect.any(String),
      score: expect.any(Number),
      reasons: expect.any(Array)
    });
    expect(response.body.recommendations[0].reasons).toContain('available during itinerary');
    expect(response.body.recommendations[0].reasons).toContain('matches family-friendly preference');
    expect(
      new Set(response.body.recommendations.map((recommendation: { excursionId: string }) => recommendation.excursionId))
        .size
    ).toBe(response.body.recommendations.length);
    expect(
      new Set(
        response.body.recommendations
          .slice(0, 6)
          .map((recommendation: { excursionId: string }) => recommendation.excursionId.split('-')[1])
      ).size
    ).toBe(6);
  });

  it('returns 400 when recommendations guestId is missing', async () => {
    const response = await request(app).get('/excursions/recommendations');

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('guestId query parameter is required');
  });

  it('creates a booking for a valid request', async () => {
    const response = await request(app)
      .post('/bookings')
      .send({
        excursionId: 'exc-stt-sail-01',
        departureId: 'dep-stt-sail-20260820-am',
        guestId: 'guest-1042',
        guestName: 'Avery Morgan',
        partySize: 2
      });

    expect(response.status).toBe(201);
    expect(response.body.data.status).toBe('confirmed');
    expect(response.body.data.partySize).toBe(2);
  });

  it.todo('returns excursions on the requested local date regardless of server timezone');
  it.todo('returns 400 instead of 500 for invalid booking payloads');
});
