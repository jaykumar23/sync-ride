import { useState } from 'react'

interface ConsentModalProps {
  isOpen: boolean
  tripCode: string
  onConsent: (consent: boolean, shareStats: boolean) => void
  onClose: () => void
}

export function ConsentModal({ isOpen, tripCode, onConsent, onClose: _onClose }: ConsentModalProps) {
  const [saveReplay, setSaveReplay] = useState(false)
  const [shareStats, setShareStats] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  if (!isOpen) return null

  const handleSave = () => {
    onConsent(saveReplay, shareStats)
  }

  const handleDontSave = () => {
    onConsent(false, false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-surface p-6 rounded-2xl mx-4 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">💾</div>
          <h2 className="text-2xl font-bold text-content">Save Trip Replay?</h2>
          <p className="text-content-secondary mt-2 text-sm">
            Trip Code: <span className="font-mono font-bold">{tripCode}</span>
          </p>
        </div>

        {/* Description */}
        <p className="text-content-secondary text-center mb-4">
          Your location history from this trip can be stored for 7 days to enable replay and sharing.
        </p>

        {/* Expandable Details */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full text-left text-sm text-brand-500 mb-4 flex items-center justify-center gap-1"
        >
          {showDetails ? '▼' : '▶'} What's stored?
        </button>

        {showDetails && (
          <div className="bg-surface-secondary p-4 rounded-xl mb-4 text-sm text-content-secondary space-y-2">
            <p>📍 <strong>What's stored:</strong> GPS coordinates, timestamps, trip statistics</p>
            <p>⏰ <strong>How long:</strong> 7 days, then automatically deleted</p>
            <p>🔒 <strong>Who can access:</strong> Only you via this device (no account required)</p>
          </div>
        )}

        {/* Consent Checkboxes */}
        <div className="space-y-3 mb-6">
          <label className="flex items-start gap-3 p-3 bg-surface-secondary rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={saveReplay}
              onChange={(e) => setSaveReplay(e.target.checked)}
              className="w-5 h-5 mt-0.5 rounded border-2 border-content-muted"
            />
            <span className="text-content text-sm">
              Save my trip replay for 7 days
            </span>
          </label>

          <label className="flex items-start gap-3 p-3 bg-surface-secondary rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={shareStats}
              onChange={(e) => setShareStats(e.target.checked)}
              className="w-5 h-5 mt-0.5 rounded border-2 border-content-muted"
            />
            <span className="text-content text-sm">
              Share anonymized trip statistics to improve SyncRide
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleSave}
            disabled={!saveReplay}
            className={`w-full h-14 font-bold rounded-xl transition-colors ${
              saveReplay
                ? 'bg-success text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Save Replay
          </button>
          <button
            onClick={handleDontSave}
            className="w-full h-12 bg-surface-secondary text-content font-medium rounded-xl"
          >
            Don't Save
          </button>
        </div>

        {/* Privacy Note */}
        <p className="text-xs text-content-muted text-center mt-4">
          Your data is encrypted and automatically deleted after 7 days.
          <br />
          <a href="/privacy" className="text-brand-500 underline">View Privacy Policy</a>
        </p>
      </div>
    </div>
  )
}
