# Architecture Overview

## System Design

The Gemini Flash API follows a **layered, modular architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────┐
│         Express Application             │
│  (HTTP Server, Port 4443)               │
└──────────────────┬──────────────────────┘
                   │
        ┌──────────▼──────────┐
        │   Request Pipeline  │
        ├─────────────────────┤
        │ 1. CORS Middleware  │
        │ 2. Logging (req_id) │
        │ 3. Body Parser      │
        │ 4. Route Handler    │
        │ 5. Error Catcher    │
        └─────────────────────┘
                   │
      ┌────────────┼────────────┐
      │            │            │
      ▼            ▼            ▼
   Health     Gemini API    Not Found
   Routes     Routes        Handler
      │            │            │
      ▼            ▼            ▼
   /health    /gemini/text   404 Response
   /live      /gemini/image
   /ready     /gemini/chat
   /metrics   /gemini/doc
              /gemini/audio
                   │
                   ▼
          ┌────────────────────┐
          │  Google Gemini API │
          │  (@google/genai)   │
          └────────────────────┘
```

## Module Breakdown

### Core Module (`src/api/core/`)

**exceptions.js**
- Exception hierarchy for different HTTP status codes
- Each exception carries: statusCode, errorCode, message, details
- Enables centralized error handling in middleware

**responses.js**
- Standardized response formatting (success, error, validationError)
- Ensures consistent JSON structure across all endpoints
- Includes request_id for tracing

### Middleware Layer (`src/api/middleware/`)

**logging.js**
- Generates unique request_id for each request
- Logs request: `[req_id] METHOD /path - Client: IP`
- Logs response: `[req_id] METHOD /path - Status: N - Duration: Nms`
- Adds X-Request-ID and X-Response-Time headers

**cors.js**
- Handles CORS headers based on configuration
- Configurable allowed origins
- Exposes custom headers to clients

**errorHandler.js**
- Catches all errors in the pipeline
- Formats errors using ResponseFormatter
- Returns appropriate HTTP status codes
- Sanitizes error messages in production

### Routes Layer (`src/api/routes/`)

**health.js**
- Health check endpoints for monitoring/orchestration
- `/health` — Basic liveness check
- `/live` — Kubernetes liveness probe
- `/ready` — Kubernetes readiness probe with dependency checks
- `/metrics` — Prometheus metrics (placeholder)

**gemini.js**
- 5 endpoints for different Gemini model interactions
- `/gemini/text` — Pure text generation
- `/gemini/image` — Image analysis
- `/gemini/chat` — Multi-turn conversation
- `/gemini/document` — Document/text processing
- `/gemini/audio` — Audio analysis (text-based)
- All routes: validate input → call Gemini → format response

### Config Module (`src/config/`)

**core.js**
- Loads environment variables from .env via dotenv
- Provides typed access to config values
- Validates required configuration on startup
- Supports defaults for optional settings

### App Factory (`src/api/main.js`)

**createApp()**
- Single responsibility: Creates and configures Express app
- Registers all middleware in correct order
- Wires up all routes
- Sets up error handling
- Returns ready-to-use app instance

### Server Entry (`src/server.js`)

**main()**
- Validates configuration
- Creates app using factory
- Starts HTTP server
- Implements graceful shutdown on SIGTERM/SIGINT

## Request Flow Example

**User sends:** `POST /gemini/text` with `{"prompt": "Hello"}`

```
1. HTTP Server receives request
2. CORS middleware checks origin
3. Logging middleware:
   - Generates request_id: "abc123de"
   - Stores in req.state.requestId
   - Logs: [abc123de] POST /gemini/text - Client: 127.0.0.1
4. Body parser parses JSON
5. Route handler (gemini.js):
   - Validates input (throws ValidationException if invalid)
   - Calls model.generateContent(prompt)
   - Formats response using ResponseFormatter.success()
   - Sends response with request_id
6. Logging middleware:
   - Hooks into res.end
   - Logs: [abc123de] POST /gemini/text - Status: 200 - Duration: 2345ms
   - Adds headers: X-Request-ID, X-Response-Time
7. Response sent to client
```

## Data Flow

### Request Validation

```javascript
// ValidationException thrown → caught by errorHandler
// Returns 422 with field-level details
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Request validation failed",
  "details": {
    "prompt": "prompt is required and must be a string"
  },
  "request_id": "abc123de"
}
```

### Successful Response

```javascript
// ResponseFormatter.success() returns:
{
  "success": true,
  "data": {
    "prompt": "Hello",
    "response": "Hello! How can I help?",
    "model": "gemini-2.5-flash"
  },
  "message": "Text generated successfully",
  "timestamp": "2024-01-01T12:34:56.789Z",
  "request_id": "abc123de"
}
```

### Error Response

```javascript
// APIException caught → errorHandler formats response
{
  "success": false,
  "error_code": "SERVICE_UNAVAILABLE",
  "message": "Gemini API is temporarily unavailable",
  "timestamp": "2024-01-01T12:34:56.789Z",
  "request_id": "abc123de"
}
```

## Environment Isolation

**Development** (.env local)
- NODE_ENV=development
- CORS_ORIGINS=* (all origins)
- Detailed error messages
- Console logging enabled

**Production** (.env production)
- NODE_ENV=production
- CORS_ORIGINS=specific domains
- Sanitized error messages
- Structured logging (optional)

## Extension Points

### Add New Route

1. Create `src/api/routes/new-feature.js`
2. Export Router with endpoints
3. Import in `src/api/main.js`
4. Register: `app.use('/feature', newFeatureRouter)`

### Add New Exception Type

1. Create class in `src/api/core/exceptions.js`
2. Extend `APIException`
3. Set statusCode and errorCode
4. Use in route handlers

### Add New Middleware

1. Create `src/api/middleware/new-middleware.js`
2. Export middleware function
3. Import in `src/api/main.js`
4. Register in correct position (order matters!)

## Scalability Considerations

### Current Limitations
- Single-threaded Node.js process
- No load balancing
- No horizontal scaling

### Future Improvements
- Add PM2 for process management
- Implement clustering
- Add queue system (BullMQ, RabbitMQ)
- Add caching layer (Redis)
- Add database for persistence
- Implement rate limiting per IP/API key
- Add request deduplication

---

**Status:** ✅ Foundation complete - ready for production deployment
