/**
 * localStorage Management Utilities
 * Handles persistence of conversations and settings
 */

import { Conversation, Settings, DEFAULT_SETTINGS } from '@/types/chat';

const STORAGE_PREFIX = 'project-s3:';
const CONVERSATIONS_KEY = `${STORAGE_PREFIX}conversations`;
const CURRENT_CONVERSATION_KEY = `${STORAGE_PREFIX}currentConversationId`;
const SETTINGS_KEY = `${STORAGE_PREFIX}settings`;

/**
 * Get all conversations from localStorage
 */
export function loadConversations(): Conversation[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(CONVERSATIONS_KEY);
    if (!stored) return [];

    const conversations = JSON.parse(stored) as Conversation[];
    return conversations;
  } catch (error) {
    console.error('Error loading conversations:', error);
    return [];
  }
}

/**
 * Save all conversations to localStorage
 */
export function saveConversations(conversations: Conversation[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
  } catch (error) {
    console.error('Error saving conversations:', error);
  }
}

/**
 * Get current conversation ID
 */
export function loadCurrentConversationId(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    return localStorage.getItem(CURRENT_CONVERSATION_KEY);
  } catch (error) {
    console.error('Error loading current conversation ID:', error);
    return null;
  }
}

/**
 * Save current conversation ID
 */
export function saveCurrentConversationId(id: string): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(CURRENT_CONVERSATION_KEY, id);
  } catch (error) {
    console.error('Error saving current conversation ID:', error);
  }
}

/**
 * Load settings from localStorage or return defaults
 */
export function loadSettings(): Settings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;

  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (!stored) return DEFAULT_SETTINGS;

    return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  } catch (error) {
    console.error('Error loading settings:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save settings to localStorage
 */
export function saveSettings(settings: Settings): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

/**
 * Clear all stored data
 */
export function clearAllStorage(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(CONVERSATIONS_KEY);
    localStorage.removeItem(CURRENT_CONVERSATION_KEY);
    localStorage.removeItem(SETTINGS_KEY);
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
}

/**
 * Get storage size estimate (for debugging)
 */
export function getStorageSize(): string {
  if (typeof window === 'undefined') return '0 KB';

  try {
    let size = 0;
    for (const key in localStorage) {
      if (key.startsWith(STORAGE_PREFIX)) {
        size += localStorage.getItem(key)?.length || 0;
      }
    }
    return `${(size / 1024).toFixed(2)} KB`;
  } catch (error) {
    console.error('Error calculating storage size:', error);
    return '? KB';
  }
}
