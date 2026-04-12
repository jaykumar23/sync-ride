import { useState, useRef, useCallback, useEffect } from 'react'

interface SOSButtonProps {
  onSOS: () => void
  isActive: boolean
  onCancel: () => void
}

export function SOSButton({ onSOS, isActive, onCancel }: SOSButtonProps) {
  const [isHolding, setIsHolding] = useState(false)
  const [holdProgress, setHoldProgress] = useState(0)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isCooldown, setIsCooldown] = useState(false)
  const holdTimer = useRef<NodeJS.Timeout | null>(null)
  const progressTimer = useRef<NodeJS.Timeout | null>(null)
  const cooldownTimer = useRef<NodeJS.Timeout | null>(null)

  const HOLD_DURATION = 2000 // 2 seconds to activate
  const COOLDOWN_DURATION = 1000 // 1 second cooldown after cancel

  // Reset local state and set cooldown when isActive changes to false (SOS cancelled)
  useEffect(() => {
    setShowConfirm(false)
    setIsHolding(false)
    setHoldProgress(0)
    
    // Clear any running timers
    if (holdTimer.current) {
      clearTimeout(holdTimer.current)
      holdTimer.current = null
    }
    if (progressTimer.current) {
      clearInterval(progressTimer.current)
      progressTimer.current = null
    }
  }, [isActive])

  // Set cooldown when component mounts with isActive=false after being active
  useEffect(() => {
    if (!isActive) {
      setIsCooldown(true)
      cooldownTimer.current = setTimeout(() => {
        setIsCooldown(false)
      }, COOLDOWN_DURATION)
    }
    
    return () => {
      if (cooldownTimer.current) {
        clearTimeout(cooldownTimer.current)
      }
    }
  }, [isActive])

  const startHold = useCallback(() => {
    if (isActive || isCooldown) return
    
    setIsHolding(true)
    setHoldProgress(0)

    if (navigator.vibrate) {
      navigator.vibrate(50)
    }

    const startTime = Date.now()
    progressTimer.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min((elapsed / HOLD_DURATION) * 100, 100)
      setHoldProgress(progress)

      if (progress >= 100) {
        clearInterval(progressTimer.current!)
        setShowConfirm(true)
        setIsHolding(false)
        if (navigator.vibrate) {
          navigator.vibrate([200, 100, 200])
        }
      }
    }, 50)

    holdTimer.current = setTimeout(() => {}, HOLD_DURATION)
  }, [isActive, isCooldown])

  const endHold = useCallback(() => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current)
    }
    if (progressTimer.current) {
      clearInterval(progressTimer.current)
    }
    setIsHolding(false)
    setHoldProgress(0)
  }, [])

  const confirmSOS = useCallback(() => {
    setShowConfirm(false)
    onSOS()
    if (navigator.vibrate) {
      navigator.vibrate([500, 200, 500, 200, 500])
    }
  }, [onSOS])

  const cancelConfirm = useCallback(() => {
    setShowConfirm(false)
  }, [])

  // Simple direct cancel - just call onCancel
  const handleCancelSOS = useCallback(() => {
    onCancel()
  }, [onCancel])

  // If SOS is active, show ONLY the cancel button (completely separate from SOS button)
  if (isActive) {
    return (
      <div 
        className="fixed bottom-24 left-4 z-20"
        style={{ touchAction: 'manipulation' }}
      >
        <button
          type="button"
          onClick={handleCancelSOS}
          className="w-20 h-20 rounded-full bg-red-600 text-white font-bold text-sm shadow-lg animate-pulse border-4 border-white active:scale-95 transition-transform"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          Cancel SOS
        </button>
      </div>
    )
  }

  return (
    <>
      {/* SOS Button */}
      <button
        onMouseDown={startHold}
        onMouseUp={endHold}
        onMouseLeave={endHold}
        onTouchStart={startHold}
        onTouchEnd={endHold}
        disabled={isCooldown}
        className={`fixed bottom-24 left-4 z-20 rounded-full text-white font-bold shadow-lg transition-all duration-300 ${
          isCooldown ? 'bg-gray-400 opacity-50' : 'bg-red-600'
        } ${
          isHolding ? 'w-full left-0 mx-4 h-40 rounded-2xl' : 'w-20 h-20'
        }`}
        style={{ maxWidth: isHolding ? 'calc(100% - 32px)' : '80px' }}
      >
        {isHolding ? (
          <div className="flex flex-col items-center justify-center h-full p-4">
            <p className="text-2xl mb-4">Hold to Activate SOS</p>
            <div className="w-full bg-red-900 rounded-full h-4">
              <div
                className="bg-white h-4 rounded-full transition-all duration-100"
                style={{ width: `${holdProgress}%` }}
              />
            </div>
            <p className="text-sm mt-2">{Math.round(holdProgress)}%</p>
          </div>
        ) : (
          <span className="text-xl">SOS</span>
        )}
      </button>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-red-600 p-6 rounded-2xl mx-4 max-w-md w-full text-white text-center">
            <div className="text-6xl mb-4">🚨</div>
            <h2 className="text-2xl font-bold mb-4">Send SOS Alert?</h2>
            <p className="mb-6">
              This will notify all group members of your emergency and share your exact location.
            </p>
            <div className="space-y-3">
              <button
                onClick={confirmSOS}
                className="w-full h-[120px] bg-white text-red-600 font-bold text-xl rounded-lg"
              >
                SEND SOS
              </button>
              <button
                onClick={cancelConfirm}
                className="w-full h-20 bg-red-800 text-white font-bold rounded-lg"
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
