# Phase 5 Proposal: Local Development Enhancements

**Updated**: May 10, 2026 - Enhanced with JSON Schema Analysis

## Executive Summary

Enhance the chat UI with productivity features for local development: conversation persistence, history management, configurable settings, and response statistics. This phase focuses on developer experience and making the app more practical for testing and iteration.

**Key Enhancement**: Now includes **response metadata display** (token counts, finish reason, response time) based on Google Generative AI SDK schema for better debugging and optimization.

---

## Current State (End of Phase 3)

| Aspect | Status |
|--------|--------|
| Backend | ✅ Running on :4443 |
| Frontend | ✅ Running on :3000 |
| Chat UI | ✅ Basic message exchange working |
| Persistence | ❌ Lost on page reload |
| History | ❌ No conversation management |
| Settings | ❌ Fixed configuration |

---

## Phase 5 Goals

### Primary Goals
1. **Persistence**: Save/load conversations from localStorage
2. **History Management**: Track multiple conversations with quick switch
3. **Settings Panel**: Configure model, temperature, and system prompt

### Secondary Goals
1. Better UX: Copy/regenerate/edit messages
2. Error handling: Better feedback on failures
3. Performance: Optimize re-renders and API calls

---

## Phase 5 Structure

### Phase 5.1: Conversation Persistence (localStorage)
**Goal**: Conversations survive page reloads

**Tasks**:
- [ ] 5.1.1 Create useConversations hook for localStorage management
- [ ] 5.1.2 Add save/load functions for conversations
- [ ] 5.1.3 Add "Clear History" button
- [ ] 5.1.4 Display current conversation status
- [ ] 5.1.5 Test persistence across page reloads

**Deliverables**:
- Hook: `hooks/useConversations.ts`
- Conversations auto-save to localStorage
- Manual clear functionality
- Visual feedback on save status

**Estimated Time**: 45 min

---

### Phase 5.2: Conversation History Sidebar
**Goal**: Switch between multiple saved conversations

**Tasks**:
- [ ] 5.2.1 Create conversation list component
- [ ] 5.2.2 Add sidebar layout to chat page
- [ ] 5.2.3 Implement create new conversation
- [ ] 5.2.4 Implement delete conversation
- [ ] 5.2.5 Show conversation preview/timestamp
- [ ] 5.2.6 Highlight active conversation

**Deliverables**:
- Component: `components/ConversationSidebar.tsx`
- Sidebar with conversation list
- Create/delete conversation buttons
- Conversation metadata (date, message count)

**Estimated Time**: 1 hour

**Design**:
```
┌─────────────────────────────────────────────┐
│ Conversations    [+ New] [Clear All]        │
├─────────────────────────────────────────────┤
│ Today                                        │
│ ✓ What is AI? (5 messages)                 │
│   How to learn ML (3 messages)             │
│ Yesterday                                   │
│   Getting started (8 messages)             │
│                                             │
│ [Clear History]                            │
└─────────────────────────────────────────────┘
```

---

### Phase 5.3: Settings & Configuration Panel
**Goal**: Adjust model parameters without code changes + show response statistics

**Tasks**:
- [ ] 5.3.1 Create settings modal/panel with Basic & Advanced tabs
- [ ] 5.3.2 Add model selector (gemini-2.5-flash, etc.)
- [ ] 5.3.3 Add temperature slider (0.0 - 2.0)
- [ ] 5.3.4 Add maxTokens input (1-8192)
- [ ] 5.3.5 Add topP slider (0.0 - 1.0, default 0.95)
- [ ] 5.3.6 Add topK slider (1-100, default 40)
- [ ] 5.3.7 Add system prompt textarea
- [ ] 5.3.8 Add stop sequences input
- [ ] 5.3.9 Save settings to localStorage
- [ ] 5.3.10 Apply settings to API calls
- [ ] 5.3.11 Display response statistics (token count, finish reason)
- [ ] 5.3.12 Add response metadata footer

**Deliverables**:
- Component: `components/SettingsPanel.tsx` (with tabs)
- Component: `components/ResponseStats.tsx` (NEW - token usage display)
- Hook: `hooks/useSettings.ts`
- Settings interface with validation per JSON schema
- Settings persist across sessions
- Token usage visible after each response

**Estimated Time**: 1.5 hours

**Settings Interface - Basic Tab**:
```
┌──────────────────────────────────────────┐
│  Settings  [Basic]  [Advanced]          │
├──────────────────────────────────────────┤
│ Model:                                   │
│ [v] gemini-2.5-flash                   │
│     gemini-2.0-pro                     │
│                                          │
│ Temperature: [═══●════] 1.0             │
│ (0=deterministic, 2=creative)          │
│                                          │
│ Max Output Tokens: [8192]               │
│ (1 - 8192)                              │
│                                          │
│ System Prompt:                           │
│ ┌──────────────────────────────────────┐ │
│ │ You are a helpful AI assistant.      │ │
│ │ Be concise and accurate.             │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ [Reset Defaults]  [Save Settings]       │
└──────────────────────────────────────────┘
```

**Settings Interface - Advanced Tab**:
```
┌──────────────────────────────────────────┐
│  Settings  [Basic]  [Advanced]          │
├──────────────────────────────────────────┤
│ Top-P (Nucleus): [═════●──] 0.95        │
│ (0-1, higher=more diverse)              │
│                                          │
│ Top-K: [═══●══════] 40                  │
│ (1-100, higher=less restrictive)        │
│                                          │
│ Stop Sequences:                          │
│ [Example: END]  [+ Add]  [x Remove]    │
│                                          │
│ Seed (for reproducibility):              │
│ [12345]  [Randomize]                   │
│                                          │
│ Response Format:                         │
│ [v] Text (text/plain)                  │
│     JSON (application/json)             │
│                                          │
│ [Reset to Defaults]  [Save]             │
└──────────────────────────────────────────┘
```

**Response Statistics Footer**:
```
┌─────────────────────────────────────────┐
│ ✓ Response received                     │
│                                         │
│ Tokens: [Prompt: 45] [Response: 123]   │
│ Total: 168 | Finish: STOP              │
│                                         │
│ Response Time: 2.34s                    │
└─────────────────────────────────────────┘
```

---

### Phase 5.4 (Bonus): Message Controls & Response Stats
**Goal**: More control over individual messages + visibility into token usage

**Tasks**:
- [ ] 5.4.1 Add copy message button (with toast)
- [ ] 5.4.2 Add regenerate response button
- [ ] 5.4.3 Add delete message from history
- [ ] 5.4.4 Add message timestamps
- [ ] 5.4.5 Add response metadata footer
- [ ] 5.4.6 Display token usage breakdown
- [ ] 5.4.7 Show finish reason for each response
- [ ] 5.4.8 Add response time indicator

**Deliverables**:
- Component: `components/MessageActions.tsx`
- Component: `components/ResponseStats.tsx` (NEW)
- Toast notifications
- Message metadata display
- Token usage visualization

**Estimated Time**: 1.5 hours

**Response Stats Display**:
```
Message Info:
├─ Tokens (Prompt/Response/Total): 45 / 123 / 168
├─ Finish Reason: STOP ✓
├─ Response Time: 2.34s
└─ Temperature Used: 1.0 | Model: gemini-2.5-flash
```

---

## Settings Validation Rules (from JSON Schema)

### Basic Settings Constraints

| Setting | Type | Min | Max | Default | Description |
|---------|------|-----|-----|---------|-------------|
| temperature | number | 0 | 2 | 1.0 | Randomness (0=deterministic, 2=creative) |
| maxOutputTokens | number | 1 | 8192 | 8192 | Max response length |
| topP | number | 0 | 1 | 0.95 | Nucleus sampling threshold |
| topK | number | 1 | 100 | 40 | Top-K token filtering |
| candidateCount | number | 1 | 8 | 1 | Responses to generate |
| seed | number | - | - | random | For reproducibility |
| presencePenalty | number | -2 | 2 | 0 | Penalize repeated tokens |
| frequencyPenalty | number | -2 | 2 | 0 | Penalize token frequency |

### Validation on Frontend

```typescript
function validateSettings(settings: Settings): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (settings.temperature < 0 || settings.temperature > 2) {
    errors.push("Temperature must be between 0 and 2");
  }
  if (settings.maxOutputTokens < 1 || settings.maxOutputTokens > 8192) {
    errors.push("Max tokens must be between 1 and 8192");
  }
  if (settings.topP < 0 || settings.topP > 1) {
    errors.push("Top-P must be between 0 and 1");
  }
  if (settings.topK < 1 || settings.topK > 100) {
    errors.push("Top-K must be between 1 and 100");
  }
  // ... etc
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

---

## Response Finish Reasons

**From Google Generative AI SDK**:

| Reason | Meaning | Action |
|--------|---------|--------|
| `STOP` | Natural end | ✓ Success |
| `MAX_TOKENS` | Token limit reached | ⚠️ Response incomplete |
| `SAFETY` | Content blocked | 🚫 Safety filter triggered |
| `RECITATION` | Copyright concern | 🚫 Recitation filter |
| `OTHER` | Other reason | ❓ Unknown |
| `UNKNOWN` | Unknown | ❓ SDK error |

---

### New Dependencies (Optional)
- **zustand** ^4.x - State management (cleaner than localStorage juggling)
- **react-hot-toast** ^2.x - Toast notifications
- **clsx** ^2.x - Class name management
- **date-fns** ^3.x - Date formatting

### Alternative: No Additional Dependencies
- Use React Context + localStorage (lightweight)
- Use native browser notifications
- Use Tailwind for everything

**Recommendation**: Start with no additional deps, add if needed.

---

## File Structure After Phase 5

```
project-s3/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # Main chat page (updated)
│   └── globals.css
│
├── components/
│   ├── ChatPage.tsx                # Chat UI (refactored from page.tsx)
│   ├── ConversationSidebar.tsx    # NEW - Conversation history
│   ├── SettingsPanel.tsx           # NEW - Settings modal
│   ├── MessageActions.tsx          # NEW - Message controls
│   └── ai-elements/                # AI Elements components (if using)
│
├── hooks/
│   ├── useConversations.ts         # NEW - Conversation management
│   ├── useSettings.ts              # NEW - Settings state
│   └── useChat.ts                  # Existing chat logic
│
├── types/
│   ├── chat.ts                     # Message, Conversation types
│   └── settings.ts                 # Settings interface
│
├── utils/
│   ├── storage.ts                  # localStorage helpers
│   └── api.ts                      # API call helpers
│
├── backend/                        # Unchanged
│
├── .env.local
├── package.json                    # Add new deps (optional)
└── ...
```

---

## Implementation Strategy

### Phase 5.1: Start with Persistence
1. Extract message state to custom hook
2. Add localStorage save/load
3. Test with page reloads

### Phase 5.2: Add Sidebar
1. Create ConversationSidebar component
2. Add conversation switching logic
3. Add create/delete functions
4. Refactor page.tsx layout

### Phase 5.3: Add Settings
1. Create SettingsPanel component
2. Create useSettings hook
3. Apply settings to API calls
4. Add settings button to header

### Phase 5.4: Polish (Optional)
1. Add message actions (copy, regenerate)
2. Add timestamps
3. Add toast notifications

---

## API Changes Required (Minimal)

**Current Chat Endpoint**: Works as-is
```json
{
  "message": "...",
  "conversationHistory": [...],
  "config": { 
    "temperature": 1.0,
    "maxOutputTokens": 8192,
    "topP": 0.95,
    "topK": 40,
    "systemInstruction": "...",
    "stopSequences": ["END"],
    "seed": 12345
  }
}
```

**Response includes valuable metadata**:
```json
{
  "success": true,
  "data": {
    "message": "...",
    "response": "...",
    "model": "gemini-2.5-flash",
    "config": { ... }
  },
  "usageMetadata": {
    "promptTokenCount": 45,
    "candidatesTokenCount": 123,
    "totalTokenCount": 168,
    "finishReason": "STOP"
  },
  "timestamp": "2026-05-10T..."
}
```

**No backend changes needed!** All settings handled on frontend, response metadata captured from API.

---

## State Management Design

### Settings Schema (from JSON-SCHEMA.md)

```typescript
interface Settings {
  // Basic Settings
  model: string;                      // e.g., "gemini-2.5-flash"
  temperature: number;                // 0-2, default 1.0
  maxOutputTokens: number;            // 1-8192, default 8192
  systemInstruction: string;          // System prompt
  
  // Standard Settings
  topP: number;                       // 0-1, default 0.95
  topK: number;                       // 1-100, default 40
  stopSequences: string[];            // Stop words
  seed?: number;                      // For reproducibility
  
  // Advanced Settings
  presencePenalty: number;            // -2 to 2, default 0
  frequencyPenalty: number;           // -2 to 2, default 0
  candidateCount: number;             // 1-8, default 1
  responseMimeType: string;           // "text/plain" or "application/json"
}

interface ResponseMetadata {
  promptTokenCount: number;
  candidatesTokenCount: number;
  totalTokenCount: number;
  finishReason: string;               // "STOP" | "MAX_TOKENS" | "SAFETY" | "OTHER"
  responseTime: number;               // ms
  timestamp: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  settings: Settings;                 // Settings snapshot
  metadata: ResponseMetadata[];        // Per-message stats
  createdAt: Date;
  updatedAt: Date;
}
```

### Option 1: React Context + localStorage (Lightweight)
```typescript
// contexts/ChatContext.tsx
interface ChatContextType {
  conversations: Conversation[];
  currentConversation: Conversation;
  settings: Settings;
  responseStats: ResponseMetadata | null;
  
  // Methods
  createConversation(): void;
  deleteConversation(id: string): void;
  switchConversation(id: string): void;
  updateSettings(settings: Settings): void;
  saveConversation(): void;
  loadConversations(): void;
}
```

### Option 2: Zustand (Scalable)
```typescript
// stores/chatStore.ts
create<ChatState>((set) => ({
  conversations: [],
  currentConversation: null,
  settings: DEFAULT_SETTINGS,
  responseStats: null,
  
  // Actions
  createConversation: () => { ... },
  deleteConversation: (id) => { ... },
  updateSettings: (settings) => { ... },
  setResponseStats: (stats) => { ... },
}))
```

**Recommendation**: Start with Context + localStorage, migrate to Zustand if needed.

---

## localStorage Schema

```javascript
// conversations
{
  "project-s3:conversations": [
    {
      "id": "conv-001",
      "title": "What is AI?",
      "messages": [
        { "role": "user", "content": "..." },
        { "role": "assistant", "content": "..." }
      ],
      "settings": { /* copy of settings at time */ },
      "createdAt": "2026-05-10T...",
      "updatedAt": "2026-05-10T..."
    }
  ],
  "project-s3:currentConversationId": "conv-001",
  "project-s3:settings": {
    "model": "gemini-2.5-flash",
    "temperature": 1.0,
    "maxOutputTokens": 8192,
    "systemPrompt": "..."
  }
}
```

---

## UI Layout (After Phase 5)

```
┌────────────────────────────────────────────────────────────┐
│ Gemini Chat                              [Settings] [⚙️]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Conversations        [+ New] [Clear All]                   │
│ ├─ Today                                                   │
│ │  ✓ What is AI? (5)                                      │
│ │  How to learn ML (3)                                    │
│ │                                                          │
│ ├─ Yesterday                                              │
│ │  Getting started (8)                                    │
│ │                                                          │
│ [Settings]                                                │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [Messages Area - scrollable]                             │
│                                                             │
│  User: What is AI?                                        │
│  [copy] [delete]                                          │
│                                                             │
│  Assistant: AI is...                                      │
│  [copy] [regenerate] [delete]                             │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ [Type message...] [Send]                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Performance Considerations

1. **localStorage Size Limit**: ~5-10MB per domain
   - Compress old conversations
   - Implement archiving/export

2. **Re-render Optimization**:
   - Use React.memo for message components
   - Separate concerns (sidebar, messages, settings)
   - Lazy load conversation history

3. **API Optimization**:
   - Debounce auto-save
   - Batch updates
   - Cache model list

---

## Testing Checklist

- [ ] Conversation saves on new message
- [ ] Conversation loads on page reload
- [ ] Create new conversation works
- [ ] Switch between conversations works
- [ ] Delete conversation works
- [ ] Settings save and apply to API calls
- [ ] Message copy works
- [ ] Regenerate sends correct config
- [ ] localStorage size < 5MB
- [ ] No console errors

---

## Timeline Estimate

| Phase | Duration | Difficulty | Status |
|-------|----------|-----------|--------|
| 5.1: Persistence | 45 min | Easy | Ready |
| 5.2: Sidebar | 1 hour | Medium | Ready |
| 5.3: Settings + Stats | 1.5 hours | Medium | Ready (Enhanced) |
| 5.4: Message Controls | 1.5 hours | Easy-Medium | Bonus |
| **Total** | **~4.5 hours** | **Medium** | **Ready** |

---

## Next Steps After Phase 5

### Phase 6 (Future): Advanced Features
- Message streaming/pagination
- Export conversations (JSON/PDF)
- Search across conversations
- Conversation sharing/sync
- Dark mode toggle
- Multiple language support

### Phase 7 (Future): Backend Integration
- Save conversations to database
- User authentication
- Cloud sync
- Conversation versioning

---

## Rollback Plan

If anything breaks:
```bash
# Clear localStorage (in browser console)
localStorage.clear();

# Revert to Phase 3 by removing:
# - components/ConversationSidebar.tsx
# - components/SettingsPanel.tsx
# - hooks/useConversations.ts
# - hooks/useSettings.ts

# Git reset to last commit
git reset --hard HEAD
```

---

## Approval Checklist

- [ ] Approve Phase 5.1 (Persistence)
- [ ] Approve Phase 5.2 (Sidebar)
- [ ] Approve Phase 5.3 (Settings)
- [ ] Approve Phase 5.4 (Polish)
- [ ] Proceed with implementation

---

**Proposal Date**: May 10, 2026
**Target Start**: Immediate (Phase 3 complete)
**Target End**: ~4 hours
**Status**: Ready for approval
