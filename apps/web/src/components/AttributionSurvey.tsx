import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface AttributionSurveyProps {
  isOpen: boolean;
  onClose: () => void;
  deviceId: string;
  tripCode?: string;
}

const ATTRIBUTION_OPTIONS = [
  { id: 'google', label: 'Google Search', icon: '🔍' },
  { id: 'social', label: 'Social Media', icon: '📱' },
  { id: 'friend', label: 'Friend / Word of Mouth', icon: '👥' },
  { id: 'motorcycle', label: 'Motorcycle Community', icon: '🏍️' },
  { id: 'news', label: 'News Article / Blog', icon: '📰' },
  { id: 'podcast', label: 'Podcast / YouTube', icon: '🎙️' },
  { id: 'other', label: 'Other', icon: '🚫' },
];

export const AttributionSurvey = ({
  isOpen,
  onClose,
  deviceId,
  tripCode,
}: AttributionSurveyProps) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!selectedOption) return;
    
    setSubmitting(true);
    try {
      await fetch(`${API_URL}/api/analytics/attribution`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId,
          attributionSource: selectedOption,
          attributionDetails: additionalDetails.trim() || undefined,
          tripCode,
        }),
      });
      
      localStorage.setItem('attribution_survey_completed', 'true');
      onClose();
    } catch (err) {
      console.error('Error submitting attribution:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('attribution_survey_completed', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-surface rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto shadow-xl animate-fade-in">
        <div className="p-5 text-center border-b border-[var(--border)]">
          <div className="text-4xl mb-2">📊</div>
          <h2 className="text-xl font-bold">How did you hear about SyncRide?</h2>
          <p className="text-sm text-content-secondary mt-1">Help us improve our outreach</p>
        </div>

        <div className="p-4 space-y-2">
          {ATTRIBUTION_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelectedOption(option.id)}
              className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${
                selectedOption === option.id
                  ? 'bg-brand-500 text-white'
                  : 'bg-surface-secondary hover:bg-surface-secondary/80'
              }`}
            >
              <span className="text-xl">{option.icon}</span>
              <span className="font-medium">{option.label}</span>
              {selectedOption === option.id && (
                <span className="ml-auto">✓</span>
              )}
            </button>
          ))}
        </div>

        {selectedOption && (
          <div className="px-4 pb-2">
            <input
              type="text"
              value={additionalDetails}
              onChange={(e) => setAdditionalDetails(e.target.value)}
              placeholder="Tell us more (optional)"
              maxLength={200}
              className="input w-full h-12"
            />
          </div>
        )}

        <div className="p-4 space-y-2 border-t border-[var(--border)]">
          <button
            onClick={handleSubmit}
            disabled={!selectedOption || submitting}
            className="w-full h-12 btn btn-primary disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
          <button
            onClick={handleSkip}
            className="w-full h-10 btn btn-secondary text-sm"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
};
