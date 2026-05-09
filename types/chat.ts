export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface ResponseMetadata {
  promptTokenCount?: number;
  candidatesTokenCount?: number;
  totalTokenCount?: number;
  finishReason?: string;
  responseTime?: number;
  model?: string;
  timestamp?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  metadata: ResponseMetadata[];
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  model: string;
  temperature: number;
  maxOutputTokens: number;
  systemInstruction: string;
  topP: number;
  topK: number;
  stopSequences: string[];
  seed?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
  candidateCount?: number;
  responseMimeType?: string;
}

export const DEFAULT_SETTINGS: Settings = {
  model: 'gemini-2.5-flash',
  temperature: 1.0,
  maxOutputTokens: 8192,
  systemInstruction: 'You are a helpful AI assistant.',
  topP: 0.95,
  topK: 40,
  stopSequences: [],
};