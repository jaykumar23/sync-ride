import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface SavedTrip {
  tripCode: string;
  displayName: string;
  tripStartedAt: string;
  tripEndedAt: string;
  createdAt: string;
  expiresAt: string;
  daysRemaining: number;
  distance: number;
  duration: number;
  pointCount: number;
}

interface TripHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  deviceId: string;
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

export const TripHistory = ({
  isOpen,
  onClose,
  deviceId,
}: TripHistoryProps) => {
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingTrip, setDeletingTrip] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchTrips();
    }
  }, [isOpen, deviceId]);

  const fetchTrips = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/api/trips/history/${deviceId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch trip history');
      }
      const data = await response.json();
      setTrips(data.trips || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trip history');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (tripCode: string) => {
    setDeletingTrip(tripCode);
    
    try {
      const response = await fetch(`${API_URL}/api/trips/history/${tripCode}/${deviceId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete trip');
      }
      
      setTrips(trips.filter(t => t.tripCode !== tripCode));
      setConfirmDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete trip');
    } finally {
      setDeletingTrip(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface rounded-3xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-xl animate-fade-in flex flex-col">
        <div className="p-5 text-center border-b border-[var(--border)] flex-shrink-0">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-surface-secondary flex items-center justify-center"
            >
              ←
            </button>
            <div>
              <h2 className="text-xl font-bold">Trip History</h2>
              <p className="text-sm text-content-secondary">Saved trips (7-day window)</p>
            </div>
            <div className="w-10" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="text-center">
                <div className="animate-spin text-3xl mb-2">⏳</div>
                <p className="text-content-secondary">Loading trips...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">⚠️</div>
              <p className="text-danger">{error}</p>
              <button
                onClick={fetchTrips}
                className="mt-4 btn btn-secondary text-sm"
              >
                Retry
              </button>
            </div>
          ) : trips.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">📭</div>
              <h3 className="font-semibold mb-2">No Saved Trips</h3>
              <p className="text-content-secondary text-sm">
                Trips with replay consent enabled will appear here for 7 days.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {trips.map((trip) => (
                <div
                  key={trip.tripCode}
                  className="card p-4"
                >
                  {confirmDelete === trip.tripCode ? (
                    <div className="text-center py-2">
                      <p className="text-sm mb-3">Delete this trip replay? This cannot be undone.</p>
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="btn btn-secondary text-sm px-4"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDelete(trip.tripCode)}
                          disabled={deletingTrip === trip.tripCode}
                          className="btn bg-danger hover:bg-danger/90 text-white text-sm px-4"
                        >
                          {deletingTrip === trip.tripCode ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🏍️</span>
                            <span className="font-mono font-bold text-lg">{trip.tripCode}</span>
                          </div>
                          <p className="text-sm text-content-secondary mt-1">
                            {formatDate(trip.tripStartedAt)}
                          </p>
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full ${
                          trip.daysRemaining <= 1 
                            ? 'bg-danger/20 text-danger' 
                            : trip.daysRemaining <= 3 
                            ? 'bg-warning/20 text-warning' 
                            : 'bg-success/20 text-success'
                        }`}>
                          {trip.daysRemaining === 0 ? 'Expires today' : `${trip.daysRemaining}d left`}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="bg-surface-secondary rounded-lg p-2 text-center">
                          <div className="font-bold text-brand-500">{trip.distance.toFixed(1)} km</div>
                          <div className="text-xs text-content-secondary">Distance</div>
                        </div>
                        <div className="bg-surface-secondary rounded-lg p-2 text-center">
                          <div className="font-bold text-brand-500">{formatDuration(trip.duration)}</div>
                          <div className="text-xs text-content-secondary">Duration</div>
                        </div>
                        <div className="bg-surface-secondary rounded-lg p-2 text-center">
                          <div className="font-bold text-brand-500">{trip.pointCount}</div>
                          <div className="text-xs text-content-secondary">Points</div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => setConfirmDelete(trip.tripCode)}
                        className="w-full h-9 btn btn-secondary text-sm text-danger"
                      >
                        🗑️ Delete Trip
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-[var(--border)] flex-shrink-0">
          <p className="text-xs text-content-muted text-center">
            Trip replays are automatically deleted after 7 days for your privacy.
          </p>
        </div>
      </div>
    </div>
  );
};
