import { useState } from 'react';

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

interface ShareTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: TripStats | null;
  replayEnabled: boolean;
}

const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

export const ShareTripModal = ({
  isOpen,
  onClose,
  stats,
  replayEnabled,
}: ShareTripModalProps) => {
  const [copied, setCopied] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  if (!isOpen || !stats) return null;

  const replayUrl = replayEnabled 
    ? `https://syncride.app/replay/${stats.tripCode}` 
    : null;
  
  const shareMessage = `Check out my SyncRide! ${stats.personal.totalDistance.toFixed(1)}km in ${formatDuration(stats.personal.ridingTime)} 🏍️${replayUrl ? `\n${replayUrl}` : ''}`;

  const handleCopyLink = async () => {
    const textToCopy = replayUrl || shareMessage;
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My SyncRide Trip',
          text: shareMessage,
          url: replayUrl || undefined,
        });
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    }
  };

  const handleWhatsApp = () => {
    const encodedMsg = encodeURIComponent(shareMessage);
    window.open(`https://wa.me/?text=${encodedMsg}`, '_blank');
  };

  const handleTwitter = () => {
    const encodedMsg = encodeURIComponent(shareMessage);
    window.open(`https://twitter.com/intent/tweet?text=${encodedMsg}`, '_blank');
  };

  const handleFacebook = () => {
    if (replayUrl) {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(replayUrl)}&quote=${encodeURIComponent(shareMessage)}`, '_blank');
    } else {
      handleNativeShare();
    }
  };

  const handleSMS = () => {
    const encodedMsg = encodeURIComponent(shareMessage);
    window.location.href = `sms:?body=${encodedMsg}`;
  };

  const canShare = typeof navigator.share === 'function';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface rounded-3xl w-full max-w-md shadow-xl animate-fade-in">
        <div className="p-5 text-center border-b border-[var(--border)]">
          <div className="text-4xl mb-2">📤</div>
          <h2 className="text-xl font-bold">Share Your Trip</h2>
        </div>

        <div className="p-4">
          <div className="bg-surface-secondary rounded-xl p-4 mb-4">
            <p className="text-sm text-content-secondary mb-2">Share message:</p>
            <p className="font-medium">{shareMessage}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={handleWhatsApp}
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#25D366] text-white font-medium hover:opacity-90 transition-opacity"
            >
              <span className="text-xl">💬</span>
              WhatsApp
            </button>
            <button
              onClick={handleTwitter}
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#1DA1F2] text-white font-medium hover:opacity-90 transition-opacity"
            >
              <span className="text-xl">🐦</span>
              Twitter
            </button>
            <button
              onClick={handleFacebook}
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#1877F2] text-white font-medium hover:opacity-90 transition-opacity"
            >
              <span className="text-xl">📘</span>
              Facebook
            </button>
            <button
              onClick={handleSMS}
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-green-600 text-white font-medium hover:opacity-90 transition-opacity"
            >
              <span className="text-xl">📱</span>
              SMS
            </button>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleCopyLink}
              className="w-full h-12 btn btn-secondary flex items-center justify-center gap-2"
            >
              <span>{copied ? '✅' : '📋'}</span>
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </button>

            {canShare && (
              <button
                onClick={handleNativeShare}
                className="w-full h-12 btn btn-primary flex items-center justify-center gap-2"
              >
                <span>{shareSuccess ? '✅' : '📤'}</span>
                {shareSuccess ? 'Shared!' : 'More Options...'}
              </button>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-[var(--border)]">
          <button
            onClick={onClose}
            className="w-full h-10 btn btn-secondary text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
