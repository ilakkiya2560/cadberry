import React from 'react';
import { PhoneCall, ShieldAlert, Heart, Stethoscope, Ambulance } from 'lucide-react';
import { EMERGENCY_SERVICES, EmergencyContact } from '../services/safetyNet';

interface CrisisHelplineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CrisisHelplineModal: React.FC<CrisisHelplineModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border-2 border-rose-200 flex flex-col gap-5 relative">
        {/* Urgent Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shadow-inner">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-xl text-slate-900">
                You Are Not Alone
              </h3>
              <p className="text-xs text-rose-600 font-semibold">
                Instant 24/7 Human Helplines & Medical Doctors
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {/* Empathy Callout */}
        <div className="bg-rose-50 border border-rose-200/80 rounded-2xl p-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p className="font-bold text-rose-900 mb-1 flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-rose-600 fill-current" />
            <span>Cadberry's Safety Principle:</span>
          </p>
          Students often turn to AI chatbots when feeling deep distress, but an AI cannot provide psychiatric care or medical support. When thoughts become overwhelming, you deserve real, qualified human care immediately. Please call one of these free services right now.
        </div>

        {/* Emergency Services List */}
        <div className="space-y-3">
          {EMERGENCY_SERVICES.map((line: EmergencyContact, idx: number) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-teal-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-800">{line.name}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-100 text-teal-800">
                    {line.available}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{line.description}</p>
              </div>

              <a
                href={`tel:${line.number.replace(/\s+/g, '')}`}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition shrink-0 shadow-sm"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call {line.number}</span>
              </a>
            </div>
          ))}
        </div>

        {/* Campus Doctor info */}
        <div className="p-3 bg-slate-100/70 rounded-xl text-[11px] text-slate-500 text-center">
          You can also visit your University Health & Student Counseling Center or contact your campus doctor.
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-semibold text-xs transition"
        >
          Return to Cadberry
        </button>
      </div>
    </div>
  );
};
