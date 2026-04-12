import { useState, useEffect } from 'react'

interface StatusSheetProps {
  isOpen: boolean
  onClose: () => void
  onSendStatus: (status: string) => void
}

const STATUS_OPTIONS = [
  { id: 'gas', label: 'Need Gas', icon: '⛽', color: 'bg-yellow-500', priority: 'normal' },
  { id: 'break', label: 'Taking Break', icon: '☕', color: 'bg-blue-500', priority: 'normal' },
  { id: 'mechanical', label: 'Mechanical Issue', icon: '🔧', color: 'bg-orange-500', priority: 'normal' },
  { id: 'medical', label: 'Medical Emergency', icon: '🚨', color: 'bg-red-600', priority: 'high' },
]

export function StatusSheet({ isOpen, onClose, onSendStatus }: StatusSheetProps) {
  const [showMedicalConfirm, setShowMedicalConfirm] = useState(false)

  // Reset state when sheet closes
  useEffect(() => {
    if (!isOpen) {
      setShowMedicalConfirm(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleStatusClick = (status: typeof STATUS_OPTIONS[0]) => {
    if (status.priority === 'high') {
      setShowMedicalConfirm(true)
      return
    }
    
    onSendStatus(status.label)
    onClose()
    
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }
  }

  const confirmMedicalEmergency = () => {
    onSendStatus('Medical Emergency')
    setShowMedicalConfirm(false)
    onClose()
    
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200])
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-map-overlay rounded-t-2xl p-4 animate-slide-up">
        {/* Handle */}
        <div className="w-12 h-1 bg-glance-text/30 rounded-full mx-auto mb-4" />

        {/* Header */}
        <h2 className="text-xl font-bold text-glance-text mb-4 text-center">
          Send Status
        </h2>

        {/* Status Buttons */}
        <div className="space-y-4">
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status.id}
              onClick={() => handleStatusClick(status)}
              className={`w-full h-[120px] ${status.color} text-white rounded-lg flex items-center justify-center gap-4 transition-transform active:scale-95`}
            >
              <span className="text-5xl">{status.icon}</span>
              <span className="text-xl font-bold">{status.label}</span>
            </button>
          ))}
        </div>

        {/* Cancel */}
        <button
          onClick={onClose}
          className="w-full h-16 mt-4 bg-map-bg text-glance-text rounded-lg font-bold"
        >
          Cancel
        </button>
      </div>

      {/* Medical Emergency Confirmation - render outside the sheet structure */}
      {showMedicalConfirm && (
        <>
          {/* Higher z-index backdrop */}
          <div 
            className="fixed inset-0 bg-black/80"
            style={{ zIndex: 100 }}
            onClick={() => setShowMedicalConfirm(false)}
          />
          {/* Modal */}
          <div 
            className="fixed inset-0 flex items-center justify-center pointer-events-none"
            style={{ zIndex: 101 }}
          >
            <div 
              className="bg-red-600 p-6 rounded-2xl mx-4 max-w-md w-full text-white text-center pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-6xl mb-4">🚨</div>
              <h2 className="text-2xl font-bold mb-4">Send Medical Emergency Alert?</h2>
              <p className="mb-6">
                This will notify all riders immediately.
              </p>
              <div className="space-y-3">
                <button
                  onClick={confirmMedicalEmergency}
                  className="w-full h-[120px] bg-white text-red-600 font-bold text-xl rounded-lg"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setShowMedicalConfirm(false)}
                  className="w-full h-20 bg-red-800 text-white font-bold rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
