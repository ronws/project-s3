# LiteClient + MCP Integration Proposal

## Executive Summary

This proposal outlines the integration of **LiteClient** as a lightweight REST API client and **MCP (Model Context Protocol)** server setup to enhance the development and testing workflow for the `gemini-flash-api` project.

---

## Current State

- **API Server**: Express.js running on port 4443
- **Endpoints**: `/generate-text`, `/generate`
- **Model**: Gemini 2.5 Flash via `@google/genai`
- **Testing**: Manual curl requests

---

## Problem Statement

1. **No dedicated API client** - Using raw curl commands for testing
2. **No visual interface** - Difficult to inspect responses, headers, and body
3. **No MCP integration** - AI agents cannot directly interact with the API
4. **No collection management** - Cannot save and organize API requests

---

## Proposed Solution

### 1. LiteClient - Lightweight REST API Client

**Why LiteClient?**
| Feature | LiteClient | Postman |
|---------|-----------|---------|
| Size | <2MB | ~500MB |
| Startup | Instant | Slow |
| Storage | Local-only | Cloud-optional |
| Account required | No | Yes |
| Telemetry | None | Yes |
| VS Code integration | Native | No |

**Installation**
```bash
# VS Code Marketplace
# Search: "LiteClient" in VS Code Extensions

# Or via CLI
code --install-extension liteclienthq.liteclient
```

**Configuration for gemini-flash-api**

Create collection: `gemini-flash-api`

```json
{
  "name": "gemini-flash-api",
  "requests": [
    {
      "name": "Generate Text",
      "method": "POST",
      "url": "http://localhost:4443/generate-text",
      "headers": [
        { "key": "Content-Type", "value": "application/json" }
      ],
      "body": {
        "type": "json",
        "content": {
          "prompt": "Hello, how are you?"
        }
      }
    },
    {
      "name": "Generate (Legacy)",
      "method": "POST",
      "url": "http://localhost:4443/generate",
      "headers": [
        { "key": "Content-Type", "value": "application/x-www-form-urlencoded" }
      ],
      "body": {
        "type": "form",
        "content": [
          { "key": "prompt", "value": "What is 2+2?" }
        ]
      }
    }
  ]
}
```

**Environment Variables**
```json
{
  "name": "Development",
  "variables": [
    { "key": "BASE_URL", "value": "http://localhost:4443" },
    { "key": "GEMINI_MODEL", "value": "gemini-2.5-flash" }
  ]
}
```

---

### 2. MCP Server Setup

**Why MCP?**
- AI agents can directly call your API as tools
- Structured input/output with schema validation
- Works with Claude Desktop, Cursor, Windsurf, OpenAI Codex
- Standardized protocol for tool definitions

**Architecture**

```
┌─────────────┐      HTTP       ┌─────────────────┐
│  AI Agent   │ ──────────────► │  MCP Server     │
│ (Claude/    │                │  (mcp-lite)     │
│  Cursor)    │ ◄────────────── │                 │
└─────────────┘                └────────┬────────┘
                                         │
                                         ▼
                                  ┌─────────────────┐
                                  │ gemini-flash-api│
                                  │  (Express.js)   │
                                  └─────────────────┘
```

**Implementation Options**

#### Option A: mcp-lite (Recommended - Minimal)

```typescript
// mcp-server/index.ts
import { McpServer, StreamableHttpTransport } from 'mcp-lite'
import { z } from 'zod'

const mcp = new McpServer({
  name: 'gemini-flash-api',
  version: '1.0.0',
  schemaAdapter: (schema) => z.toJSONSchema(schema as z.ZodType)
})

// Tool: Generate Text
mcp.tool('generate_text', {
  description: 'Generate text using Gemini 2.5 Flash model',
  inputSchema: z.object({
    prompt: z.string().min(1).describe('The input prompt for text generation')
  }),
  outputSchema: z.object({
    result: z.string().describe('Generated text response')
  }),
  handler: async (args) => {
    const response = await fetch('http://localhost:4443/generate-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: args.prompt })
    })
    const data = await response.json()
    return {
      content: [{ type: 'text', text: data.result }],
      structuredContent: { result: data.result }
    }
  }
})

// Tool: List Available Models
mcp.tool('list_models', {
  description: 'List available Gemini models',
  inputSchema: z.object({}),
  outputSchema: z.object({
    models: z.array(z.string())
  }),
  handler: async () => ({
    content: [{ type: 'text', text: 'gemini-2.5-flash, gemini-2.0-pro' }],
    structuredContent: { models: ['gemini-2.5-flash', 'gemini-2.0-pro'] }
  })
})

// Start server
const transport = new StreamableHttpTransport()
const handler = transport.bind(mcp)

export { handler }
```

**Run:**
```bash
npx tsx mcp-server/index.ts
# Server runs on http://localhost:3000/mcp
```

#### Option B: LiteMCP (Alternative)

```typescript
// mcp-server/litemcp.ts
import { LiteMCP } from 'litemcp'
import { z } from 'zod'

const server = new LiteMCP('gemini-flash-api', '1.0.0')

server.tool('generate_text', {
  description: 'Generate text using Gemini',
  inputSchema: z.object({
    prompt: z.string()
  }),
  handler: async (args) => {
    const res = await fetch('http://localhost:4443/generate-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: args.prompt })
    })
    const data = await res.json()
    return [{ type: 'text', text: data.result }]
  }
})

server.start({ transportType: 'sse', sse: { port: 8080 } })
```

---

### 3. Claude Desktop Integration

**Configuration:**

```json
// ~/.config/Claude/claude_desktop_config.json
{
  "mcpServers": {
    "gemini-flash-api": {
      "command": "npx",
      "args": ["tsx", "path/to/mcp-server/index.ts"],
      "env": {}
    }
  }
}
```

**Usage in Claude:**
```
User: Write a haiku about the ocean
Claude: [calls generate_text tool with prompt]
→ Returns: "Waves crash on the shore..."
```

---

## Implementation Roadmap

### Phase 1: LiteClient Setup (Day 1)
- [ ] Install LiteClient VS Code extension
- [ ] Create collection for gemini-flash-api
- [ ] Add all endpoints to collection
- [ ] Configure environment variables
- [ ] Test all endpoints

### Phase 2: MCP Server Development (Day 2)
- [ ] Initialize mcp-lite project
- [ ] Implement generate_text tool
- [ ] Implement list_models tool
- [ ] Add error handling
- [ ] Test with MCP Inspector

### Phase 3: AI Agent Integration (Day 3)
- [ ] Configure Claude Desktop MCP
- [ ] Test tool invocation
- [ ] Document usage for team

---

## File Structure

```
gemini-flash-api/
├── index.js              # Main API server
├── package.json
├── JSON-SCHEMA.md        # API documentation
├── liteclient_proposal.md
├── liteclient/
│   └── collection.json  # LiteClient collection
└── mcp-server/
    ├── package.json
    ├── tsconfig.json
    └── index.ts          # MCP server
```

---

## Benefits

| Benefit | Description |
|---------|-------------|
| **Faster Testing** | Visual interface, no more curl commands |
| **Collection Management** | Save and organize API requests |
| **AI Integration** | Agents can call your API directly |
| **Type Safety** | Zod schema validation |
| **Zero Bloat** | <2MB vs 500MB for Postman |
| **Privacy** | Local-only, no telemetry |

---

## Cost Comparison

| Tool | Price |
|------|-------|
| LiteClient | Free (MIT) |
| Postman | $12-25/month |
| Insomnia | $8-17/month |
| MCP Server | Free (open-source) |

---

## Recommendation

**Proceed with:**
1. **LiteClient** for REST API testing
2. **mcp-lite** for MCP server (minimal, fetch-first)
3. **Claude Desktop** as initial MCP client

This stack provides:
- Lightweight local-first API client
- AI agent tool integration
- Zero additional costs
- Minimal dependencies

---

## Next Steps

1. Approve this proposal
2. Install LiteClient extension
3. Create initial collection
4. Set up MCP server project
5. Test end-to-end flow