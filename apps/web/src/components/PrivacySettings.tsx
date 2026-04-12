import { useState } from 'react'

interface PrivacySettingsProps {
  isOpen: boolean
  onClose: () => void
  deviceId: string
  onOpenTripHistory?: () => void
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export function PrivacySettings({ isOpen, onClose, deviceId, onOpenTripHistory }: PrivacySettingsProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  if (!isOpen) return null

  const handleDownloadData = async () => {
    setLoading('download')
    setMessage(null)
    
    try {
      const response = await fetch(`${API_URL}/api/privacy/export/${deviceId}`)
      
      if (!response.ok) {
        throw new Error('Failed to export data')
      }
      
      const data = await response.json()
      
      // Create and download JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `syncride-data-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      setMessage({ type: 'success', text: 'Data exported successfully!' })
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to export data. Please try again.' })
    } finally {
      setLoading(null)
    }
  }

  const handleDeleteData = async () => {
    setLoading('delete')
    setMessage(null)
    
    try {
      const response = await fetch(`${API_URL}/api/privacy/delete/${deviceId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete data')
      }
      
      // Clear local storage
      localStorage.removeItem('deviceId')
      localStorage.removeItem('consent_given')
      
      setMessage({ type: 'success', text: 'All your data has been deleted.' })
      setShowDeleteConfirm(false)
      
      // Reload page to generate new device ID
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete data. Please try again.' })
    } finally {
      setLoading(null)
    }
  }

  const handleWithdrawConsent = () => {
    localStorage.removeItem('consent_given')
    setMessage({ type: 'success', text: 'Location consent withdrawn. You will be asked again on next trip.' })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
      <div className="bg-surface w-full max-w-md rounded-t-3xl sm:rounded-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-surface p-4 border-b border-[var(--border)] flex items-center justify-between">
          <h2 className="text-xl font-bold">Your Data Rights</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-surface-secondary flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <div className="p-4 space-y-4">

          {/* Message */}
          {message && (
            <div className={`p-4 rounded-xl ${
              message.type === 'success' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
            }`}>
              {message.text}
            </div>
          )}

          {/* Trip History */}
          {onOpenTripHistory && (
            <div className="card p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">📜</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-content">Trip History</h3>
                  <p className="text-sm text-content-secondary mt-1">
                    View and manage your saved trip replays (available for 7 days).
                  </p>
                  <button
                    onClick={onOpenTripHistory}
                    className="mt-3 px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-medium"
                  >
                    View Trip History
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Right to Access */}
          <div className="card p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📥</span>
              <div className="flex-1">
                <h3 className="font-semibold text-content">Right to Access</h3>
                <p className="text-sm text-content-secondary mt-1">
                  Download a copy of all your data stored by SyncRide.
                </p>
                <button
                  onClick={handleDownloadData}
                  disabled={loading === 'download'}
                  className="mt-3 px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {loading === 'download' ? 'Exporting...' : 'Download My Data'}
                </button>
              </div>
            </div>
          </div>

          {/* Right to Correction */}
          <div className="card p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">✏️</span>
              <div className="flex-1">
                <h3 className="font-semibold text-content">Right to Correction</h3>
                <p className="text-sm text-content-secondary mt-1">
                  Your display name can be changed when joining or creating a trip. No other personal information is stored.
                </p>
              </div>
            </div>
          </div>

          {/* Withdraw Consent */}
          <div className="card p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔒</span>
              <div className="flex-1">
                <h3 className="font-semibold text-content">Withdraw Consent</h3>
                <p className="text-sm text-content-secondary mt-1">
                  Revoke your location data collection consent. You'll be asked again on your next trip.
                </p>
                <button
                  onClick={handleWithdrawConsent}
                  className="mt-3 px-4 py-2 bg-surface-secondary text-content rounded-lg text-sm font-medium"
                >
                  Withdraw Consent
                </button>
              </div>
            </div>
          </div>

          {/* Right to Erasure (Deletion) */}
          <div className="card p-4 border-2 border-danger/30">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🗑️</span>
              <div className="flex-1">
                <h3 className="font-semibold text-danger">Right to Erasure</h3>
                <p className="text-sm text-content-secondary mt-1">
                  Permanently delete all your data from SyncRide. This action cannot be undone.
                </p>
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="mt-3 px-4 py-2 bg-danger text-white rounded-lg text-sm font-medium"
                  >
                    Delete All My Data
                  </button>
                ) : (
                  <div className="mt-3 p-3 bg-danger/10 rounded-lg">
                    <p className="text-sm text-danger mb-3">
                      Are you sure? This will delete all your trip history, consent records, and cached data. This action is irreversible.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleDeleteData}
                        disabled={loading === 'delete'}
                        className="px-4 py-2 bg-danger text-white rounded-lg text-sm font-medium disabled:opacity-50"
                      >
                        {loading === 'delete' ? 'Deleting...' : 'Yes, Delete Everything'}
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-4 py-2 bg-surface-secondary text-content rounded-lg text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Data Portability */}
          <div className="card p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📤</span>
              <div className="flex-1">
                <h3 className="font-semibold text-content">Data Portability</h3>
                <p className="text-sm text-content-secondary mt-1">
                  Your data export is in JSON format, which can be imported into other services or used for your records.
                </p>
              </div>
            </div>
          </div>

          {/* Device ID Display */}
          <div className="bg-surface-secondary p-4 rounded-xl">
            <p className="text-xs text-content-muted">
              Your Device ID (masked): {deviceId.slice(0, 8)}...{deviceId.slice(-4)}
            </p>
            <p className="text-xs text-content-muted mt-1">
              This ID is used to identify your data. It rotates after each trip for privacy.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
