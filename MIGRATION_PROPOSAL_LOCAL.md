# Migration Proposal: Hybrid Local Setup

## Executive Summary

Keep the existing backend (port 4443), replace only the frontend with Next.js + AI Elements. This is a **hybrid approach** - test Next.js without removing your working backend.

| Aspect | Current | Target |
|--------|---------|--------|
| Frontend | Vanilla JS | Next.js 14+ (App Router) + AI Elements |
| Backend | Node.js Express (port 4443) | Keep as-is |
| Deployment | Manual | Vercel (frontend only) or local |
| API Calls | Direct to backend | Proxy through Next.js |

---

## Current Project Structure

```
project-s3/
├── backend/                    # Keep - Node.js Express
│   ├── src/
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   ├── gemini.js    # /gemini/text, /gemini/chat, /gemini/image
│   │   │   │   └── health.js    # /health
│   │   │   └── middleware/
│   │   │       ├── cors.js
│   │   │       ├── errorHandler.js
│   │   │       └── logging.js
│   │   ├── config/
│   │   │   └── core.js
│   │   └── server.js
│   ├── index.js                # Runs on port 4443
│   └── package.json
│
├── frontend/                   # Will be replaced
│   ├── index.html
│   ├── app.js
│   └── style.css
```

---

## Migration Phases

### Phase 1: Project Setup (Est. 30 min)

**Goal**: Add Next.js frontend to existing monorepo structure

```
1.1  Create new Next.js app in project root (will create app/ directory)
     npx create-next-app@latest . --typescript --tailwind --app --use-npm
     # When asked, choose NO to overwrite existing files (or manually merge)

     # Alternative: create in temp folder then move
     npx create-next-app@latest frontend-nextjs --typescript --tailwind --app
     mv frontend-nextjs/* frontend-nextjs/.* . 2>/dev/null || true
     rm -rf frontend-nextjs

1.2  Install AI Elements
     npx ai-elements@latest

1.3  Install AI SDK dependencies
     npm i ai @ai-sdk/react zod

1.4  Initialize shadcn/ui (required by AI Elements)
     npx shadcn@latest init
```

**Deliverables**:
- Next.js project integrated into `app/` directory
- AI Elements components available
- Updated root `package.json`

---

### Phase 2: Frontend Implementation (Est. 2-3 hours)

**Goal**: Build chat UI using AI Elements, connect to existing backend

#### 2.1 Create Chat Page (`app/page.tsx`)

```typescript
'use client';

import { Conversation, ConversationContent } from '@/components/ai-elements/conversation';
import { Message, MessageContent, MessageResponse, MessageActions, MessageAction } from '@/components/ai-elements/message';
import { PromptInput, PromptInputBody, PromptInputTextarea, PromptInputSubmit, PromptInputFooter, PromptInputTools, ... } from '@/components/ai-elements/prompt-input';
import { Reasoning, ReasoningContent, ReasoningTrigger } from '@/components/ai-elements/reasoning';
import { Loader } from '@/components/ai-elements/loader';
import { useState } from 'react';

// Point to your existing backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4443';

export default function ChatPage() {
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/gemini/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          conversationHistory: messages,
          config: { temperature: 1.0, maxOutputTokens: 8192 }
        })
      });

      const data = await response.json();
      const botMessage = { role: 'assistant', content: data.data?.response || 'No response' };
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Conversation>
        <ConversationContent>
          {messages.map((msg, i) => (
            <Message key={i} from={msg.role as 'user' | 'assistant'}>
              <MessageContent>
                <MessageResponse>{msg.content}</MessageResponse>
              </MessageContent>
            </Message>
          ))}
          {isLoading && <Loader />}
        </ConversationContent>
      </Conversation>

      <PromptInput onSubmit={handleSubmit} className="mt-4">
        <PromptInputBody>
          <PromptInputTextarea
            onChange={(e) => setInput(e.target.value)}
            value={input}
          />
        </PromptInputBody>
        <PromptInputFooter>
          <PromptInputTools>
            {/* Add model selection, tools, etc. */}
          </PromptInputTools>
          <PromptInputSubmit disabled={!input || isLoading} status={isLoading ? 'submitted' : 'ready'} />
        </PromptInputFooter>
      </PromptInput>
    </div>
  );
}
```

#### 2.2 Environment Configuration

```bash
# frontend-nextjs/.env.local
NEXT_PUBLIC_API_URL=http://localhost:4443
```

**Deliverables**:
- Functional Next.js chat UI
- Connects to existing backend API
- Streaming support (if backend supports it)

---

### Phase 3: Run Locally (Est. 15 min)

**Goal**: Run backend + Next.js frontend together

The existing root `package.json` already handles running multiple services with `concurrently`. We'll update it to include Next.js:

```bash
# Update root package.json scripts to include Next.js:
npm run dev
# Now runs: backend (:4443) + Next.js (:3000)
```

**After migration, root package.json will be:**

```json
{
  "scripts": {
    "dev": "concurrently -n backend,next -c blue.bgWhite,green.bgWhite \"npm run dev --prefix backend\" \"npm run dev --prefix .\"",
    "dev:backend": "cd backend && npm run dev",
    "dev:frontend": "npm run dev --prefix .",
    "start": "concurrently \"npm start --prefix backend\" \"npm run start --prefix .\"",
    "build": "cd . && next build",
    "clean": "rm -rf **/node_modules **/.next **/.env"
  }
}
```

**Access the app:**
- Next.js Frontend: http://localhost:3000
- Backend API: http://localhost:4443
- Old Frontend (optional): http://localhost:8080

**Deliverables**:
- Working hybrid setup
- Single command runs both servers

---

### Phase 4: Optional - Deploy Frontend to Vercel (Est. 30 min)

**Goal**: Deploy frontend only, keep backend local

```
4.1  Build the Next.js app
     npm run build

4.2  Deploy to Vercel
     vercel

4.3  Update environment in Vercel dashboard:
     NEXT_PUBLIC_API_URL=http://localhost:4443

4.4  NOTE: For production, you'll need to expose your backend
     (e.g., ngrok, cloud server, or migrate to serverless)
```

**Deliverables**:
- Vercel-hosted frontend
- Still calls local backend (needs public URL)

---

## Final Project Structure

```
project-s3/
├── app/                        # NEW - Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx               # Main chat UI (AI Elements)
│   ├── globals.css
│   └── api/
│       └── chat/
│           └── route.ts       # Optional: proxy to backend
│
├── components/                 # AI Elements components
│   └── ai-elements/
│
├── backend/                   # Keep - Node.js Express (port 4443)
│   ├── src/
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   ├── gemini.js
│   │   │   │   └── health.js
│   │   │   └── middleware/
│   │   ├── config/
│   │   └── server.js
│   ├── index.js
│   └── package.json
│
├── frontend/                  # OLD - will be replaced by app/
│   └── ...
│
├── .env.local                 # NEXT_PUBLIC_API_URL
├── package.json               # Updated: runs backend + frontend
├── next.config.ts
└── tailwind.config.ts
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PROJECT-S3 MONOREPO                              │
│                    npm run dev (single command)                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌─────────────────────────────────────────────────────────────┐  │
│   │                    ROOT (concurrently)                      │  │
│   │                                                             │  │
│   │   ┌─────────────────┐          ┌─────────────────────────┐ │  │
│   │   │  Backend        │          │  Next.js Frontend      │ │  │
│   │   │  Express        │          │  (AI Elements)         │ │  │
│   │   │  :4443          │          │  :3000                 │ │  │
│   │   │                 │          │                        │ │  │
│   │   │  /gemini/text   │◀────────▶│  fetch()               │ │  │
│   │   │  /gemini/chat   │          │  NEXT_PUBLIC_API_URL   │ │  │
│   │   │  /gemini/image  │          │                        │ │  │
│   │   └────────┬────────┘          └───────────┬───────────┘ │  │
│   │            │                               │               │  │
│   └────────────┼───────────────────────────────┼───────────────┘  │
│                │                               │                    │
│                ▼                               │                    │
│   ┌─────────────────────────┐                  │                    │
│   │   Google Gemini API     │                  │                    │
│   │   (External)            │                  │                    │
│   └─────────────────────────┘                  │                    │
│                                               │                    │
│   ┌────────────────────────────────────────────┴────────────────┐  │
│   │   Browser → http://localhost:3000 (Next.js UI)              │  │
│   └────────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Component Mapping

| Vanilla JS Element | AI Elements Component |
|--------------------|-----------------------|
| Chat history container | `<Conversation>` + `<ConversationContent>` |
| Message bubbles | `<Message from="user\|assistant">` |
| Input text area | `<PromptInputTextarea>` |
| Send button | `<PromptInputSubmit>` |
| Loading spinner | `<Loader>` |
| AI thinking process | `<Reasoning>` + `<ReasoningContent>` |

---

## Dependencies (Next.js Frontend)

```json
{
  "dependencies": {
    "ai": "^4.x",
    "@ai-sdk/react": "^1.x",
    "zod": "^3.x",
    "lucide-react": "^0.x"
  },
  "devDependencies": {
    "next": "14.x",
    "typescript": "^5.x",
    "tailwindcss": "^3.x",
    "@types/node": "^20.x"
  }
}
```

---

## Environment Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:4443` | Your backend URL |

---

## Timeline Estimate

| Phase | Time | Total |
|-------|------|-------|
| Phase 1: Setup | 30 min | 30 min |
| Phase 2: Frontend Implementation | 2-3 hours | 3 hours |
| Phase 3: Run Locally (update root scripts) | 15 min | 3h 15m |
| Phase 4: Optional Vercel | 30 min | 3h 45m |

**Running the project:**
```bash
# Before migration
npm run dev  # backend (:4443) + old frontend (:8080)

# After migration  
npm run dev  # backend (:4443) + Next.js (:3000)
```

---

## Comparison: LOCAL vs VERCEL

| Aspect | LOCAL (This Proposal) | VERCEL (Other Proposal) |
|--------|----------------------|------------------------|
| Backend | Keep existing (port 4443) | Replace with serverless API |
| Frontend | Next.js + AI Elements | Next.js + AI Elements |
| Structure | Monorepo (`npm run dev`) | Vercel serverless |
| Deployment | Local or Vercel (frontend only) | Full Vercel (frontend + API) |
| Complexity | Low | Medium |
| Cost | Free | Free (with limits) |
| When to use | Development/testing | Production |

**Key difference:** LOCAL keeps your backend running as-is, while VERCEL migrates everything to serverless functions.

---

## Next Steps

1. **Approve this proposal** → Start Phase 1
2. **Run both servers** → Backend on :4443, Next.js on :3000
3. **Later** → Decide to fully migrate backend or keep hybrid

---

## Risks & Considerations

| Risk | Mitigation |
|------|------------|
| CORS issues | Backend already has CORS configured |
| Backend downtime | Frontend shows connection error |
| Production deployment | Need public backend URL or full migration |

---

*Proposal generated for project-s3 hybrid local migration*