import React, { useState } from 'react';
import { Key, CheckCircle, Sparkles, X } from 'lucide-react';
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
    }, 800);
  };

  const handleClear = () => {
    setStoredApiKey('');
    setApiKeyInput('');
    onApiKeyUpdated('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#FAF7F2] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-xl border border-[#EAE4DC] flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif font-medium text-xl text-[#2D2A26]">
              Gemini API Key
            </h3>
            <p className="text-xs text-[#78726A] font-light mt-0.5">
              Connect your Google GenAI Key for live Gemini 3.8 Flash
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#A69F96] hover:text-[#2D2A26] p-1.5 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-[#F3ECF8] border border-[#EADDF2] rounded-2xl p-3.5 text-xs text-[#644D73] leading-relaxed">
          <p className="font-medium flex items-center gap-1 mb-1 text-[#4B3857]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ready Out-of-the-box:</span>
          </p>
          If no API key is provided, Cadberry runs with our built-in intelligent student mental health simulation engine!
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#78726A]">
            Google Gemini API Key:
          </label>
          <input
            type="password"
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            placeholder="AIzaSy..."
            className="w-full bg-white border border-[#EAE4DC] rounded-xl p-3 text-xs sm:text-sm font-mono text-[#2D2A26] focus:outline-hidden focus:border-[#3D706E]"
          />
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 text-xs text-[#2F5957] font-medium bg-[#F2F8F8] p-2.5 rounded-xl border border-[#C7DFDE]">
            <CheckCircle className="w-4 h-4" />
            <span>API key saved in browser!</span>
          </div>
        )}

        <div className="flex items-center gap-2 pt-1">
          {apiKeyInput && (
            <button
              onClick={handleClear}
              className="px-3 py-2 bg-[#F4EFEA] hover:bg-[#ECE4DC] text-[#78726A] rounded-xl text-xs font-medium transition"
            >
              Remove
            </button>
          )}

          <button
            onClick={handleSave}
            className="flex-1 py-2.5 bg-[#2F5957] hover:bg-[#234442] text-white rounded-xl text-xs font-medium transition shadow-2xs"
          >
            Save Key
          </button>
        </div>
      </div>
    </div>
  );
};
