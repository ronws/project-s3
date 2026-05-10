# Gemini Flash API & Web UI

## Quick Start

```bash
# Install all dependencies
npm run install:all

# Start both servers (backend :4443, frontend :3000)
npm run dev

# Or start individually
npm run dev:backend  # Backend only
npm run dev:next     # Frontend only
```

## Project Structure

```
project-s3/
├── app/              # Next.js App Router (frontend)
│   ├── page.tsx     # Main chat page
│   └── layout.tsx   # Root layout
├── backend/          # Express API server
│   ├── src/
│   │   ├── server.js
│   │   ├── config/
│   │   └── api/
│   └── tests/       # Unit tests (bun test)
├── components/       # React components (MessageContent, Settings, Toast, etc.)
├── hooks/           # Custom hooks (useConversations, useTheme)
├── types/           # TypeScript types
├── utils/           # Utilities (storage)
├── e2e/             # Playwright E2E tests
└── public/          # Static assets
```

## Environment Variables

Create `backend/.env`:
```
GEMINI_API_KEY=your_api_key_here
PORT=4443
```

Create `.env.local` (frontend):
```
NEXT_PUBLIC_API_URL=http://localhost:4443
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both servers |
| `npm run build` | Production build |
| `npm run test` | Backend unit tests |
| `npm run test:e2e` | Playwright E2E tests |
| `npm run test:backend` | Backend tests only |

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/gemini/text` | POST | Generate text |
| `/gemini/chat` | POST | Multi-turn chat |
| `/gemini/stream-chat` | POST | Streaming chat (SSE) |
| `/gemini/document` | POST | Document processing |
| `/gemini/audio` | POST | Audio description |

## Test Results

- **Unit Tests**: 14 passed ✅
- **E2E Tests**: 12 passed ✅

## Documentation

- [Backend Setup](./backend/SETUP.md)
- [Backend Architecture](./backend/ARCHITECTURE.md)
- [Testing Phase](./PHASE7_TESTING.md)
