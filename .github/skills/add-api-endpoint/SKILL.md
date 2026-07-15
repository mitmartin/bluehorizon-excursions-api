---
name: add-api-endpoint
description: Use to add a new REST endpoint to the Blue Horizon excursions API following the repo's conventions (Express Router, service layer, { data } envelope, and a Vitest test). Scaffolds route + wiring + test.
---

# Add API Endpoint

Use this skill when the user asks to add a new endpoint or route to the excursions API — for example, "add a GET /ports/:code/excursions endpoint" or "add an endpoint that returns excursions near a port."

## When to use
- Adding any new HTTP route to this service.
- Extending an existing resource with a sub-route.

## Conventions this repo follows (match them exactly)
- **ESM imports** with explicit `.js` extensions (e.g., `import { ExcursionService } from '../services/excursionService.js';`).
- One `Router` per resource in `src/routes/<resource>.ts`; mounted in `src/app.ts` with `app.use('/<resource>', <resource>Router)`.
- Business logic lives in `src/services/*` and data access in `src/repositories/*` — **do not** put logic in the route handler.
- Successful responses use the envelope `res.json({ data: ... })`. Not-found returns `404`. Invalid input returns `400` (throw a domain error handled by `src/middleware/errorHandler.ts`).
- Validate and sanitize all inputs at the boundary. Never use an unbounded user value directly in a filter or slice.
- Use the cruise-domain glossary (port of call, shore excursion, sailing, booking).

## Steps
1. Clarify the method, path, inputs, and response shape with the user if ambiguous.
2. Add the service method(s) to the appropriate `src/services/*.ts` (and repository method if new data access is needed). Keep it typed — no `any`.
3. Create or extend the route using [templates/route.template.ts](./templates/route.template.ts) at `src/routes/<resource>.ts`.
4. Wire it in `src/app.ts` if it's a new resource.
5. Add a test using [templates/route.test.template.ts](./templates/route.test.template.ts) into `tests/` — cover the success path, a validation failure (400), and a not-found (404) where applicable.
6. Run `npm run build && npm test && npm run lint` and confirm green before finishing.

## Output
The new/updated route, service, wiring, and a passing test. Report the endpoint, files changed, and the commands you ran.
