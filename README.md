# Project S3 - Gemini Flash API & Web UI

A full-stack AI application with Express.js backend and vanilla JS frontend, powered by Google's Gemini 2.5 Flash model via `@google/genai` v1.x SDK.

## Project Structure

```
project-s3/
├── backend/                 ← Express.js API server
│   ├── src/
│   │   ├── api/           # Routes, middleware, core
│   │   ├── config/        # Configuration
│   │   └── server.js     # Entry point
│   ├── package.json
│   ├── .env               # Backend config (create from .env.example)
│   └── README.md          # Backend documentation
│
├── frontend/              ← Web UI (Vanilla JS)
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   └── package.json      # Uses serve package
│
├── package.json           ← Root: runs both via concurrently
└── README.md             ← This file
```

---

## Quick Start

### Prerequisites

- Node.js >= 18.0.0
- Google Gemini API Key (get from [Google AI Studio](https://aistudio.google.com/apikey))

### 1. Install Dependencies

```bash
cd ~/dev/project-s3

# Option A: One command to install everything (recommended)
npm run install:all

# Option B: Manual install
npm install              # Root dependencies (concurrently)
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### 2. Configure Backend

```bash
cd backend
cp .env.example .env
# Edit .env and add your GOOGLE_API_KEY
```

**Required in `backend/.env`:**
```env
GOOGLE_API_KEY=your_api_key_here
PORT=4443
HOST=0.0.0.0
CORS_ORIGINS=http://localhost:8080
```

See `backend/.env.example` for all 20+ generation config options.

### 3. Start Both Services

```bash
npm run dev
```

This single command starts:
- **Backend**: http://localhost:4443 (Express API with `--watch` auto-reload)
- **Frontend**: http://localhost:8080 (Served by `serve` package)

### 4. Test the Stack

1. Open http://localhost:8080 in your browser
2. Verify backend status shows "Connected"
3. Try the Text Generation tab with a prompt
4. Test the Chat interface
5. Upload an image for analysis

### Alternative: Start Separately

```bash
# Terminal 1: Backend only
npm run dev:backend

# Terminal 2: Frontend only
npm run dev:frontend
```

---

## Features

### Backend API (Express.js + @google/genai v1.x)

- Text Generation - `POST /gemini/text`
- Chat Conversations - `POST /gemini/chat`
- Image Analysis - `POST /gemini/image`
- Document Processing - `POST /gemini/document`
- Audio Processing - `POST /gemini/audio`
- Health Checks - `GET /health`, `/live`, `/ready`, `/metrics`
- Configurable Generation - 20+ options via `config` object
- CORS Support - Production-ready with `cors` package (fixed credentials issue)

### Frontend Web UI (Vanilla JS)

- Modern Gradient UI - Clean, responsive design
- Text Generation - Simple prompt interface
- Chat Interface - Multi-turn conversations with history
- Image Upload - Drag & drop image analysis
- Configurable Parameters - Temperature, max tokens, etc.
- JSON Response Display - Pretty-printed API responses
- Fixed DOM Timing - Uses DOMContentLoaded for reliable initialization

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Health check |
| `/live` | GET | Liveness probe |
| `/ready` | GET | Readiness probe |
| `/metrics` | GET | Prometheus metrics |
| `/gemini/text` | POST | Text generation |
| `/gemini/chat` | POST | Chat conversations |
| `/gemini/image` | POST | Image analysis |
| `/gemini/document` | POST | Document processing |
| `/gemini/audio` | POST | Audio processing |

All `/gemini/*` endpoints accept optional `config` object:

```json
{
  "prompt": "Your prompt",
  "config": {
    "temperature": 0.9,
    "maxOutputTokens": 2048,
    "responseMimeType": "application/json"
  }
}
```

See `backend/JSON-SCHEMA.md` for complete API schema and all 20+ config options.

---

## Configuration

### Backend (.env)

Key configuration options in `backend/.env`:

```env
# Server
PORT=4443
HOST=0.0.0.0

# Gemini API
GOOGLE_API_KEY=***
GEMINI_MODEL=gemini-2.5-flash

# CORS (allow frontend origin)
CORS_ORIGINS=http://localhost:8080,http://127.0.0.1:8080

# Generation Defaults (optional)
GEMINI_TEMPERATURE=1.0
GEMINI_MAX_TOKENS=8192
GEMINI_TOP_P=0.95
GEMINI_TOP_K=40
```

See `backend/.env.example` for all options.

### Frontend

Update the "Backend API URL" field in the web UI to match your backend:
- Default: `http://localhost:4443`
- Change if backend runs on different host/port

---

## Development

### Backend Development

```bash
cd backend
npm run dev          # Development with auto-reload (--watch)
npm start            # Production mode
```

### Frontend Development

```bash
cd frontend
npm run dev          # Uses serve package on port 8080
```

### Making Changes

1. **Backend changes**: Edit files in `backend/src/`, server auto-reloads via `--watch`
2. **Frontend changes**: Edit `frontend/` files, refresh browser
3. **Config changes**: Update `backend/.env`, restart backend

---

## Documentation

| File | Description |
|------|-------------|
| `README.md` | This file (project overview) |
| `backend/README.md` | Backend API documentation |
| `backend/SETUP.md` | Backend setup guide |
| `backend/JSON-SCHEMA.md` | Complete API schema reference |
| `backend/ARCHITECTURE.md` | Backend architecture overview |
| `frontend/README.md` | Frontend documentation |

---

## Troubleshooting

### "Cannot connect to backend"

1. Check backend is running: `npm run dev:backend`
2. Verify backend URL in frontend UI (default: `http://localhost:4443`)
3. Check CORS settings in `backend/.env`

### CORS Errors

Update `backend/.env`:

```env
CORS_ORIGINS=http://localhost:8080,http://127.0.0.1:8080
```

**Note**: `CORS_ORIGINS=*` is NOT supported when credentials are enabled. Use explicit origins.

### Frontend not loading

- Ensure you're serving the frontend: `npm run dev:frontend`
- Check browser console for errors
- Verify port 8080 is not in use: `lsof -i:8080`

### Backend not starting

- Verify `backend/.env` exists with `GOOGLE_API_KEY`
- Check port 4443 is not in use: `lsof -i:4443`
- Review logs for errors

---

## Deployment

### Backend

```bash
cd backend
npm start    # Runs in production mode
```

Set production env:

```env
NODE_ENV=production
HOST=0.0.0.0
PORT=4443
```

### Frontend

The frontend is static files served by `serve` package. For production:

```bash
cd frontend
npm start    # serve -s . -l 8080
```

Or use any web server (nginx, Apache, etc.):

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /path/to/project-s3/frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## Version History

- **v1.0.0** (2026-05-08) - Initial release
  - Express.js backend with full Gemini API integration (@google/genai v1.x)
  - Web UI with text, chat, image, document, and audio support
  - Configurable generation parameters (20+ options)
  - CORS-enabled for frontend/backend communication
  - Single `npm run dev` command via concurrently
  - Fixed CORS credentials issue (replaced custom middleware with `cors` package)
  - Fixed frontend DOM timing (added DOMContentLoaded listener)
  - Removed obsolete start.sh/stop.sh scripts

---

## Cleanup

Remove all node_modules and .env files:

```bash
npm run clean
```

---

**Project**: Project S3 - Gemini Flash API & Web UI
**Version**: 1.0.0
**Status**: Production Ready
**Last Updated**: May 8, 2026
