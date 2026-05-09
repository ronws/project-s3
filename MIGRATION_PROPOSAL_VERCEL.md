# Migration Proposal: Vanilla JS → Next.js + AI Elements

## Executive Summary

Migrate the frontend from vanilla JavaScript to Next.js (App Router) with Vercel AI Elements for a production-ready, serverless AI chatbot deployment on Vercel.

| Aspect | Current | Target |
|--------|---------|--------|
| Framework | Vanilla JS | Next.js 14+ (App Router) |
| UI Library | Custom CSS | AI Elements + shadcn/ui |
| Backend | Separate Node.js (port 4443) | Vercel Serverless API Routes |
| Deployment | Manual/other | Vercel (automatic) |
| Streaming | ❌ | ✅ |
| Model Selection | ❌ | ✅ |
| Reasoning Display | ❌ | ✅ |

---

## Current Project Structure

```
project-s3/
├── backend/                    # Node.js Express (port 4443)
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
│   ├── index.js
│   ├── package.json
│   └── .env
│
├── frontend/                   # Vanilla JS (to be replaced)
│   ├── index.html
│   ├── app.js
│   ├── style.css
│   └── package.json
│
└── package.json               # Root package (if any)
```

---

## Migration Phases

### Phase 1: Project Setup (Est. 30 min)

**Goal**: Initialize Next.js project with AI Elements

```
1.1  Create new Next.js app
     npx create-next-app@latest ai-chatbot --typescript --tailwind --app

1.2  Install AI Elements
     npx ai-elements@latest

1.3  Install AI SDK dependencies
     npm i ai @ai-sdk/react zod

1.4  Initialize shadcn/ui (required by AI Elements)
     npx shadcn@latest init

1.5  Configure Tailwind for CSS Variables mode
     (AI Elements requires this)
```

**Deliverables**:
- New Next.js project structure
- AI Elements components available at `@/components/ai-elements/*`

---

### Phase 2: Core Implementation (Est. 2-3 hours)

**Goal**: Build the chat interface using AI Elements

#### 2.1 Create Chat Page (`app/page.tsx`)

```typescript
// Based on the article's implementation
'use client';

import { Conversation, ConversationContent } from '@/components/ai-elements/conversation';
import { Message, MessageContent, MessageResponse, MessageActions, MessageAction } from '@/components/ai-elements/message';
import { PromptInput, PromptInputBody, PromptInputTextarea, PromptInputSubmit, PromptInputFooter, PromptInputTools, ... } from '@/components/ai-elements/prompt-input';
import { Reasoning, ReasoningContent, ReasoningTrigger } from '@/components/ai-elements/reasoning';
import { Loader } from '@/components/ai-elements/loader';
import { useChat } from '@ai-sdk/react';
```

#### 2.2 Implement State Management

```typescript
const { messages, sendMessage, status, regenerate } = useChat();
```

#### 2.3 Add Model Selection UI

```typescript
// Inside PromptInputFooter
<PromptInputSelect onValueChange={(value) => setModel(value)} value={model}>
  <PromptInputSelectTrigger>
    <PromptInputSelectValue />
  </PromptInputSelectTrigger>
  <PromptInputSelectContent>
    <PromptInputSelectItem value="openai/gpt-4o">GPT 4o</PromptInputSelectItem>
    <PromptInputSelectItem value="deepseek/deepseek-r1">Deepseek R1</PromptInputSelectItem>
    // ... more models from AI Gateway
  </PromptInputSelectContent>
</PromptInputSelect>
```

#### 2.4 Add Reasoning Display

```typescript
{message.parts.map((part, i) => {
  if (part.type === 'reasoning') {
    return (
      <Reasoning isStreaming={status === 'streaming'}>
        <ReasoningTrigger />
        <ReasoningContent>{part.text}</ReasoningContent>
      </Reasoning>
    );
  }
})}
```

**Deliverables**:
- Functional chat UI with streaming
- Model selection dropdown
- Reasoning display (collapsible)

---

### Phase 3: Backend & Features (Est. 2-3 hours)

**Goal**: Create serverless API and migrate features

#### 3.1 Create API Route (`app/api/chat/route.ts`)

```typescript
import { streamText, convertToModelMessages } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, model, webSearch } = await req.json();

  const result = streamText({
    model: webSearch ? 'perplexity/sonar' : model,
    messages: convertToModelMessages(messages),
    system: 'You are a helpful assistant...',
  });

  return result.toUIMessageStreamResponse({
    sendSources: true,
    sendReasoning: true,
  });
}
```

#### 3.2 Environment Setup

```bash
# .env.local
AI_GATEWAY_API_KEY=vck_...
```

#### 3.3 Feature Mapping

| Current Feature | New Implementation |
|-----------------|-------------------|
| Text Generation | Use chat with single message |
| Chat History | Handled automatically by useChat |
| Image Analysis | Need custom implementation or use vision models |
| Temperature/MaxTokens | Pass via useChat `body` config |

#### 3.4 Remove Old Backend

Once the new system works, the old backend at port 4443 is no longer needed.

**Deliverables**:
- Working serverless API
- Full streaming support
- Environment configured

---

### Phase 4: Deployment (Est. 30 min)

**Goal**: Deploy to Vercel

```
4.1  Install Vercel CLI (if not done)
     npm i -g vercel

4.2  Login to Vercel
     vercel login

4.3  Deploy
     vercel

4.4  Add AI_GATEWAY_API_KEY in Vercel dashboard
     Settings → Environment Variables
```

**Deliverables**:
- Live production URL
- Automatic deployments on git push

---

## Final Project Structure

```
project-s3/
├── app/                        # Next.js App Router (NEW!)
│   ├── layout.tsx             # Root layout
│   ├── page.tsx              # Main chat UI (AI Elements)
│   ├── globals.css
│   └── api/
│       └── chat/
│           └── route.ts      # Serverless API (replaces backend)
│
├── components/                 # AI Elements components
│   └── ai-elements/
│       ├── conversation/
│       ├── message/
│       ├── prompt-input/
│       ├── reasoning/
│       ├── loader/
│       └── sources/
│
├── public/                    # Static assets
│
├── .env.local                 # AI_GATEWAY_API_KEY
├── next.config.ts
├── tailwind.config.ts
├── package.json
│
├── backend/                   # OLD - to be removed
│   └── ...
│
└── frontend/                  # OLD - to be removed
    └── ...
```

---

## Big Picture Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         VERCEL DEPLOYMENT                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌─────────────┐                                                   │
│   │   Browser   │                                                   │
│   │   (User)   │◀──────┐                                            │
│   └─────────────┘       │                                            │
│                        │                                            │
│   ┌─────────────────────────────────────────────────────────────┐  │
│   │              Next.js App (Vercel Serverless)                │  │
│   │                                                             │  │
│   │   ┌─────────────────┐    ┌──────────────────────────────┐  │  │
│   │   │   AI Elements   │    │     API Route                │  │  │
│   │   │   UI Components │    │     /api/chat/route.ts       │  │  │
│   │   │                 │───▶│                              │  │  │
│   │   │  • Conversation │    │  streamText()                │  │  │
│   │   │  • Message      │    │  toUIMessageStreamResponse()│  │  │
│   │   │  • PromptInput  │    │                              │  │  │
│   │   │  • Reasoning    │    └──────────────┬───────────────┘  │  │
│   │   │  • Loader      │                     │                  │  │
│   │   └─────────────────┘                     │                  │  │
│   │                                          │                  │  │
│   │   ┌──────────────────────────────────────┴────────────────┐ │  │
│   │   │              Vercel AI Gateway                        │ │  │
│   │   │              (100+ AI Models)                         │ │  │
│   │   └──────────────────────┬───────────────────────────────┘ │  │
│   │                          │                                   │  │
│   │   ┌──────────────────────┴───────────────────────────────┐ │  │
│   │   │                      LLM Providers                     │ │  │
│   │   │                                                       │ │  │
│   │   │   ┌─────────┐  ┌───────────┐  ┌─────────────┐        │ │  │
│   │   │   │GPT-4o   │  │Deepseek R1│  │Claude 3.5   │  ...   │ │  │
│   │   │   │OpenAI   │  │Deepseek   │  │Anthropic    │        │ │  │
│   │   │   └─────────┘  └───────────┘  └─────────────┘        │ │  │
│   │   └───────────────────────────────────────────────────────┘ │  │
│   │                                                             │  │
│   └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

DATA FLOW:
1. User types message → PromptInput (AI Elements)
2. useChat hook sends to API Route
3. API Route → streamText() → AI Gateway
4. AI Gateway → Selected LLM
5. Response streams back → UI updates in real-time
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
| Source citations | `<Sources>` + `<Source>` |

---

## Dependencies

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

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `AI_GATEWAY_API_KEY` | Vercel AI Gateway key | [vercel.com/ai-gateway](https://vercel.com/ai-gateway) |

---

## Timeline Estimate

| Phase | Time | Total |
|-------|------|-------|
| Phase 1: Setup | 30 min | 30 min |
| Phase 2: Core Implementation | 2-3 hours | 3 hours |
| Phase 3: Backend & Features | 2-3 hours | 5-6 hours |
| Phase 4: Deployment | 30 min | 6-6.5 hours |

---

## What Gets Replaced

| Component | Before | After |
|-----------|--------|-------|
| **Frontend** | `frontend/` (Vanilla JS) | `app/` (Next.js + AI Elements) |
| **Backend** | `backend/` (Express on port 4443) | `app/api/chat/route.ts` (Serverless) |
| **Deployment** | Manual/other | Vercel automatic |
| **Models** | Hardcoded Gemini only | 100+ via AI Gateway |

---

## Next Steps

1. **Approve this proposal** → Start Phase 1
2. **Provide Vercel account** → For AI Gateway setup
3. **Decide on image analysis** → Keep as future enhancement or implement now

---

## Risks & Considerations

| Risk | Mitigation |
|------|------------|
| AI Gateway costs | Set usage alerts in Vercel dashboard |
| Model availability | Use fallback models in API route |
| Image upload size | Limit to 4MB (Vercel function limit) |
| Cold starts | Use warm-up ping or paid plan |

---

*Proposal generated for project-s3 migration*
*Updated with actual project structure*