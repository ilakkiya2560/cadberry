import React from 'react';
import { Heart, Menu, Trash2 } from 'lucide-react';
import { DistressMetrics, StudentCheckIn, UserPreference } from '../types';
import { buildCopingRecommendations } from '../services/copingRecommendationService';

interface CopingStrategiesViewProps {
  checkIns: StudentCheckIn[];
  metrics: DistressMetrics;
  preferences: UserPreference[];
  onRemovePreference: (preference: string) => void;
  onOpenMobileSidebar: () => void;
}

export const CopingStrategiesView: React.FC<CopingStrategiesViewProps> = ({
  checkIns,
  metrics,
  preferences,
  onRemovePreference,
  onOpenMobileSidebar,
}) => {
  const recommendations = buildCopingRecommendations(checkIns, metrics, preferences);

  return (
    <div className="flex-1 flex flex-col h-screen max-w-5xl mx-auto px-4 sm:px-8 py-6 overflow-y-auto space-y-6">
      <header className="flex items-center gap-3 pb-4 border-b border-[#EAE4DC]/60 shrink-0">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="p-1.5 rounded-lg text-[#78726A] hover:bg-[#F4EFEA] md:hidden"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-xs font-semibold tracking-[0.18em] text-[#78726A] uppercase">
          YOUR SPACE · COPING STRATEGIES
        </span>
      </header>

      <div>
        <h2 className="font-serif text-3xl sm:text-4xl text-[#2D2A26] font-normal tracking-tight">
          Coping strategies
        </h2>
        <p className="font-sans text-sm text-[#78726A] font-light mt-1.5">
          Small things that may help, based on your recent patterns and what you enjoy.
        </p>
      </div>

      <section className="space-y-3">
        <h3 className="font-serif text-xl font-medium text-[#2D2A26]">For right now</h3>
        <div className="grid gap-3 md:grid-cols-2">
          {recommendations.map((recommendation) => (
            <div
              key={recommendation.title}
              className={`rounded-2xl border p-5 shadow-2xs ${
                recommendation.tone === 'prominent'
                  ? 'border-[#D7C6E4] bg-[#F3ECF8]'
                  : 'border-[#EAE4DC] bg-white'
              }`}
            >
              <div className="flex items-start gap-3">
                <Heart className="mt-0.5 h-5 w-5 shrink-0 text-[#3D706E]" />
                <div>
                  <h4 className="font-medium text-[#2D2A26]">{recommendation.title}</h4>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#644D73]">{recommendation.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h3 className="font-serif text-xl font-medium text-[#2D2A26]">Things you enjoy</h3>
          <p className="mt-1 text-xs text-[#A69F96]">Based on things you have told Cadberry.</p>
        </div>
        {preferences.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {preferences.map((preference) => (
              <div
                key={preference.id}
                className="inline-flex items-center gap-2 rounded-full border border-[#EADDF2] bg-[#F3ECF8] px-3 py-2 text-sm text-[#4B3857]"
              >
                <span>{preference.preference.charAt(0).toUpperCase() + preference.preference.slice(1)}</span>
                <button
                  type="button"
                  onClick={() => onRemovePreference(preference.preference)}
                  className="rounded-full p-0.5 text-[#78726A] hover:bg-white hover:text-[#BA5344]"
                  aria-label={`Remove ${preference.preference}`}
                  title="Forget this preference"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-[#EAE4DC] bg-white p-5 text-sm leading-relaxed text-[#78726A]">
            I&apos;m still learning what works for you. Tell me about things you enjoy or that usually help you reset, and I can use those in future suggestions.
          </p>
        )}
      </section>

      <section className="space-y-3">
        <h3 className="font-serif text-xl font-medium text-[#2D2A26]">Other gentle options</h3>
        <div className="rounded-2xl border border-[#EAE4DC] bg-white p-5 text-sm leading-relaxed text-[#78726A]">
          A quiet pause, a glass of water, or writing down one small next step can be enough for this moment.
        </div>
      </section>
    </div>
  );
};
