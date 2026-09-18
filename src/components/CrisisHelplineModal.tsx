import React from 'react';
import { PhoneCall, ShieldAlert, Heart, X } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#FAF7F2] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-xl border border-[#EAE4DC] flex flex-col gap-5 relative">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif font-medium text-2xl text-[#2D2A26]">
              Human Support Helplines
            </h3>
            <p className="text-xs text-[#78726A] font-light mt-0.5">
              Free, confidential medical doctors & counselors available 24/7
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#A69F96] hover:text-[#2D2A26] p-1.5 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Soft Peach Callout */}
        <div className="bg-[#FFF7F5] border border-[#F8DBD4] rounded-2xl p-4 text-xs text-[#BA5344] leading-relaxed">
          <p className="font-medium text-[#943D30] mb-1 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>Cadberry's Care Principle:</span>
          </p>
          An AI companion cannot replace medical treatment or personal counseling. If you feel unsafe or overwhelmed, please reach out directly to these dedicated human professionals.
        </div>

        {/* Emergency Services */}
        <div className="space-y-2.5">
          {EMERGENCY_SERVICES.map((line: EmergencyContact, idx: number) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-white border border-[#EAE4DC] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-xs sm:text-sm text-[#2D2A26]">{line.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#F2F8F8] text-[#2F5957] font-medium">
                    {line.available}
                  </span>
                </div>
                <p className="text-xs text-[#78726A] font-light mt-1">{line.description}</p>
              </div>

              <a
                href={`tel:${line.number.replace(/\s+/g, '')}`}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#2F5957] hover:bg-[#234442] text-white rounded-xl text-xs font-semibold transition shrink-0"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call {line.number}</span>
              </a>
            </div>
          ))}
        </div>

        {/* Campus Doctor note */}
        <p className="text-[11px] text-[#A69F96] text-center font-light">
          You can also visit your University Health Center or contact your hostel warden.
        </p>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-[#F4EFEA] hover:bg-[#ECE4DC] text-[#78726A] rounded-xl text-xs font-medium transition"
        >
          Return to Check-in
        </button>
      </div>
    </div>
  );
};
