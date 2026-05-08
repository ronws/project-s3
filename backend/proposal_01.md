# Proposal 01: Refactor `gemini-flash-api` from Legacy Spike to Production-Ready Structure

## Context

`gemini-flash-api` is a prototype Express.js REST API wrapping Google Gemini 2.5 Flash. The entire application lives in a single 118-line `index.js` file. It works for its narrow use case but carries significant technical debt across security, architecture, operations, and maintainability. This proposal outlines a structured, staged refactor to production-ready status, adopting patterns validated by the `scout` agent framework (`~/.openclaw/workspace-gh0st/agents/scout/`).

---

## A. Current State Assessment

### What We Have

| Component | Current State |
|---|---|
| **Source** | 1 file: `index.js` (118 lines) |
| **Language** | JavaScript (ESM) |
| **Framework** | Express 5.2.1 |
| **AI SDK** | `@google/genai` 1.52.0 |
| **Endpoints** | 5 (text, image, document, audio, chat) |
| **Testing** | None |
| **Type Safety** | None |
| **Port** | Hardcoded 4443 |

### Critical Issues

1. **Exposed API key** — `GOOGLE_API_KEY` in `.env` is NOT in `.gitignore`
2. **No middleware stack** — No logging, error handling, CORS, rate limiting, or validation
3. **Top-level await side effect** — `ai.models.list()` runs at module initialization
4. **Hardcoded magic strings** — Model name, Indonesian prompts scattered in handlers
5. **No health checks** — No `/health`, `/live`, or `/ready` endpoints
6. **No request timeout** — Gemini calls could hang indefinitely
7. **Inconsistent error responses** — Inline try/catch returns different shapes per route

### Technical Debt Summary

- Monolithic single-file (no separation of concerns)
- Duplicated try/catch + response formatting in every route
- No `.gitignore`, `.env.example`, or config templates
- No TypeScript, no type safety
- No tests, no CI/CD
- No Docker, no containerization
- `upload/` directory is empty and unused
- No request correlation IDs or structured logging

---

## B. Reference Architecture: `scout` Agent Framework Patterns

The `scout` framework at `~/.openclaw/workspace-gh0st/agents/scout/` provides well-validated patterns for a TypeScript/Express translation:

### Error Architecture (`scout/src/api/core/exceptions.py` + `middleware/errors.py`) {#error-architecture}
```
APIException (base)
  └── BadRequestException (400)
  └── UnauthorizedException (401)
  └── ForbiddenException (403)
  └── NotFoundException (404)
  └── ConflictException (409)
  └── ValidationException (422)
  └── RateLimitException (429)
  └── InternalServerException (500)
  └── ServiceUnavailableException (503)
```
Each carries `error_code`, `message`, `details`, `headers`. Three handlers:
- `APIException` → formatted JSON with request_id
- `RequestValidationError` → 422 with field-level errors
- generic `Exception` → 500 sanitized

### Response Standardization (`scout/src/api/core/responses.py`)
All responses follow a consistent shape:
```python
# Success: {success: True, data, message, timestamp, request_id}
# Error: {success: False, error_code, message, details, timestamp, request_id}
```

### Request Logging (`scout/src/api/middleware/logging.py`)
- Generates `uuid[:8]` as `request_id`
- Stores on `request.state.request_id`
- Adds `X-Request-ID`, `X-Response-Time` headers to response
- Logs: `{request_id} METHOD /path - Client: IP`
- Logs: `{request_id} METHOD /path - Status: N - Duration: Ns`

### CORS Middleware (`scout/src/api/middleware/cors.py`)
- Configurable `allowed_origins`
- Exposes custom headers: `X-Request-ID`, `X-Response-Time`

### Health Routes (`scout/src/api/routes/health.py`)
- `/health` — basic liveness (status, agent, version, uptime, timestamp)
- `/live` — k8s liveness probe (alive: true)
- `/ready` — k8s readiness probe with dependency checks (db, cache, llm, config, storage)
- `/metrics` — Prometheus-compatible metrics endpoint

### App Factory Pattern (`scout/src/main.py`)
- `create_app()` returns FastAPI app — all wiring in one place
- `@asynccontextmanager lifespan` for startup/shutdown lifecycle
- `main()` programmatically starts uvicorn

### Config Pattern (`scout/src/config/core.py` + `schema.py`)
- Loads `.env` via dotenv
- Loads `config.yaml` (YAML) with dot-access properties
- Dev override via `config.dev.yaml` + `SCOUT_DEV` env var
- Pydantic-validated schema models

---

## C. Target State

A TypeScript-based Express API with:

- Clean project structure (`src/` with routes, services, middleware, types, utils)
- Singleton `GeminiService` encapsulating all AI interaction logic
- Global error handling middleware with typed `AppError` subclasses
- Request logging with correlation IDs (`X-Request-ID`, `X-Response-Time` headers)
- Zod request validation per endpoint
- Type-safe config management via zod
- Health check endpoints (`/health`, `/live`, `/ready`)
- Graceful shutdown handling
- Unit + integration tests (Vitest)
- Docker + docker-compose for local dev
- `.env.example` template, `.env` in `.gitignore`
- Production-ready operational defaults
- Consistent response shape across all endpoints

---

## D. Proposed Architecture

```
gemini-flash-api/
├── src/
│   ├── index.ts                 # Entry point — server bootstrap + graceful shutdown
│   ├── app.ts                  # Express app factory (no .listen())
│   ├── config/
│   │   └── index.ts            # Typed environment config (zod)
│   ├── routes/
│   │   ├── index.ts            # Route aggregation
│   │   ├── generate-text.ts
│   │   ├── generate-from-image.ts
│   │   ├── generate-from-document.ts
│   │   ├── generate-from-audio.ts
│   │   ├── chat.ts             # /api/chat — conversational context
│   │   └── health.ts           # /health, /live, /ready
│   ├── services/
│   │   └── gemini.service.ts   # GeminiService (AI client + all generation methods)
│   ├── middleware/
│   │   ├── error-handler.ts    # Global error handling + 3 exception handlers
│   │   ├── request-logger.ts   # Request logging + correlation ID
│   │   ├── cors.ts             # CORS configuration
│   │   └── not-found.ts        # 404 handler
│   ├── types/
│   │   ├── index.ts            # TypeScript interfaces + SDK type re-exports
│   │   └── gemini.ts           # Gemini SDK types: Content, Part, Candidate, etc.
│   ├── storage/                # File-based persistence
│   │   ├── session-store.ts    # SessionStore class — CRUD for chat sessions
│   │   └── sessions/           # Per-session JSON files
│   │       ├── collection.json  # Index: UUID → metadata, no history
│   │       └── {uuid}.json     # Per-session: full history
│   └── __tests__/
│       ├── services/
│       │   └── gemini.service.test.ts
│       └── routes/
│           └── generate-text.test.ts
├── config/
│   ├── .env.example
│   └── .env.docker
├── docker/
│   └── Dockerfile
├── docker-compose.yml
├── .gitignore
├── .env                         # local only — NEVER committed
├── tsconfig.json
├── vitest.config.ts
├── package.json
└── README.md
```

---

## E. Key Architectural Decisions

### Error Architecture
Adopting scout's typed exception hierarchy:
```typescript
// src/utils/errors.ts
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public errorCode: string,
    public message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }
}
// Subclasses: BadRequestError, NotFoundError, InternalServerError, etc.
```
Global error handler in `src/middleware/error-handler.ts` handles three cases:
1. `AppError` → structured JSON `{success: false, error_code, message, details, timestamp, request_id}`
2. `ZodError` → 422 with field-level validation errors
3. `Error` → 500 with sanitized message (no stack traces)

### Response Standardization
```typescript
// src/utils/responses.ts
// Success: { success: true, data, message?, timestamp, request_id? }
// Error: { success: false, error_code, message, details?, timestamp, request_id? }
// Paginated: { success: true, data, meta: { page, per_page, total, ... }, timestamp, request_id? }
```

### Request Logging + Correlation IDs
```typescript
// src/middleware/request-logger.ts
// - Generates uuid[:8] as request ID
// - Stores on req.state.requestId
// - Adds X-Request-ID, X-Response-Time to response headers
// - Logs: [requestId] METHOD /path - Status: N - Duration: Ns
```

### CORS Middleware
```typescript
// src/middleware/cors.ts
// - Configurable via CORS_ORIGINS env var (comma-separated)
// - Exposes X-Request-ID, X-Response-Time headers
// - allow_credentials: true, allow_methods: "*", allow_headers: "*"
```

### Health Routes
```
/health  → { status: "ok", service, version, uptime, timestamp }
/live    → { alive: true, timestamp }
/ready   → { ready: bool, checks: { gemini: bool, config: bool }, message }
```

### Config Management
Typed config using zod (no YAML for MVP — dotenv is sufficient for this app's complexity):
```typescript
// src/config/index.ts
import { z } from 'zod';

const configSchema = z.object({
  GOOGLE_API_KEY: z.string().min(1),
  PORT: z.coerce.number().default(4443),
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  CORS_ORIGINS: z.string().default('*'),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash'),
  REQUEST_TIMEOUT_MS: z.coerce.number().default(60000),
  SESSION_TTL_SECONDS: z.coerce.number().default(3600),
});

export const config = configSchema.parse(process.env);
```

### Chat Endpoint (`/api/chat`)
Conversational context endpoint — maintains chat history across multiple turns. Based on the SDK's `ContentListUnion` pattern (multi-turn conversation):
```typescript
// POST /api/chat
// Body: { message: string, history?: ChatTurn[] }
// Response: { reply: string }

// ChatTurn: { role: "user" | "model", text: string }  (mirrors SDK Content type)
// - history is optional; if provided, prior turns are prepended to contents
// - GeminiService.generateFromChat() builds Content[] from history + new message
// - SDK reference: JSON-SCHEMA.md §"Multi-turn Conversation" example
```

### Session Storage
File-based persistence for `/api/chat` sessions. No Redis or database needed — JSON files on disk.

**Directory structure:**
```
src/storage/sessions/
├── collection.json          ← index (UUID → metadata only, no history)
└── {uuid}.json             ← per-session file with full history
```

**`collection.json` schema (index only):**
```json
{
  "version": "1.0",
  "updated_at": "ISO timestamp",
  "sessions": {
    "{uuid}": { "created_at": "...", "last_active": "...", "message_count": N }
  }
}
```

**Per-session `{uuid}.json` schema:**
```json
{
  "session_id": "uuid",
  "created_at": "ISO timestamp",
  "last_active": "ISO timestamp",
  "ttl_seconds": 3600,
  "history": [
    { "role": "user", "text": "Hello", "timestamp": "..." },
    { "role": "model", "text": "Hi!", "timestamp": "..." }
  ]
}
```

**SessionStore class:**
```typescript
// src/storage/session-store.ts
class SessionStore {
  constructor(sessionsDir: string, defaultTtlSeconds: number)

  async create(message: string): Promise<Session>
  async append(sessionId: string, role: Role, text: string): Promise<Session>
  async get(sessionId: string): Promise<Session | null>
  async delete(sessionId: string): Promise<void>
  async cleanupExpired(): Promise<number>  // returns count deleted
}
```

**TTL strategy:** Sessions expire after `ttl_seconds` of inactivity. `cleanupExpired()` runs on server startup and optionally on a timer. Default TTL configurable via `SESSION_TTL_SECONDS` env var.

### File Handling
Multer memory storage → `FileUtils` class handles MIME detection and base64 encoding. No disk writes needed for MVP.

### Dependency Injection
`GeminiService` is a singleton module-level instance. Routes import it directly. No heavy DI container — keep it simple:
```typescript
// src/services/gemini.service.ts
export const geminiService = new GeminiService(config);
```

### Gemini SDK Type References
The SDK's `@google/genai` v1.52.0 types are the source of truth. Key types for this project (see `JSON-SCHEMA.md` for full reference):

| Type | Description |
|---|---|
| `Content` | `{ role: "user" \| "model", parts: Part[] }` — single turn |
| `Part` | Union of `{text}`, `{inlineData}`, `{functionCall}`, etc. |
| `ContentListUnion` | String, Content, Part, or Part[] — flexible input format |
| `GenerateContentConfig` | All generation options: `temperature`, `maxOutputTokens`, `systemInstruction`, etc. |
| `GenerateContentResponse` | Response with `candidates[]`, `usageMetadata`, `response.text` getter |
| `Candidate` | Single response with `finishReason`, `content`, `tokenCount` |

The `types/gemini.ts` file re-exports and documents the SDK types used in this project.

---

## F. Staged Migration Plan

### Stage 1 — Safety & Foundation
- Add `.gitignore` (add `.env`, `node_modules/`, `dist/`, `.env.example`, etc.)
- Create `.env.example` template with all required keys (remove real API key)
- Migrate `index.js` → `index.ts` (single file TypeScript conversion)
- Add `tsconfig.json` and `tsx` for runtime
- Add `vitest.config.ts` and basic test scaffolding
- Add `@types/express`, `typescript`, `tsx`, `vitest`

**Deliverable:** TypeScript compiles, tests run, `.env` is gitignored, `.env.example` exists

### Stage 2 — Service Extraction + Error Architecture
- Extract `GeminiService` as a singleton class in `src/services/`
- Move all AI client logic (5 generation methods + response parsing) into the service
- Remove top-level `models.list()` side effect
- Add `src/utils/errors.ts` (AppError + subclasses)
- Add `src/utils/responses.ts` (successResponse, errorResponse helpers)
- Add `src/middleware/error-handler.ts` (global error middleware)
- Remove duplicated try/catch from routes — routes now throw `AppError`

**Deliverable:** Routes are thin, all AI logic is in `GeminiService`, errors return consistent JSON

### Stage 3 — Middleware Stack + Routing Structure
- Add `src/middleware/request-logger.ts` (correlation ID + request logging)
- Add `src/middleware/cors.ts` (CORS with exposed headers)
- Add `src/middleware/not-found.ts` (404 handler)
- Add `src/routes/health.ts` (`/health`, `/live`, `/ready`)
- Split `index.ts` into per-endpoint route files under `src/routes/`
- Add `src/app.ts` (Express app factory)
- Add `src/index.ts` (bootstrap + graceful shutdown)
- Add Zod validation schemas per endpoint
- Add `src/config/index.ts` (zod-typed config)
- Add structured logging (`pino` + `pino-pretty`)

**Deliverable:** Clean route separation, middleware active, health endpoints work, correlation IDs in all logs

### Stage 4 — Operational Hardening
- Add graceful shutdown handling (SIGTERM, SIGINT) — close server cleanly
- Add request timeout middleware (Gemini calls capped at `REQUEST_TIMEOUT_MS`)
- Add `docker/Dockerfile` and `docker-compose.yml`
- Add `.env.docker` with placeholder values
- Add `README.md` with usage, env setup, and Docker instructions

**Deliverable:** Docker builds and runs, graceful shutdown, health check passes in container

### Stage 5 — Testing & CI/CD (Future)
- Add unit tests for `GeminiService` (mocked AI responses)
- Add integration tests for each route
- Add GitHub Actions workflow (lint, typecheck, test, build)
- Add rate limiting middleware

---

## G. Out of Scope (This Proposal)

- Rate limiting (Stage 5)
- Prometheus/metrics endpoint (Stage 5)
- API key rotation or auth middleware
- Multiple model support
- Streaming responses
- WebSocket/SSE
- Config.yaml (YAML) support — dotenv + zod is sufficient for this app's complexity
- OpenTelemetry tracing
- Cognee memory graph

These can be addressed in follow-up proposals.

---

## H. Acceptance Criteria

- [ ] `.env` is gitignored, `.env.example` exists with all required keys
- [ ] Project compiles with `tsc` (no errors)
- [ ] All 5 existing endpoints (4 generation + chat) work identically after refactor
- [ ] `/api/chat` creates, reads, and appends to sessions with correct JSON file persistence
- [ ] Session TTL cleanup runs on startup and expired sessions are deleted
- [ ] `/health` returns 200 with `{status, service, version, uptime, timestamp}`
- [ ] `/live` returns 200 with `{alive: true, timestamp}`
- [ ] `/ready` returns 200/503 depending on API key validity
- [ ] Errors return consistent JSON shape: `{success: false, error_code, message, details?, timestamp, request_id?}`
- [ ] Success responses return: `{success: true, data, message?, timestamp, request_id?}`
- [ ] Global error handler catches all unhandled route errors
- [ ] `X-Request-ID` and `X-Response-Time` headers in every response
- [ ] `GeminiService` is the single source of truth for AI calls
- [ ] `vitest` runs and passes tests
- [ ] Docker container starts and health check passes
- [ ] Graceful shutdown stops server cleanly on SIGTERM
- [ ] No magic strings in route handlers (model name, prompts moved to config/service)

---

## I. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Breaking existing API contract | Keep response shapes identical; add integration tests before refactoring routes |
| API key exposure | Remove key from `.env`, create `.env.example`, rotate key if needed |
| Losing the working prototype | Stage 1 keeps single-file structure (just TypeScript) before any splitting |
| Gemini SDK changes | Pin `@google/genai` version, add integration tests that call real API |

---

## J. Dependencies

| Package | Purpose | Stage |
|---|---|---|
| `typescript` | Type safety | 1 |
| `@types/express` | TypeScript types | 1 |
| `tsx` | TypeScript runtime (dev) | 1 |
| `vitest` | Testing | 1 |
| `zod` | Config + request validation | 2 |
| `@google/genai` | Gemini SDK | existing |
| `express` | Web framework | existing |
| `multer` | File upload | existing |
| `cors` | CORS middleware | 3 |
| `pino` | Structured logging | 3 |
| `pino-pretty` | Pretty-printed dev logs | 3 |
| `uuid` | Correlation ID + session ID generation | 3 |

---

*Proposal 01 — gemini-flash-api refactor (scout-validated patterns)*
