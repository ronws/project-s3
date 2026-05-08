# Google Generative AI SDK - JSON Schema Reference

Complete type definitions extracted from `@google/genai` package (v1.52.0)

---

## Table of Contents
1. [Request Types](#request-types)
2. [Response Types](#response-types)
3. [Content & Parts](#content--parts)
4. [Configuration Types](#configuration-types)
5. [Utility Types](#utility-types)

---

## Request Types

### GenerateContentParameters
Main input for content generation.

```json
{
  "model": "string",
  "contents": "ContentListUnion",
  "config": "GenerateContentConfig"
}
```

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `model` | `string` | ✅ | Model ID (e.g., "gemini-2.5-flash", "gemini-2.0-pro") |
| `contents` | `ContentListUnion` | ✅ | Input content (string, Content object, or Part array) |
| `config` | `GenerateContentConfig` | ❌ | Generation configuration |

---

### ContentListUnion
Accepted content input formats:

```json
// String (simple text)
"Hello world"

// Single Content object
{ "role": "user", "parts": [{ "text": "Hello" }] }

// Array of Content
[
  { "role": "user", "parts": [{ "text": "Hello" }] },
  { "role": "model", "parts": [{ "text": "Hi!" }] }
]

// Single Part
{ "text": "Hello" }

// Array of Parts
[{ "text": "Hello" }, { "text": "world" }]
```

---

### GenerateContentConfig
Configuration options for content generation.

```json
{
  "temperature": 0.9,
  "maxOutputTokens": 2048,
  "topP": 0.95,
  "topK": 40,
  "candidateCount": 1,
  "stopSequences": ["END"],
  "systemInstruction": "You are a helpful assistant.",
  "responseMimeType": "application/json",
  "responseSchema": { ... },
  "responseJsonSchema": { ... },
  "responseLogprobs": false,
  "logprobs": 5,
  "presencePenalty": 0.0,
  "frequencyPenalty": 0.0,
  "seed": 12345,
  "safetySettings": [ ... ],
  "tools": [ ... ],
  "toolConfig": { ... },
  "cachedContent": "string",
  "responseModalities": ["TEXT", "IMAGE"],
  "mediaResolution": { ... },
  "speechConfig": { ... },
  "audioTimestamp": false,
  "automaticFunctionCalling": { ... },
  "thinkingConfig": { ... },
  "routingConfig": { ... },
  "modelSelectionConfig": { ... },
  "labels": { }
}
```

| Property | Type | Default | Range | Description |
|----------|------|---------|-------|-------------|
| `temperature` | `number` | 1.0 | 0-2 | Controls randomness. Higher = more creative |
| `maxOutputTokens` | `number` | 8192 | 1-8192 | Max tokens in response |
| `topP` | `number` | 0.95 | 0-1 | Nucleus sampling threshold |
| `topK` | `number` | 40 | 1-100 | Top-k token filtering |
| `candidateCount` | `number` | 1 | 1-8 | Number of responses to generate |
| `stopSequences` | `string[]` | - | - | Stop generation when these appear |
| `systemInstruction` | `ContentUnion` | - | - | System prompt/instructions |
| `responseMimeType` | `string` | "text/plain" | - | Output format (text/plain, application/json) |
| `responseSchema` | `SchemaUnion` | - | - | JSON schema for structured output |
| `responseJsonSchema` | `unknown` | - | - | Alternative JSON Schema format |
| `responseLogprobs` | `boolean` | false | - | Include token log probabilities |
| `logprobs` | `number` | - | 1-20 | Number of top tokens for logprobs |
| `presencePenalty` | `number` | 0.0 | -2 to 2 | Penalize repeated tokens |
| `frequencyPenalty` | `number` | 0.0 | -2 to 2 | Penalize token frequency |
| `seed` | `number` | random | - | Fixed seed for reproducibility |
| `safetySettings` | `SafetySetting[]` | - | - | Content safety filters |
| `tools` | `ToolListUnion` | - | - | Function calling tools |
| `toolConfig` | `ToolConfig` | - | - | Tool use configuration |
| `cachedContent` | `string` | - | - | Context cache resource name |
| `responseModalities` | `string[]` | - | - | Output modalities (TEXT, IMAGE, AUDIO, VIDEO) |
| `mediaResolution` | `MediaResolution` | - | - | Input media resolution |
| `speechConfig` | `SpeechConfigUnion` | - | - | Audio generation settings |
| `audioTimestamp` | `boolean` | false | - | Include audio timestamps |
| `automaticFunctionCalling` | `AutomaticFunctionCallingConfig` | - | - | Auto function calling config |
| `thinkingConfig` | `ThinkingConfig` | - | - | Thinking/reasoning config |

---

## Response Types

### GenerateContentResponse
Main response object from content generation.

```json
{
  "candidates": [ ... ],
  "promptFeedback": { ... },
  "usageMetadata": { ... },
  "modelVersion": "string",
  "responseId": "string",
  "createTime": "string",
  "automaticFunctionCallingHistory": [ ... ],
  "modelStatus": { },
  "sdkHttpResponse": { }
}
```

| Property | Type | Description |
|----------|------|-------------|
| `candidates` | `Candidate[]` | Response candidates (usually 1) |
| `promptFeedback` | `GenerateContentResponsePromptFeedback` | Content filter results for prompt |
| `usageMetadata` | `GenerateContentResponseUsageMetadata` | Token usage statistics |
| `modelVersion` | `string` | Model version used |
| `responseId` | `string` | Unique response identifier |
| `createTime` | `ISO8601 string` | Request timestamp |
| `automaticFunctionCallingHistory` | `Content[]` | Function call history |
| `modelStatus` | `ModelStatus` | Current model status |
| `sdkHttpResponse` | `HttpResponse` | Raw HTTP response |

**Getters:**
- `response.text` - Concatenated text from first candidate
- `response.data` - Inline data (e.g., base64 images)
- `response.functionCalls` - Function calls from first candidate

---

### Candidate
A single response generated by the model.

```json
{
  "content": { "role": "model", "parts": [{ "text": "..." }] },
  "citationMetadata": { "citationSources": [...] },
  "finishMessage": "stop",
  "finishReason": "STOP",
  "tokenCount": 150,
  "groundingMetadata": { ... },
  "avgLogprobs": -0.5,
  "index": 0,
  "logprobsResult": { ... },
  "safetyRatings": [ ... ],
  "urlContextMetadata": { }
}
```

| Property | Type | Description |
|----------|------|-------------|
| `content` | `Content` | Generated content |
| `citationMetadata` | `CitationMetadata` | Source attributions |
| `finishMessage` | `string` | Human-readable finish reason |
| `finishReason` | `FinishReason` | Why generation stopped |
| `tokenCount` | `number` | Token count for this candidate |
| `groundingMetadata` | `GroundingMetadata` | Grounding sources |
| `avgLogprobs` | `number` | Average log probability |
| `index` | `number` | Candidate index (when candidateCount > 1) |
| `logprobsResult` | `LogprobsResult` | Detailed token logprobs |
| `safetyRatings` | `SafetyRating[]` | Safety ratings |
| `urlContextMetadata` | `UrlContextMetadata` | URL context metadata |

**FinishReason values:**
- `STOP` - Natural stop
- `MAX_TOKENS` - Token limit reached
- `SAFETY` - Blocked for safety
- `RECITATION` - Blocked for recitation
- `OTHER` - Other reason
- `UNKNOWN` - Unknown reason

---

### GenerateContentResponseUsageMetadata
Token usage statistics.

```json
{
  "promptTokenCount": 10,
  "candidatesTokenCount": 50,
  "totalTokenCount": 60,
  "cachedContentTokenCount": 0,
  "promptTokensDetails": [ ... ],
  "candidatesTokensDetails": [ ... ],
  "cacheTokensDetails": [ ... ],
  "thoughtsTokenCount": 0,
  "toolUsePromptTokenCount": 0,
  "toolUsePromptTokensDetails": [ ]
}
```

| Property | Type | Description |
|----------|------|-------------|
| `promptTokenCount` | `number` | Tokens in the prompt |
| `candidatesTokenCount` | `number` | Tokens in the response |
| `totalTokenCount` | `number` | Total tokens (prompt + response) |
| `cachedContentTokenCount` | `number` | Tokens from cached content |
| `promptTokensDetails` | `ModalityTokenCount[]` | Token breakdown by modality |
| `candidatesTokensDetails` | `ModalityTokenCount[]` | Response token breakdown |
| `cacheTokensDetails` | `ModalityTokenCount[]` | Cached token breakdown |
| `thoughtsTokenCount` | `number` | Tokens in model's thoughts |
| `toolUsePromptTokenCount` | `number` | Tool execution tokens |
| `toolUsePromptTokensDetails` | `ModalityTokenCount[]` | Tool token breakdown |

---

### GenerateContentResponsePromptFeedback
Content filter results for the prompt.

```json
{
  "blockReason": "SAFETY",
  "blockReasonMessage": "Content blocked",
  "safetyRatings": [
    { "category": "HARM_CATEGORY_HARASSMENT", "probability": "NEGLIGIBLE" }
  ]
}
```

| Property | Type | Description |
|----------|------|-------------|
| `blockReason` | `BlockedReason` | Why prompt was blocked |
| `blockReasonMessage` | `string` | Human-readable block reason |
| `safetyRatings` | `SafetyRating[]` | Safety ratings for prompt |

---

## Content & Parts

### Content
Multi-part message content.

```json
{
  "parts": [{ "text": "Hello" }],
  "role": "user"
}
```

| Property | Type | Description |
|----------|------|-------------|
| `parts` | `Part[]` | List of content parts |
| `role` | `string` | "user" or "model" |

---

### Part
Individual content piece. Multiple fields are mutually exclusive.

```json
// Text
{ "text": "Hello world" }

// Inline data (image, audio, video)
{
  "inlineData": {
    "mimeType": "image/png",
    "data": "base64encodedstring"
  }
}

// File data (Google Cloud Storage)
{
  "fileData": {
    "mimeType": "image/png",
    "fileUri": "gs://bucket/file.png"
  }
}

// Function call (from model)
{
  "functionCall": {
    "name": "getWeather",
    "args": { "location": "Tokyo" }
  }
}

// Function response (from tool)
{
  "functionResponse": {
    "name": "getWeather",
    "response": { "temp": 22 }
  }
}

// Executable code
{
  "executableCode": {
    "language": "python",
    "code": "print('Hello')"
  }
}

// Code execution result
{
  "codeExecutionResult": {
    "outcome": "OK",
    "output": "Hello"
  }
}

// Thought (reasoning)
{
  "thought": true,
  "thoughtSignature": "base64signature"
}

// Tool call (server-side)
{
  "toolCall": {
    "id": "call_123",
    "name": "search",
    "args": { "query": "..." }
  }
}

// Tool response
{
  "toolResponse": {
    "id": "call_123",
    "name": "search",
    "response": { "results": [...] }
  }
}
```

| Property | Type | Description |
|----------|------|-------------|
| `text` | `string` | Text content |
| `inlineData` | `Blob` | Inline binary data (base64) |
| `fileData` | `FileData` | External file reference |
| `functionCall` | `FunctionCall` | Predicted function call |
| `functionResponse` | `FunctionResponse` | Function execution result |
| `executableCode` | `ExecutableCode` | Code to execute |
| `codeExecutionResult` | `CodeExecutionResult` | Code execution output |
| `thought` | `boolean` | Reasoning thought |
| `thoughtSignature` | `string` | Thought signature (base64) |
| `toolCall` | `ToolCall` | Server-side tool call |
| `toolResponse` | `ToolResponse` | Tool execution result |
| `mediaResolution` | `PartMediaResolution` | Media resolution info |
| `partMetadata` | `Record<string, unknown>` | Custom metadata |

---

### Blob (inlineData)
```json
{
  "mimeType": "image/png",
  "data": "base64encodedstring"
}
```

Supported MIME types:
- **Images**: image/png, image/jpeg, image/webp, image/heic, image/heif, image/gif, image/bmp, image/tiff
- **Audio**: audio/mp3, audio/wav, audio/mp4, audio/mpeg
- **Video**: video/mp4, video/mpeg
- **Text**: text/plain, application/json

---

## Configuration Types

### SafetySetting
Content safety configuration.

```json
{
  "category": "HARM_CATEGORY_HARASSMENT",
  "threshold": "BLOCK_MEDIUM_AND_ABOVE"
}
```

**Categories:**
- `HARM_CATEGORY_HARASSMENT`
- `HARM_CATEGORY_HATE_SPEECH`
- `HARM_CATEGORY_SEXUALLY_EXPLICIT`
- `HARM_CATEGORY_DANGEROUS_CONTENT`
- `HARM_CATEGORY_CIVIL_INTEGRITY`
- `HARM_CATEGORY_UNSPECIFIED`

**Thresholds:**
- `HARM_BLOCK_THRESHOLD_UNSPECIFIED`
- `BLOCK_LOW_AND_ABOVE`
- `BLOCK_MEDIUM_AND_ABOVE`
- `BLOCK_HIGH_AND_ABOVE`
- `BLOCK_ONLY_HIGH`
- `OFF`

---

### Tool
Function declaration for function calling.

```json
{
  "functionDeclarations": [
    {
      "name": "getWeather",
      "description": "Get weather for a location",
      "parameters": {
        "type": "object",
        "properties": {
          "location": { "type": "string", "description": "City name" }
        },
        "required": ["location"]
      }
    }
  ]
}
```

---

### SchemaUnion
JSON schema for structured output.

```json
{
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "age": { "type": "integer" },
    "email": { "type": "string", "format": "email" }
  },
  "required": ["name"],
  "enum": ["VALUE1", "VALUE2"],
  "description": "User information"
}
```

Supported JSON Schema features:
- `type` - string, number, integer, boolean, array, object
- `properties` - Object properties
- `items` - Array item schema
- `enum` - Allowed values
- `description` - Field description
- `format` - email, uri, date-time, etc.
- `minimum`, `maximum` - Number constraints
- `minLength`, `maxLength` - String constraints
- `required` - Required fields
- `additionalProperties` - Extra properties
- `$ref` - Schema references

---

### ThinkingConfig
Configuration for thinking/reasoning features.

```json
{
  "thinkingBudget": 2048
}
```

| Property | Type | Description |
|----------|------|-------------|
| `thinkingBudget` | `number` | Max tokens for thinking (0 = disabled) |

---

### AutomaticFunctionCallingConfig
Auto function calling configuration.

```json
{
  "disable": false,
  "maxCalls": 5
}
```

| Property | Type | Description |
|----------|------|-------------|
| `disable` | `boolean` | Disable automatic function calling |
| `maxCalls` | `number` | Max number of function calls |

---

### SpeechConfigUnion
Audio generation settings.

```json
{
  "voiceConfig": {
    "prebuiltVoiceConfig": { "voiceName": "en-US-Neural2-J" }
  },
  "languageCode": "en-US",
  "audioEncoding": "LINEAR16",
  "sampleRateHertz": 24000,
  "speakingRate": 1.0,
  "pitch": 0.0,
  "volumeGainDb": 0.0,
  "effectsProfileId": [ "headphone-class-device" ]
}
```

---

## Utility Types

### CountTokensParameters
```json
{
  "model": "string",
  "contents": "ContentListUnion",
  "config": "CountTokensConfig"
}
```

### CountTokensResponse
```json
{
  "totalTokens": 100,
  "totalBillableCharacters": 450,
  "promptTokenCount": 100,
  "candidatesTokenCount": 0
}
```

---

### EmbedContentParameters
```json
{
  "model": "string",
  "content": "ContentUnion",
  "taskType": "RETRIEVAL_QUERY",
  "title": "string",
  "outputDimensionality": 768
}
```

### EmbedContentResponse
```json
{
  "embedding": {
    "values": [0.1, 0.2, -0.3, ...]
  },
  "statistics": {
    "truncated": false,
    "tokenCount": 10
  }
}
```

---

## Examples

### Simple Text Generation
```json
// Request
{
  "model": "gemini-2.5-flash",
  "contents": "What is the capital of France?"
}

// Response
{
  "candidates": [{
    "content": {
      "role": "model",
      "parts": [{ "text": "The capital of France is Paris." }]
    },
    "finishReason": "STOP"
  }],
  "usageMetadata": {
    "promptTokenCount": 7,
    "candidatesTokenCount": 8,
    "totalTokenCount": 15
  }
}
```

### JSON Output with Schema
```json
// Request
{
  "model": "gemini-2.5-flash",
  "contents": "Extract the name and age from: John is 30 years old",
  "config": {
    "responseMimeType": "application/json",
    "responseSchema": {
      "type": "object",
      "properties": {
        "name": { "type": "string" },
        "age": { "type": "integer" }
      }
    }
  }
}

// Response
{
  "candidates": [{
    "content": {
      "parts": [{ "text": "{\"name\": \"John\", \"age\": 30}" }]
    }
  }]
}
```

### Multi-turn Conversation
```json
// Request
{
  "model": "gemini-2.5-flash",
  "contents": [
    { "role": "user", "parts": [{ "text": "Hi" }] },
    { "role": "model", "parts": [{ "text": "Hello! How can I help?" }] },
    { "role": "user", "parts": [{ "text": "What's 2+2?" }] }
  ]
}
```

### Image Input
```json
// Request
{
  "model": "gemini-2.5-flash",
  "contents": {
    "parts": [
      {
        "text": "What do you see in this image?"
      },
      {
        "inlineData": {
          "mimeType": "image/png",
          "data": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        }
      }
    ]
  }
}
```

### Function Calling
```json
// Request
{
  "model": "gemini-2.5-flash",
  "contents": "What's the weather in Tokyo?",
  "config": {
    "tools": [{
      "functionDeclarations": [{
        "name": "getWeather",
        "description": "Get weather for a location",
        "parameters": {
          "type": "object",
          "properties": {
            "location": { "type": "string" }
          },
          "required": ["location"]
        }
      }]
    }]
  }
}

// Response (with function call)
{
  "candidates": [{
    "content": {
      "parts": [{
        "functionCall": {
          "name": "getWeather",
          "args": { "location": "Tokyo" }
        }
      }]
    }
  }]
}
```

---

## TypeScript Reference

Import types directly from the SDK:

```typescript
import {
  GoogleGenAI,
  GenerateContentParameters,
  GenerateContentResponse,
  GenerateContentConfig,
  Content,
  Part,
  Candidate,
  SafetySetting,
  Tool
} from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: 'Hello',
  config: {
    temperature: 0.9,
    maxOutputTokens: 1024
  }
} satisfies GenerateContentParameters);
```

---

*Generated from @google/genai v1.52.0 type definitions*