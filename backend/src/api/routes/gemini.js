/**
 * Gemini API Routes
 * Handles text, image, document, audio, and chat interactions with Gemini
 */

import { Router } from 'express';
import { GoogleGenAI } from '@google/genai';
import { ResponseFormatter } from '../core/responses.js';
import {
  BadRequestException,
  ValidationException,
  InternalServerException,
  ServiceUnavailableException,
} from '../core/exceptions.js';
import { config } from '../../config/core.js';

const router = Router();

// Initialize Google GenAI client
const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });

/**
 * Extract generation config from request body
 * Merges request options with defaults from config
 */
function getGenerationConfig(req) {
  const bodyConfig = req.body.config || {};
  
  // Start with defaults from core config
  const generationConfig = {
    temperature: config.generation.temperature,
    maxOutputTokens: config.generation.maxOutputTokens,
    topP: config.generation.topP,
    topK: config.generation.topK,
    candidateCount: config.generation.candidateCount,
  };

  // Override with request body config (if provided)
  if (bodyConfig.temperature !== undefined) {
    generationConfig.temperature = bodyConfig.temperature;
  }
  if (bodyConfig.maxOutputTokens !== undefined) {
    generationConfig.maxOutputTokens = bodyConfig.maxOutputTokens;
  }
  if (bodyConfig.topP !== undefined) {
    generationConfig.topP = bodyConfig.topP;
  }
  if (bodyConfig.topK !== undefined) {
    generationConfig.topK = bodyConfig.topK;
  }
  if (bodyConfig.candidateCount !== undefined) {
    generationConfig.candidateCount = bodyConfig.candidateCount;
  }
  if (bodyConfig.stopSequences !== undefined) {
    generationConfig.stopSequences = bodyConfig.stopSequences;
  }
  if (bodyConfig.responseMimeType !== undefined) {
    generationConfig.responseMimeType = bodyConfig.responseMimeType;
  }
  if (bodyConfig.responseSchema !== undefined) {
    generationConfig.responseSchema = bodyConfig.responseSchema;
  }
  if (bodyConfig.systemInstruction !== undefined) {
    generationConfig.systemInstruction = bodyConfig.systemInstruction;
  }
  if (bodyConfig.safetySettings !== undefined) {
    generationConfig.safetySettings = bodyConfig.safetySettings;
  }
  if (bodyConfig.thinkingConfig !== undefined) {
    generationConfig.thinkingConfig = bodyConfig.thinkingConfig;
  }

  return generationConfig;
}

/**
 * Validate request payload
 */
function validateTextRequest(body) {
  const errors = {};

  if (!body.prompt || typeof body.prompt !== 'string') {
    errors.prompt = 'prompt is required and must be a string';
  } else if (body.prompt.trim().length === 0) {
    errors.prompt = 'prompt cannot be empty';
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationException('Invalid request payload', errors);
  }
}

/**
 * POST /gemini/text
 * Generate text response from prompt
 */
router.post('/text', async (req, res, next) => {
  try {
    const { prompt } = req.body;
    validateTextRequest(req.body);

    const generationConfig = getGenerationConfig(req);

    const result = await ai.models.generateContent({
      model: config.geminiModel,
      contents: prompt,
      config: generationConfig,
    });

    const response = ResponseFormatter.success(
      {
        prompt,
        response: result.text,
        model: config.geminiModel,
        config: generationConfig,
      },
      'Text generated successfully',
      req.state?.requestId
    );

    res.json(response);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /gemini/image
 * Generate response from image input
 */
router.post('/image', async (req, res, next) => {
  try {
    if (!req.body.imageData || !req.body.prompt) {
      throw new ValidationException('Invalid request', {
        imageData: 'imageData is required',
        prompt: 'prompt is required',
      });
    }

    const generationConfig = getGenerationConfig(req);

    // Process image content (base64 encoded)
    const result = await ai.models.generateContent({
      model: config.geminiModel,
      contents: [
        {
          inlineData: {
            data: req.body.imageData,
            mimeType: req.body.mimeType || 'image/jpeg',
          },
        },
        req.body.prompt,
      ],
      config: generationConfig,
    });

    const response = ResponseFormatter.success(
      {
        prompt: req.body.prompt,
        response: result.text,
        model: config.geminiModel,
        config: generationConfig,
      },
      'Image analyzed successfully',
      req.state?.requestId
    );

    res.json(response);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /gemini/chat
 * Multi-turn conversation endpoint
 */
router.post('/chat', async (req, res, next) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message || typeof message !== 'string') {
      throw new ValidationException('Invalid request', {
        message: 'message is required and must be a string',
      });
    }

    const generationConfig = getGenerationConfig(req);

    // Build conversation history in Gemini format
    const history = (conversationHistory || []).map(msg => ({
      role: msg.role || 'user',
      parts: [{ text: msg.content }],
    }));

    // Create chat session
    const chat = ai.chats.create({
      model: config.geminiModel,
      history: history,
      config: generationConfig,
    });

    const result = await chat.sendMessage({ message });
    const responseText = result.text;

    const response = ResponseFormatter.success(
      {
        message,
        response: responseText,
        model: config.geminiModel,
        config: generationConfig,
      },
      'Chat message processed successfully',
      req.state?.requestId
    );

    res.json(response);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /gemini/stream-chat
 * Multi-turn conversation with streaming response (SSE)
 */
router.post('/stream-chat', async (req, res, next) => {
  try {
    const { message, conversationHistory, config: reqConfig } = req.body;

    if (!message || typeof message !== 'string') {
      throw new ValidationException('Invalid request', {
        message: 'message is required and must be a string',
      });
    }

    const generationConfig = getGenerationConfig(req);

    // Build conversation history in Gemini format
    const history = (conversationHistory || []).map(msg => ({
      role: msg.role || 'user',
      parts: [{ text: msg.content }],
    }));

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    // Use streaming API
    const stream = await ai.models.generateContentStream({
      model: config.geminiModel,
      contents: [
        ...history.map(h => ({ role: h.role, parts: h.parts })),
        { role: 'user', parts: [{ text: message }] }
      ],
      config: generationConfig,
    });

    let fullText = '';
    let promptTokens = 0;
    let completionTokens = 0;

    for await (const chunk of stream) {
      const text = chunk.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (text) {
        fullText += text;
        res.write(`data: ${JSON.stringify({ text, done: false })}\n\n`);
      }
      
      // Get usage metadata if available
      if (chunk.usageMetadata) {
        promptTokens = chunk.usageMetadata.promptTokenCount || 0;
        completionTokens = chunk.usageMetadata.candidatesTokenCount || 0;
      }
    }

    // Send final chunk with metadata
    res.write(`data: ${JSON.stringify({ 
      done: true, 
      fullText,
      usageMetadata: {
        promptTokenCount: promptTokens,
        candidatesTokenCount: completionTokens,
        totalTokenCount: promptTokens + completionTokens
      }
    })}\n\n`);
    
    res.end();
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: err.message, done: true })}\n\n`);
    res.end();
    next(err);
  }
});

/**
 * POST /gemini/document
 * Process document/text content
 */
router.post('/document', async (req, res, next) => {
  try {
    const { content, prompt } = req.body;

    if (!content || !prompt) {
      throw new ValidationException('Invalid request', {
        content: 'content is required',
        prompt: 'prompt is required',
      });
    }

    const generationConfig = getGenerationConfig(req);

    const result = await ai.models.generateContent({
      model: config.geminiModel,
      contents: [
        `Document content:\n${content}`,
        prompt,
      ],
      config: generationConfig,
    });

    const response = ResponseFormatter.success(
      {
        contentLength: content.length,
        prompt,
        response: result.text,
        model: config.geminiModel,
        config: generationConfig,
      },
      'Document processed successfully',
      req.state?.requestId
    );

    res.json(response);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /gemini/audio
 * Process audio content (description-based for now)
 */
router.post('/audio', async (req, res, next) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      throw new ValidationException('Invalid request', {
        prompt: 'prompt is required',
      });
    }

    const generationConfig = getGenerationConfig(req);

    // Note: Full audio support requires file upload handling
    // For now, this endpoint accepts text description
    const result = await ai.models.generateContent({
      model: config.geminiModel,
      contents: `Audio context: ${prompt}\nPlease provide analysis based on this audio description.`,
      config: generationConfig,
    });

    const response = ResponseFormatter.success(
      {
        prompt,
        response: result.text,
        model: config.geminiModel,
        note: 'Audio analysis based on text description',
        config: generationConfig,
      },
      'Audio request processed successfully',
      req.state?.requestId
    );

    res.json(response);
  } catch (err) {
    next(err);
  }
});

export default router;
