import React, { useState } from 'react';
import { Key, CheckCircle, Sparkles, AlertCircle } from 'lucide-react';
import { getStoredApiKey, setStoredApiKey } from '../services/storageService';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApiKeyUpdated: (key: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  onApiKeyUpdated,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState(getStoredApiKey());
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setStoredApiKey(apiKeyInput.trim());
    onApiKeyUpdated(apiKeyInput.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  const handleClear = () => {
    setStoredApiKey('');
    setApiKeyInput('');
    onApiKeyUpdated('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-slate-800">
                Gemini API Key
              </h3>
              <p className="text-xs text-slate-500">
                Connect your Google GenAI Key for live Gemini 3.8 Flash
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-lg font-bold"
          >
            ✕
          </button>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3.5 text-xs text-purple-900 leading-relaxed">
          <p className="font-bold flex items-center gap-1 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Out-of-the-box Ready:</span>
          </p>
          If you don't provide an API key, Cadberry automatically operates in our offline student empathy simulation mode with full voice modulation and Distress Delta tracking!
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">
            Enter Google Gemini API Key:
          </label>
          <input
            type="password"
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            placeholder="AIzaSy..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
            <CheckCircle className="w-4 h-4" />
            <span>API key saved securely in browser!</span>
          </div>
        )}

        <div className="flex items-center gap-2 pt-2">
          {apiKeyInput && (
            <button
              onClick={handleClear}
              className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition"
            >
              Remove Key
            </button>
          )}

          <button
            onClick={handleSave}
            className="flex-1 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-semibold transition shadow-md"
          >
            Save Key & Continue
          </button>
        </div>
      </div>
    </div>
  );
};
