'use client';

import { useState, useEffect, useCallback } from 'react';
import { Conversation, Message, ResponseMetadata, DEFAULT_SETTINGS, Settings } from '@/types/chat';

const STORAGE_KEY = 'project-s3:conversations';
const CURRENT_ID_KEY = 'project-s3:currentConversationId';
const SETTINGS_KEY = 'project-s3:settings';

function generateId(): string {
  return `conv-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function getInitialTitle(messages: Message[]): string {
  if (messages.length === 0) return 'New Conversation';
  const firstUserMessage = messages.find(m => m.role === 'user');
  if (firstUserMessage) {
    const preview = firstUserMessage.content.slice(0, 30);
    return preview + (firstUserMessage.content.length > 30 ? '...' : '');
  }
  return 'New Conversation';
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [lastResponseMetadata, setLastResponseMetadata] = useState<ResponseMetadata | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setConversations(parsed);
      }

      const storedCurrentId = localStorage.getItem(CURRENT_ID_KEY);
      if (storedCurrentId) {
        setCurrentConversationId(storedCurrentId);
      } else if (conversations.length > 0) {
        setCurrentConversationId(conversations[0].id);
      }

      const storedSettings = localStorage.getItem(SETTINGS_KEY);
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }
    } catch (err) {
      console.error('Failed to load from localStorage:', err);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
      } catch (err) {
        console.error('Failed to save conversations:', err);
      }
    }
  }, [conversations, isLoaded]);

  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined' && currentConversationId) {
      localStorage.setItem(CURRENT_ID_KEY, currentConversationId);
    }
  }, [currentConversationId, isLoaded]);

  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      } catch (err) {
        console.error('Failed to save settings:', err);
      }
    }
  }, [settings, isLoaded]);

  const currentConversation = conversations.find(c => c.id === currentConversationId) || null;

  const createConversation = useCallback(() => {
    const newConversation: Conversation = {
      id: generateId(),
      title: 'New Conversation',
      messages: [],
      metadata: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversationId(newConversation.id);
    return newConversation.id;
  }, []);

  const deleteConversation = useCallback((id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (currentConversationId === id) {
      const remaining = conversations.filter(c => c.id !== id);
      setCurrentConversationId(remaining.length > 0 ? remaining[0].id : null);
    }
  }, [currentConversationId, conversations]);

  const switchConversation = useCallback((id: string) => {
    setCurrentConversationId(id);
  }, []);

  const addMessage = useCallback((message: Message, metadata?: ResponseMetadata) => {
    if (!currentConversationId) {
      const newId = createConversation();
      setConversations(prev => prev.map(c => 
        c.id === newId 
          ? { ...c, messages: [message], metadata: metadata ? [metadata] : [], updatedAt: new Date().toISOString() }
          : c
      ));
      return;
    }

    setConversations(prev => prev.map(c => {
      if (c.id === currentConversationId) {
        const newTitle = c.messages.length === 0 ? getInitialTitle([message]) : c.title;
        return {
          ...c,
          title: newTitle,
          messages: [...c.messages, message],
          metadata: metadata ? [...c.metadata, metadata] : c.metadata,
          updatedAt: new Date().toISOString(),
        };
      }
      return c;
    }));

    if (metadata) {
      setLastResponseMetadata(metadata);
    }
  }, [currentConversationId, createConversation]);

  const clearHistory = useCallback(() => {
    setConversations([]);
    setCurrentConversationId(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(CURRENT_ID_KEY);
    }
  }, []);

  const updateSettings = useCallback((newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  const deleteMessage = useCallback((messageIndex: number) => {
    if (!currentConversationId) return;
    setConversations(prev => prev.map(c => {
      if (c.id === currentConversationId) {
        const newMessages = c.messages.filter((_, idx) => idx !== messageIndex);
        const newMetadata = c.metadata.filter((_, idx) => idx >= messageIndex);
        const newTitle = newMessages.length > 0 ? getInitialTitle(newMessages) : 'New Conversation';
        return {
          ...c,
          title: newTitle,
          messages: newMessages,
          metadata: newMetadata,
          updatedAt: new Date().toISOString(),
        };
      }
      return c;
    }));
  }, [currentConversationId]);

  const getLastUserMessage = useCallback((): Message | null => {
    if (!currentConversation) return null;
    const lastUserIdx = currentConversation.messages.map(m => m.role).lastIndexOf('user');
    return lastUserIdx >= 0 ? currentConversation.messages[lastUserIdx] : null;
  }, [currentConversation]);

  const getMessagesForRegenerate = useCallback((): Message[] => {
    if (!currentConversation) return [];
    const lastUserIdx = currentConversation.messages.map(m => m.role).lastIndexOf('user');
    if (lastUserIdx < 0) return [];
    return currentConversation.messages.slice(0, lastUserIdx);
  }, [currentConversation]);

  return {
    conversations,
    currentConversation,
    currentConversationId,
    settings,
    lastResponseMetadata,
    isLoaded,
    createConversation,
    deleteConversation,
    switchConversation,
    addMessage,
    clearHistory,
    updateSettings,
    resetSettings,
    deleteMessage,
    getLastUserMessage,
    getMessagesForRegenerate,
  };
}