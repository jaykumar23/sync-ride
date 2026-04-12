import { useState, useEffect } from 'react';

interface TripStats {
  personal: {
    totalDistance: number;
    ridingTime: number;
    maxSpeed: number;
    avgSpeed: number;
  };
  group: {
    riderCount: number;
    groupDistance: number;
    maxSeparation: number;
  };
  tripCode: string;
  tripStartedAt: Date;
  tripEndedAt: Date;
}

interface TripSummaryProps {
  isOpen: boolean;
  onClose: () => void;
  stats: TripStats | null;
  onShareTrip: () => void;
  onSaveReplay: () => void;
  replayAlreadySaved: boolean;
  onShowAttribution: () => void;
  onExportSummary: () => void;
}

const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

const formatDistance = (km: number): string => {
  if (km < 0.1) return '—';
  return `${km.toFixed(1)} km`;
};

const formatSpeed = (kmh: number): string => {
  if (kmh <= 0) return '—';
  return `${Math.round(kmh)} km/h`;
};

export const TripSummary = ({
  isOpen,
  onClose,
  stats,
  onShareTrip,
  onSaveReplay,
  replayAlreadySaved,
  onShowAttribution,
  onExportSummary,
}: TripSummaryProps) => {
  const [showAttributionPrompt, setShowAttributionPrompt] = useState(false);

  useEffect(() => {
    if (isOpen && stats) {
      const hasSeenSurvey = localStorage.getItem('attribution_survey_completed');
      if (!hasSeenSurvey) {
        const timer = setTimeout(() => {
          setShowAttributionPrompt(true);
          onShowAttribution();
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, stats, onShowAttribution]);

  if (!isOpen) return null;

  const hasData = stats && (stats.personal.totalDistance > 0 || stats.personal.ridingTime > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl animate-fade-in">
        <div className="p-6 text-center border-b border-[var(--border)]">
          <div className="text-5xl mb-3">🏁</div>
          <h2 className="text-2xl font-bold">Trip Complete!</h2>
          {stats && (
            <p className="text-content-secondary mt-1">
              Trip Code: <span className="font-mono font-bold">{stats.tripCode}</span>
            </p>
          )}
        </div>

        <div className="p-4 space-y-4">
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🏍️</span>
              <h3 className="font-semibold">Your Ride</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface-secondary rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-brand-500">
                  {hasData ? formatDistance(stats?.personal.totalDistance || 0) : '—'}
                </div>
                <div className="text-xs text-content-secondary mt-1">Distance</div>
              </div>
              <div className="bg-surface-secondary rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-brand-500">
                  {hasData ? formatDuration(stats?.personal.ridingTime || 0) : '—'}
                </div>
                <div className="text-xs text-content-secondary mt-1">Riding Time</div>
              </div>
              <div className="bg-surface-secondary rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-success">
                  {hasData ? formatSpeed(stats?.personal.maxSpeed || 0) : '—'}
                </div>
                <div className="text-xs text-content-secondary mt-1">Max Speed</div>
              </div>
              <div className="bg-surface-secondary rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-info">
                  {hasData ? formatSpeed(stats?.personal.avgSpeed || 0) : '—'}
                </div>
                <div className="text-xs text-content-secondary mt-1">Avg Speed</div>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">👥</span>
              <h3 className="font-semibold">Group Stats</h3>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-surface-secondary rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-brand-500">
                  {stats?.group.riderCount || '—'}
                </div>
                <div className="text-xs text-content-secondary mt-1">Riders</div>
              </div>
              <div className="bg-surface-secondary rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-success">
                  {hasData ? formatDistance(stats?.group.groupDistance || 0) : '—'}
                </div>
                <div className="text-xs text-content-secondary mt-1">Group Distance</div>
              </div>
              <div className="bg-surface-secondary rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-warning">
                  {hasData ? formatDistance(stats?.group.maxSeparation || 0) : '—'}
                </div>
                <div className="text-xs text-content-secondary mt-1">Max Spread</div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3 border-t border-[var(--border)]">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onShareTrip}
              className="h-12 btn btn-primary text-sm flex items-center justify-center gap-2"
            >
              <span>📤</span> Share
            </button>
            <button
              onClick={onExportSummary}
              className="h-12 btn bg-purple-600 hover:bg-purple-700 text-white text-sm flex items-center justify-center gap-2"
            >
              <span>🖼️</span> Export
            </button>
          </div>
          
          {!replayAlreadySaved ? (
            <button
              onClick={onSaveReplay}
              className="w-full h-12 btn bg-success hover:bg-success/90 text-white text-base flex items-center justify-center gap-2"
            >
              <span>💾</span> Save Replay
            </button>
          ) : (
            <div className="text-center text-sm text-content-secondary py-2">
              ✅ Replay saved (expires in 7 days)
            </div>
          )}
          
          <button
            onClick={onClose}
            className="w-full h-10 btn btn-secondary text-sm"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};
