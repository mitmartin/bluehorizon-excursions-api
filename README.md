# Blue Horizon Excursions API

A realistic brownfield REST API for the fictional **Blue Horizon Cruise Line**. The API manages shore excursions, ports, and simple bookings for agentic DevOps enablement demos.

This repository intentionally contains a small set of realistic, documented issues so presenters can demonstrate:

- GitHub Copilot coding agent: assign an issue and let the agent open a PR.
- Agentic PR review against a focused change.
- GitHub Actions CI on push and pull requests.
- CodeQL / GitHub Advanced Security code scanning for JavaScript and TypeScript.

## Ecosystem context

This service is one member of the fictional Blue Horizon demo ecosystem:

- `bluehorizon-platform` — organization brain and integration hub.
- `bluehorizon-concierge-agent` — greenfield concierge agent that will call this API.
- `bluehorizon-legacy-booking` — legacy .NET booking system.

Only this API is implemented in this repository.

## Tech stack

- Node.js + TypeScript
- Express
- In-memory JSON-style data store
- Vitest + Supertest
- ESLint
- GitHub Actions CI
- CodeQL workflow

## Getting started

```powershell
npm install
npm run build
npm test
npm run lint
npm run dev
```

The API defaults to port `3000`.

```powershell
Invoke-RestMethod http://localhost:3000/health
Invoke-RestMethod http://localhost:3000/excursions
Invoke-RestMethod 'http://localhost:3000/excursions/search?port=NAS&date=2026-08-15&maxPrice=175'
```

## API routes

### `GET /health`

Returns service status, uptime, and demo metadata.

### `GET /ports`

Returns available ports of call.

### `GET /excursions`

Returns all shore excursions. Optional query parameters:

- `port` — port code, such as `NAS`, `CZM`, or `STT`.
- `difficulty` — `easy`, `moderate`, or `active`.

### `GET /excursions/:id`

Returns one excursion by ID, including availability and port details.

### `GET /excursions/search`

Searches excursions with filters:

- `port` — port code.
- `date` — calendar date in `YYYY-MM-DD` format.
- `maxPrice` — maximum adult price.
- `q` — keyword search across title, description, and tags.

Example:

```http
GET /excursions/search?port=CZM&date=2026-08-17&maxPrice=150&q=reef
```

### `GET /excursions/recommendations`

Returns ranked excursion recommendations for a guest.

- Required query parameter: `guestId`
- Returns `400` when `guestId` is missing.

Example:

```http
GET /excursions/recommendations?guestId=guest-1042
```

Response shape:

```json
{
  "guestId": "guest-1042",
  "generatedAt": "2026-07-14T23:45:35.730-04:00",
  "recommendations": [
    {
      "excursionId": "exc-stt-sail-01",
      "score": 0.91,
      "reasons": ["matches family-friendly preference", "available during itinerary"]
    }
  ]
}
```

### `POST /bookings`

Creates a booking.

```json
{
  "excursionId": "exc-nas-reef-01",
  "guestId": "guest-1042",
  "guestName": "Avery Morgan",
  "partySize": 2,
  "departureId": "dep-nas-reef-20260815-am"
}
```

Returns `201 Created` and the booking record.

## Brownfield demo notes

The codebase intentionally includes seeded product, quality, performance, and security issues. They are documented as GitHub issues with file and line references so a Copilot coding agent has clear targets.
