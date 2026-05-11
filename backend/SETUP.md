# Gemini Flash API - Project Setup Guide

## ✅ Project Structure

The project has been refactored from a monolithic `index.js` into a production-ready, modular architecture following the `scout` framework patterns:

```
gemini-flash-api/
├── src/
│   ├── api/
│   │   ├── core/
│   │   │   ├── exceptions.js      # Exception hierarchy (BadRequest, NotFound, etc)
│   │   │   └── responses.js        # Standardized response formatting
│   │   ├── middleware/
│   │   │   ├── logging.js          # Request logging with correlation IDs
│   │   │   ├── cors.js             # CORS configuration
│   │   │   └── errorHandler.js     # Centralized error handling
│   │   ├── routes/
│   │   │   ├── health.js           # Health checks (/health, /live, /ready, /metrics)
│   │   │   └── gemini.js           # Gemini endpoints (/gemini/text, /image, /chat, etc)
│   │   └── main.js                 # Express app factory
│   ├── config/
│   │   └── core.js                 # Configuration management (.env)
│   └── server.js                   # Server entry point
├── tests/                          # Test files (placeholder)
├── .env.example                    # Environment variables template
├── .gitignore                      # Git ignore rules (protects .env)
├── package.json                    # Dependencies and scripts
└── proposal_01.md                  # Original proposal document
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example config and fill in your Gemini API key:

```bash
cp .env.example .env
```

Edit `.env` and add your `GOOGLE_API_KEY`:

```env
GOOGLE_API_KEY=your_actual_key_here
PORT=4443
NODE_ENV=development
```

### 3. Start the Server

**Development** (with auto-reload):
```bash
npm run dev
```

**Production**:
```bash
npm start
```

The server will start at `http://0.0.0.0:4443`

### 4. Test the API

Check server health:
```bash
curl http://localhost:4443/health
```

Send a text prompt:
```bash
curl -X POST http://localhost:4443/gemini/text \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello, what is 2+2?"}'
```

## 📋 Available Endpoints

### Health Checks

- `GET /` — Root endpoint with API documentation
- `GET /health` — Basic health status
- `GET /live` — Kubernetes liveness probe
- `GET /ready` — Kubernetes readiness probe
- `GET /metrics` — Prometheus metrics (placeholder)

### Gemini Endpoints

All endpoints return standardized JSON responses with `request_id` for tracing.

#### Text Generation
**POST** `/gemini/text`
```json
{
  "prompt": "Your prompt here"
}
```

#### Image Analysis
**POST** `/gemini/image`
```json
{
  "imageData": "base64-encoded-image",
  "mimeType": "image/jpeg",
  "prompt": "What's in this image?"
}
```

#### Chat / Multi-turn Conversation
**POST** `/gemini/chat`
```json
{
  "message": "Your message",
  "conversationHistory": [
    {"role": "user", "content": "Previous message 1"},
    {"role": "model", "content": "Previous response 1"}
  ]
}
```

#### Document Processing
**POST** `/gemini/document`
```json
{
  "content": "Document content here",
  "prompt": "Summarize this document"
}
```

#### Audio Processing
**POST** `/gemini/audio`
```json
{
  "prompt": "Audio description or context"
}
```

## 🔧 Configuration

All configuration is managed via environment variables in `.env`:

```env
# Server
PORT=4443
HOST=0.0.0.0
NODE_ENV=development

# Gemini API
GOOGLE_API_KEY=***
GEMINI_MODEL=gemini-2.5-flash

# CORS (comma-separated origins)
CORS_ORIGINS=*

# Request timeout
REQUEST_TIMEOUT_MS=30000

# Logging
LOG_LEVEL=info

# ============================================
# Generation Config Defaults (JSON-SCHEMA.md)
# ============================================

# Temperature: Controls randomness (0-2, default: 1.0)
GEMINI_TEMPERATURE=1.0

# Max Output Tokens: Maximum tokens in response (1-8192, default: 8192)
GEMINI_MAX_TOKENS=8192

# Top-P: Nucleus sampling threshold (0-1, default: 0.95)
GEMINI_TOP_P=0.95

# Top-K: Top-k token filtering (1-100, default: 40)
GEMINI_TOP_K=40

# Candidate Count: Number of responses to generate (1-8, default: 1)
GEMINI_CANDIDATE_COUNT=1

# Response MIME Type: Output format (text/plain, application/json)
GEMINI_RESPONSE_MIME_TYPE=text/plain
```

### Per-Request Config Overrides

All `/gemini/*` endpoints accept an optional `config` object to override defaults:

```json
{
  "prompt": "Your prompt here",
  "config": {
    "temperature": 0.9,
    "maxOutputTokens": 2048,
    "topP": 0.95,
    "responseMimeType": "application/json",
    "systemInstruction": "You are a helpful assistant."
  }
}
```

See `JSON-SCHEMA.md` for complete config options.

## 📊 Response Format

All responses follow a consistent structure:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Success message",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "request_id": "abc123de"
}
```

### Error Response
```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Error message",
  "details": { ... },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "request_id": "abc123de"
}
```

## 🛡️ Error Handling

The API provides standardized error codes:

| Code | HTTP | Meaning |
|---|---|---|
| `BAD_REQUEST` | 400 | Invalid request format |
| `UNAUTHORIZED` | 401 | Missing/invalid authentication |
| `FORBIDDEN` | 403 | Access denied |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 422 | Invalid request data |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_SERVER_ERROR` | 500 | Server error |
| `SERVICE_UNAVAILABLE` | 503 | Dependency unavailable |

## 🔍 Logging & Tracing

Every request gets a unique `request_id` (8-char UUID) that appears in:
- Console logs: `[abc123de] GET /health - Status: 200 - Duration: 2ms`
- Response headers: `X-Request-ID`, `X-Response-Time`
- Response body: `request_id` field

This enables easy tracing of specific requests through logs.

## 🐳 Docker Support (Ready for Implementation)

Directory structure is prepared for containerization. Next steps:
1. Create `Dockerfile` with Node.js base image
2. Create `docker-compose.yml` for local development
3. Create `.dockerignore` to exclude node_modules

## ✨ Next Steps

1. **Security Review**
   - Add API key validation middleware
   - Implement rate limiting
   - Add request size limits

2. **Testing**
   - Add unit tests (Jest/Vitest)
   - Add integration tests
   - Add E2E tests

3. **Monitoring**
   - Implement Prometheus metrics
   - Add structured logging (Winston/Pino)
   - Add request tracing

4. **Documentation**
   - Add OpenAPI/Swagger spec
   - Add API documentation site

5. **Deployment**
   - Add GitHub Actions CI/CD
   - Add Kubernetes manifests
   - Add database support (if needed)

## 📚 Architecture References

This structure follows patterns from:
- **scout** framework (`~/.openclaw/workspace-gh0st/agents/scout/`)
- **Express.js** best practices
- **RESTful API** design principles
- **12-factor app** methodology

---

**Project started:** May 8, 2026
**Status:** ✅ Phase 1 - Foundation Complete
