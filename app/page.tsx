'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Trash2, Plus, MessageSquare, Settings as SettingsIcon, Copy, RefreshCw, Sun, Moon } from 'lucide-react';
import { useConversations } from '@/hooks/useConversations';
import { useTheme } from '@/hooks/useTheme';
import { Message, ResponseMetadata, Settings } from '@/types/chat';
import { SettingsPanel } from '@/components/SettingsPanel';
import { ToastContainer, showToast } from '@/components/Toast';
import { MessageContent } from '@/components/MessageContent';
import { TypingIndicator } from '@/components/TypingIndicator';

export default function ChatPage() {
  const {
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
  } = useConversations();

  const { theme, toggleTheme } = useTheme();

  const [input, setInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [error, setError] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4443';

  const messages = currentConversation?.messages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { 
      role: 'user', 
      content: input,
      timestamp: new Date().toISOString(),
    };
    
    addMessage(userMessage);
    setInput('');
    setError('');
    setIsLoading(true);
    setIsStreaming(true);
    setStreamingContent('');

    const startTime = Date.now();

    try {
      const response = await fetch(`${apiUrl}/gemini/stream-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          conversationHistory: messages,
          config: {
            temperature: settings.temperature,
            maxOutputTokens: settings.maxOutputTokens,
            topP: settings.topP,
            topK: settings.topK,
            systemInstruction: settings.systemInstruction,
            stopSequences: settings.stopSequences,
            seed: settings.seed,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      let usageMetadata = null;

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.error) {
                  throw new Error(data.error);
                }
                
                if (data.text) {
                  fullText += data.text;
                  setStreamingContent(fullText);
                }
                
                if (data.done && data.usageMetadata) {
                  usageMetadata = data.usageMetadata;
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }

      const responseTime = Date.now() - startTime;
      
      const metadata: ResponseMetadata = {
        promptTokenCount: usageMetadata?.promptTokenCount,
        candidatesTokenCount: usageMetadata?.candidatesTokenCount,
        totalTokenCount: usageMetadata?.totalTokenCount,
        finishReason: 'STOP',
        responseTime,
        model: settings.model,
        timestamp: new Date().toISOString(),
      };

      setIsStreaming(false);
      const botMessage: Message = {
        role: 'assistant',
        content: fullText || 'No response received',
        timestamp: new Date().toISOString(),
      };
      addMessage(botMessage, metadata);
      setStreamingContent('');

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(`Error: ${errorMsg}`);
      console.error(err);
      setIsStreaming(false);
      const errorMessage: Message = {
        role: 'assistant',
        content: `Sorry, there was an error: ${errorMsg}. Please try again.`,
        timestamp: new Date().toISOString(),
      };
      addMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    showToast('Copied to clipboard', 'success');
  };

  const handleDeleteMessage = (index: number) => {
    deleteMessage(index);
    showToast('Message deleted', 'info');
  };

  const handleRegenerate = async () => {
    const lastUserMessage = getLastUserMessage();
    if (!lastUserMessage || isLoading) return;

    const conversationHistory = getMessagesForRegenerate();
    
    const lastAssistantIdx = messages.map(m => m.role).lastIndexOf('assistant');
    if (lastAssistantIdx >= 0) {
      deleteMessage(lastAssistantIdx);
    }

    setIsLoading(true);
    const startTime = Date.now();

    try {
      const response = await fetch(`${apiUrl}/gemini/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: lastUserMessage.content,
          conversationHistory,
          config: {
            temperature: settings.temperature,
            maxOutputTokens: settings.maxOutputTokens,
            topP: settings.topP,
            topK: settings.topK,
            systemInstruction: settings.systemInstruction,
            stopSequences: settings.stopSequences,
            seed: settings.seed,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const responseTime = Date.now() - startTime;
      
      const metadata: ResponseMetadata = {
        promptTokenCount: data.usageMetadata?.promptTokenCount,
        candidatesTokenCount: data.usageMetadata?.candidatesTokenCount,
        totalTokenCount: data.usageMetadata?.totalTokenCount,
        finishReason: data.usageMetadata?.finishReason,
        responseTime,
        model: data.data?.model,
        timestamp: new Date().toISOString(),
      };

      const botMessage: Message = {
        role: 'assistant',
        content: data.data?.response || 'No response received',
        timestamp: new Date().toISOString(),
      };
      addMessage(botMessage, metadata);
      showToast('Response regenerated', 'success');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      showToast(`Error: ${errorMsg}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const groupedConversations = conversations.reduce((acc, conv) => {
    const dateKey = formatDate(conv.createdAt);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(conv);
    return acc;
  }, {} as Record<string, typeof conversations>);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-white dark:bg-black">
      {/* Sidebar */}
      <div className={`${showSidebar ? 'w-64' : 'w-0'} transition-all duration-300 overflow-hidden border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex flex-col`}>
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <h2 className="font-semibold text-black dark:text-white">Conversations</h2>
          <button
            onClick={() => createConversation()}
            className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded"
            title="New Conversation"
          >
            <Plus className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {conversations.length === 0 ? (
            <p className="text-sm text-zinc-500 p-2">No conversations yet</p>
          ) : (
            Object.entries(groupedConversations).map(([date, convs]) => (
              <div key={date} className="mb-4">
                <p className="text-xs font-medium text-zinc-500 px-2 py-1">{date}</p>
                {convs.map(conv => (
                  <div
                    key={conv.id}
                    onClick={() => switchConversation(conv.id)}
                    className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                      conv.id === currentConversationId ? 'bg-zinc-200 dark:bg-zinc-700' : ''
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-black dark:text-white truncate">
                        {conv.title}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {conv.messages.length} messages
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conv.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
          <button
            onClick={clearHistory}
            className="w-full text-sm text-red-500 hover:text-red-600 flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Clear All History
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg"
            >
              <MessageSquare className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-black dark:text-white">
                Gemini Chat
              </h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {currentConversation ? currentConversation.title : 'New conversation'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
              ) : (
                <Moon className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
              )}
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg"
              title="Settings"
            >
              <SettingsIcon className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
            </button>
            <button
              onClick={() => createConversation()}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
            >
              <Plus className="w-4 h-4" />
              New
            </button>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  Start a Conversation
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Type a message below to chat with Gemini
                </p>
              </div>
            </div>
          )}

          {messages.map((message, idx) => (
            <div
              key={idx}
              className={`flex group ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`relative max-w-xl lg:max-w-2xl px-4 py-2 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white'
                }`}
              >
                <MessageContent content={message.content} isUser={message.role === 'user'} />
                {message.timestamp && (
                  <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-blue-200' : 'text-zinc-500'}`}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                )}
                
                {/* Action Buttons */}
                <div className={`absolute ${message.role === 'user' ? '-left-12 top-0' : '-right-12 top-0'} flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
                  <button
                    onClick={() => handleCopyMessage(message.content)}
                    className="p-1 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded"
                    title="Copy"
                  >
                    <Copy className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
                  </button>
                  {message.role === 'assistant' && idx === messages.length - 1 && !isLoading && (
                    <button
                      onClick={handleRegenerate}
                      className="p-1 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded"
                      title="Regenerate"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteMessage(idx)}
                    className="p-1 hover:bg-red-300 dark:hover:bg-red-600 rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {isLoading && !isStreaming && (
            <TypingIndicator visible={true} />
          )}

          {isStreaming && streamingContent && (
            <div className="flex justify-start">
              <div className="max-w-xl lg:max-w-2xl px-4 py-2 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white">
                <MessageContent content={streamingContent} isUser={false} />
                <span className="inline-block w-2 h-4 ml-1 bg-zinc-500 dark:bg-zinc-400 animate-pulse" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Response Stats Footer */}
        {lastResponseMetadata && (
          <div className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 border-t border-zinc-200 dark:border-zinc-700">
            <div className="flex flex-wrap gap-4 text-xs text-zinc-600 dark:text-zinc-400">
              {lastResponseMetadata.totalTokenCount !== undefined && (
                <span>Tokens: {lastResponseMetadata.totalTokenCount}</span>
              )}
              {lastResponseMetadata.finishReason && (
                <span>Finish: {lastResponseMetadata.finishReason}</span>
              )}
              {lastResponseMetadata.responseTime !== undefined && (
                <span>Time: {(lastResponseMetadata.responseTime / 1000).toFixed(2)}s</span>
              )}
              {lastResponseMetadata.model && (
                <span>Model: {lastResponseMetadata.model}</span>
              )}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 px-4 py-2 mx-4">
            {error}
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Send
            </button>
          </form>
        </div>
      </div>

      <ToastContainer />

      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSave={(newSettings: Settings) => updateSettings(newSettings)}
        onReset={resetSettings}
      />
    </div>
  );
}