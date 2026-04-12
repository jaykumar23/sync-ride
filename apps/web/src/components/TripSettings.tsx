import { useState } from 'react'

interface TripSettingsProps {
  isOpen: boolean
  onClose: () => void
  tripCode: string
  isHost: boolean
  onEndTrip: () => void
  onLeaveTrip: () => void
  onOpenPrivacy: () => void
}

export function TripSettings({ 
  isOpen, 
  onClose, 
  tripCode, 
  isHost,
  onEndTrip,
  onLeaveTrip,
  onOpenPrivacy
}: TripSettingsProps) {
  const [showEndConfirm, setShowEndConfirm] = useState(false)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)

  if (!isOpen) return null

  const handleEndTrip = () => {
    setShowEndConfirm(false)
    onEndTrip()
    onClose()
  }

  const handleLeaveTrip = () => {
    setShowLeaveConfirm(false)
    onLeaveTrip()
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface rounded-t-2xl p-4 animate-slide-up">
        {/* Handle */}
        <div className="w-12 h-1 bg-content-muted/30 rounded-full mx-auto mb-4" />

        {/* Header */}
        <h2 className="text-xl font-bold text-content mb-2 text-center">
          Trip Settings
        </h2>
        <p className="text-center text-content-secondary mb-6">
          Code: {tripCode}
        </p>

        {/* Options */}
        <div className="space-y-3">
          {/* Privacy Settings */}
          <button
            onClick={() => {
              onClose()
              onOpenPrivacy()
            }}
            className="w-full h-16 bg-surface-secondary text-content rounded-lg font-medium text-lg flex items-center justify-center gap-3 active:scale-95 transition-transform"
          >
            <span className="text-xl">🔒</span>
            Your Data Rights
          </button>
          
          {isHost ? (
            <button
              onClick={() => setShowEndConfirm(true)}
              className="w-full h-20 bg-red-600 text-white rounded-lg font-bold text-lg flex items-center justify-center gap-3 active:scale-95 transition-transform"
            >
              <span className="text-2xl">🛑</span>
              End Trip for All
            </button>
          ) : (
            <button
              onClick={() => setShowLeaveConfirm(true)}
              className="w-full h-20 bg-orange-500 text-white rounded-lg font-bold text-lg flex items-center justify-center gap-3 active:scale-95 transition-transform"
            >
              <span className="text-2xl">👋</span>
              Leave Trip
            </button>
          )}
        </div>

        {/* Cancel */}
        <button
          onClick={onClose}
          className="w-full h-16 mt-4 bg-surface-secondary text-content rounded-lg font-bold active:scale-95 transition-transform"
        >
          Cancel
        </button>
      </div>

      {/* End Trip Confirmation */}
      {showEndConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70">
          <div className="bg-surface p-6 rounded-2xl mx-4 max-w-md w-full text-center">
            <div className="text-6xl mb-4">🛑</div>
            <h2 className="text-2xl font-bold mb-4">End Trip?</h2>
            <p className="text-content-secondary mb-2">
              This will end the trip for all riders.
            </p>
            <p className="text-danger text-sm mb-6">
              This action cannot be undone.
            </p>
            <div className="space-y-3">
              <button
                onClick={handleEndTrip}
                className="w-full h-20 bg-red-600 text-white font-bold text-xl rounded-lg active:scale-95 transition-transform"
              >
                End Trip
              </button>
              <button
                onClick={() => setShowEndConfirm(false)}
                className="w-full h-14 bg-surface-secondary text-content font-bold rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Trip Confirmation */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70">
          <div className="bg-surface p-6 rounded-2xl mx-4 max-w-md w-full text-center">
            <div className="text-6xl mb-4">👋</div>
            <h2 className="text-2xl font-bold mb-4">Leave Trip?</h2>
            <p className="text-content-secondary mb-6">
              You will stop sharing your location. You can rejoin with the trip code if needed.
            </p>
            <div className="space-y-3">
              <button
                onClick={handleLeaveTrip}
                className="w-full h-20 bg-orange-500 text-white font-bold text-xl rounded-lg active:scale-95 transition-transform"
              >
                Leave
              </button>
              <button
                onClick={() => setShowLeaveConfirm(false)}
                className="w-full h-14 bg-surface-secondary text-content font-bold rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
