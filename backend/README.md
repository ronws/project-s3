# Gemini Flash API - Quick Reference

## 🚀 Getting Started (5 minutes)

### 1. Install & Configure
```bash
npm install
cp .env.example .env
# Edit .env and add GOOGLE_API_KEY
```

### 2. Run Development Server
```bash
npm run dev
```

### 3. Test the API
```bash
# Health check
curl http://localhost:4443/health

# Text generation
curl -X POST http://localhost:4443/gemini/text \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Say hello"}'
```

---

## 📚 API Endpoints

### Health & Monitoring
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/` | API documentation |
| GET | `/health` | Basic health status |
| GET | `/live` | Kubernetes liveness probe |
| GET | `/ready` | Kubernetes readiness probe |
| GET | `/metrics` | Prometheus metrics |

### Gemini Operations
| Method | Endpoint | Input | Output |
|--------|----------|-------|--------|
| POST | `/gemini/text` | `{prompt, config?}` | `{response, config}` |
| POST | `/gemini/image` | `{imageData, prompt, config?}` | `{response, config}` |
| POST | `/gemini/chat` | `{message, conversationHistory, config?}` | `{response, config}` |
| POST | `/gemini/document` | `{content, prompt, config?}` | `{response, config}` |
| POST | `/gemini/audio` | `{prompt, config?}` | `{response, config}` |

**`config` object (optional)** - Override generation defaults:
```json
{
  "temperature": 0.9,           // 0-2, controls randomness
  "maxOutputTokens": 2048,      // 1-8192, max response tokens
  "topP": 0.95,                // 0-1, nucleus sampling
  "topK": 40,                   // 1-100, top-k filtering
  "candidateCount": 1,          // 1-8, number of responses
  "stopSequences": ["END"],     // stop generation markers
  "responseMimeType": "application/json",
  "responseSchema": { ... },    // JSON schema for structured output
  "systemInstruction": "..."    // system prompt
}
```

---

## 🔧 Configuration

### Environment Variables (.env)
```
# Server
PORT=4443
HOST=0.0.0.0
NODE_ENV=development

# Gemini
GOOGLE_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.5-flash

# CORS
CORS_ORIGINS=*

# Timeouts
REQUEST_TIMEOUT_MS=30000
```

---

## 📊 Response Format

### Success
```json
{
  "success": true,
  "data": {...},
  "message": "Success",
  "timestamp": "2024-01-01T00:00:00Z",
  "request_id": "abc123de"
}
```

### Error
```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Error message",
  "details": {...},
  "timestamp": "2024-01-01T00:00:00Z",
  "request_id": "abc123de"
}
```

---

## 🛠️ Development

### Scripts
```bash
npm run dev       # Development with auto-reload
npm start         # Production server
npm test          # Run tests (when added)
npm run lint      # Lint code (when configured)
```

### Directory Structure
```
src/
  ├── api/
  │   ├── core/           # Exceptions, responses
  │   ├── middleware/     # CORS, logging, errors
  │   ├── routes/         # API endpoints
  │   └── main.js         # App factory
  ├── config/             # Configuration
  └── server.js           # Entry point
```

### Key Files
- `src/api/core/exceptions.js` - Exception classes
- `src/api/core/responses.js` - Response formatting
- `src/api/routes/gemini.js` - Gemini endpoints
- `src/config/core.js` - Environment config
- `.env.example` - Configuration template

---

## 🐛 Debugging

### Enable Debug Logs
```bash
# Check logs with request IDs
npm run dev 2>&1 | grep "\[abc123de\]"

# See full request trace
npm run dev
```

### Trace Specific Request
All logs include request ID: `[abc123de] METHOD /path`
```bash
# Get request ID from response
curl http://localhost:4443/health

# Look for this ID in logs
grep "[request_id_from_response]" logs/output.log
```

### Test Error Handling
```bash
# Validation error (missing prompt)
curl -X POST http://localhost:4443/gemini/text \
  -H "Content-Type: application/json" \
  -d '{}'

# Not found
curl http://localhost:4443/invalid

# Server error (will be caught and formatted)
```

---

## 📖 Documentation

- **[SETUP.md](./SETUP.md)** - Complete setup guide
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System design overview
- **[proposal_01.md](./proposal_01.md)** - Original proposal
- **[STATUS.md](./STATUS.md)** - Project status & roadmap

---

## 🆘 Troubleshooting

### Port already in use
```bash
# Change PORT in .env
PORT=5443 npm run dev
```

### API key not working
- Verify GOOGLE_API_KEY is set in .env
- Check key is valid and has Gemini API access
- Check quota limits not exceeded

### CORS errors
- Verify CORS_ORIGINS in .env includes your client origin
- Use `CORS_ORIGINS=*` for development

### Connection timeout
- Increase REQUEST_TIMEOUT_MS in .env
- Check Gemini API is accessible
- Verify network connectivity

---

## 📞 Support

For detailed information, see:
- Architecture decisions: [ARCHITECTURE.md](./ARCHITECTURE.md)
- Project roadmap: [STATUS.md](./STATUS.md)
- API examples: [SETUP.md](./SETUP.md)

---

**Version:** 1.0.0
**Status:** ✅ Production Ready (Phase 1)
**Last Updated:** May 8, 2026
