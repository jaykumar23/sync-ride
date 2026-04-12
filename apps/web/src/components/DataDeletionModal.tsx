import { useEffect, useState } from 'react'

interface DataDeletionModalProps {
  isOpen: boolean
  consentGiven: boolean | null
  onClose: () => void
}

export function DataDeletionModal({ isOpen, consentGiven, onClose }: DataDeletionModalProps) {
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    if (!isOpen) {
      setCountdown(10)
      return
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          onClose()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-surface p-6 rounded-2xl mx-4 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-success/20 rounded-full flex items-center justify-center">
            <span className="text-4xl text-success">✓</span>
          </div>
          <h2 className="text-2xl font-bold text-content">Data Deleted</h2>
        </div>

        {/* Message */}
        <p className="text-content-secondary text-center mb-6">
          Your real-time location data has been automatically deleted.
        </p>

        {/* Status Details */}
        <div className="bg-surface-secondary p-4 rounded-xl mb-6 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-success text-lg">✓</span>
            <span className="text-content text-sm">
              Live tracking data: Deleted within 30 seconds
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-success text-lg">✓</span>
            <span className="text-content text-sm">
              {consentGiven
                ? 'Trip replay: Will auto-delete in 7 days'
                : 'Trip replay: Not saved'
              }
            </span>
          </div>
        </div>

        {/* Privacy Policy Link */}
        <div className="text-center mb-4">
          <a
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-brand-500 underline"
          >
            View our Privacy Policy
          </a>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full h-14 bg-success text-white font-bold rounded-xl"
        >
          Got It ({countdown}s)
        </button>
      </div>
    </div>
  )
}
