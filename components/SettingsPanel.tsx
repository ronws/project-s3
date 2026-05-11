'use client';

import { useState } from 'react';
import { X, Settings as SettingsIcon, RotateCcw } from 'lucide-react';
import { Settings, DEFAULT_SETTINGS } from '@/types/chat';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSave: (settings: Settings) => void;
  onReset: () => void;
}

const MODELS = [
  { value: 'gemini-2.5-flash', label: 'gemini-2.5-flash' },
  { value: 'gemini-2.0-flash', label: 'gemini-2.0-flash' },
  { value: 'gemini-2.0-pro', label: 'gemini-2.0-pro' },
  { value: 'gemini-1.5-flash', label: 'gemini-1.5-flash' },
  { value: 'gemini-1.5-pro', label: 'gemini-1.5-pro' },
];

const AGENT_ROLES = [
  { id: 'general', label: 'General Assistant', instruction: 'You are a helpful, knowledgeable, and friendly AI assistant. Provide accurate and concise responses.' },
  { id: 'coder', label: 'Code Helper', instruction: 'You are an expert programmer. Help write clean, efficient, and well-documented code. Explain concepts clearly and provide examples.' },
  { id: 'writer', label: 'Creative Writer', instruction: 'You are a creative writer with excellent storytelling skills. Write engaging content with proper grammar and style.' },
  { id: 'analyst', label: 'Data Analyst', instruction: 'You are a data analyst expert. Analyze data, identify patterns, and provide insights. Use numbers and facts in your responses.' },
  { id: 'teacher', label: 'Teacher', instruction: 'You are a patient and knowledgeable teacher. Explain complex concepts in simple terms, use examples, and encourage learning.' },
  { id: 'researcher', label: 'Research Assistant', instruction: 'You are a research assistant. Help find information, summarize findings, and provide well-referenced responses.' },
  { id: 'custom', label: 'Custom', instruction: '' },
];

export function SettingsPanel({ isOpen, onClose, settings, onSave, onReset }: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced'>('basic');
  const [localSettings, setLocalSettings] = useState<Settings>(settings);
  const [errors, setErrors] = useState<string[]>([]);

  const getSelectedRole = () => {
    if (!localSettings.systemInstruction) return AGENT_ROLES[6]; // custom
    const matched = AGENT_ROLES.find(r => r.instruction === localSettings.systemInstruction);
    return matched || AGENT_ROLES[6]; // custom if not matched
  };

  const [selectedRoleId, setSelectedRoleId] = useState(getSelectedRole().id);

  if (!isOpen) return null;

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    setErrors([]);
  };

  const validateSettings = (): boolean => {
    const newErrors: string[] = [];

    if (localSettings.temperature < 0 || localSettings.temperature > 2) {
      newErrors.push('Temperature must be between 0 and 2');
    }
    if (localSettings.maxOutputTokens < 1 || localSettings.maxOutputTokens > 8192) {
      newErrors.push('Max tokens must be between 1 and 8192');
    }
    if (localSettings.topP < 0 || localSettings.topP > 1) {
      newErrors.push('Top-P must be between 0 and 1');
    }
    if (localSettings.topK < 1 || localSettings.topK > 100) {
      newErrors.push('Top-K must be between 1 and 100');
    }
    if (localSettings.presencePenalty !== undefined && (localSettings.presencePenalty < -2 || localSettings.presencePenalty > 2)) {
      newErrors.push('Presence penalty must be between -2 and 2');
    }
    if (localSettings.frequencyPenalty !== undefined && (localSettings.frequencyPenalty < -2 || localSettings.frequencyPenalty > 2)) {
      newErrors.push('Frequency penalty must be between -2 and 2');
    }
    if (localSettings.candidateCount !== undefined && (localSettings.candidateCount < 1 || localSettings.candidateCount > 8)) {
      newErrors.push('Candidate count must be between 1 and 8');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSave = () => {
    if (validateSettings()) {
      onSave(localSettings);
      onClose();
    }
  };

  const handleReset = () => {
    setLocalSettings(DEFAULT_SETTINGS);
    setSelectedRoleId('general');
    setErrors([]);
  };

  const handleRoleChange = (roleId: string) => {
    setSelectedRoleId(roleId);
    const role = AGENT_ROLES.find(r => r.id === roleId);
    if (role) {
      updateSetting('systemInstruction', role.instruction);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
            <h2 className="text-lg font-semibold text-black dark:text-white">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded"
          >
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setActiveTab('basic')}
            className={`flex-1 py-2 text-sm font-medium ${
              activeTab === 'basic'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            Basic
          </button>
          <button
            onClick={() => setActiveTab('advanced')}
            className={`flex-1 py-2 text-sm font-medium ${
              activeTab === 'advanced'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            Advanced
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {activeTab === 'basic' && (
            <div className="space-y-4">
              {/* Model */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Model
                </label>
                <select
                  value={localSettings.model}
                  onChange={(e) => updateSetting('model', e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-white"
                >
                  {MODELS.map(model => (
                    <option key={model.value} value={model.value}>
                      {model.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Temperature */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Temperature: {localSettings.temperature.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={localSettings.temperature}
                  onChange={(e) => updateSetting('temperature', parseFloat(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-zinc-500 mt-1">
                  0 = deterministic, 2 = creative
                </p>
              </div>

              {/* Max Output Tokens */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Max Output Tokens: {localSettings.maxOutputTokens}
                </label>
                <input
                  type="range"
                  min="1"
                  max="8192"
                  step="1"
                  value={localSettings.maxOutputTokens}
                  onChange={(e) => updateSetting('maxOutputTokens', parseInt(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-zinc-500 mt-1">
                  1 - 8192
                </p>
              </div>

              {/* Agent Role */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Agent Role
                </label>
                <select
                  value={selectedRoleId}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-white"
                >
                  {AGENT_ROLES.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* System Prompt */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  System Prompt
                </label>
                <textarea
                  value={localSettings.systemInstruction}
                  onChange={(e) => {
                    updateSetting('systemInstruction', e.target.value);
                    setSelectedRoleId('custom');
                  }}
                  rows={4}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-white resize-none"
                  placeholder="You are a helpful AI assistant..."
                />
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="space-y-4">
              {/* Top-P */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Top-P (Nucleus): {localSettings.topP.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={localSettings.topP}
                  onChange={(e) => updateSetting('topP', parseFloat(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-zinc-500 mt-1">
                  0-1, higher = more diverse
                </p>
              </div>

              {/* Top-K */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Top-K: {localSettings.topK}
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  step="1"
                  value={localSettings.topK}
                  onChange={(e) => updateSetting('topK', parseInt(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-zinc-500 mt-1">
                  1-100, higher = less restrictive
                </p>
              </div>

              {/* Stop Sequences */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Stop Sequences
                </label>
                <input
                  type="text"
                  value={localSettings.stopSequences.join(', ')}
                  onChange={(e) => updateSetting('stopSequences', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-white"
                  placeholder="END, STOP, DONE"
                />
                <p className="text-xs text-zinc-500 mt-1">
                  Comma-separated values
                </p>
              </div>

              {/* Seed */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Seed (for reproducibility)
                </label>
                <input
                  type="number"
                  value={localSettings.seed || ''}
                  onChange={(e) => updateSetting('seed', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-white"
                  placeholder="Random"
                />
              </div>

              {/* Presence Penalty */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Presence Penalty: {localSettings.presencePenalty ?? 0}
                </label>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  step="0.1"
                  value={localSettings.presencePenalty ?? 0}
                  onChange={(e) => updateSetting('presencePenalty', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Frequency Penalty */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Frequency Penalty: {localSettings.frequencyPenalty ?? 0}
                </label>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  step="0.1"
                  value={localSettings.frequencyPenalty ?? 0}
                  onChange={(e) => updateSetting('frequencyPenalty', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Candidate Count */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Candidate Count: {localSettings.candidateCount ?? 1}
                </label>
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="1"
                  value={localSettings.candidateCount ?? 1}
                  onChange={(e) => updateSetting('candidateCount', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <div className="mt-4 p-3 bg-red-100 dark:bg-red-900 rounded-lg">
              {errors.map((error, idx) => (
                <p key={idx} className="text-sm text-red-700 dark:text-red-300">
                  {error}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between p-4 border-t border-zinc-200 dark:border-zinc-800">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
