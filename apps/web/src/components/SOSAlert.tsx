import { useEffect, useRef } from 'react'
import { Coordinates } from 'shared-types'
import { formatDistance } from '../utils/distance'

interface SOSAlertProps {
  senderName: string
  senderCoordinates: Coordinates
  distance: number
  onViewOnMap: () => void
  onDismiss: () => void
}

export function SOSAlert({
  senderName,
  senderCoordinates,
  distance,
  onViewOnMap,
  onDismiss
}: SOSAlertProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const vibrationIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // Continuous alert sound and vibration
  useEffect(() => {
    // Create audio element for looping alert sound
    const createAlertSound = () => {
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleB0IVJnW4ouHHQlql9vjjH8lDHWX3Ol/bBgKiJzr6nVoGwxsmOLgfWYUB3+Zztp2ZxsKeZzZ13JjGwt2l9HWdWUZCWyRyt90ZBcHZIvG2nlkFQVeh8PVfWUTAWGKw9WCaBIBZo7G1oJoEQJojsfXg2kQAWuQydeDahABcJPM2YNrDwFzlc/ahGsPAXSW0NuFbA4BdJbR24VtDQF0ltLchm4NAXSW0t2Hbg0BdJbT3YdvDQF0ltTdh28NAXSb1t+HcA0Bd6DY4IhwDQF/rNzjh28LAYm33eSHbQsBm8bi5IVqCQGpzefkgmcIAbn/')
        audio.volume = 0.7
        audio.loop = true
        audioRef.current = audio
        audio.play().catch(() => {})
      } catch {
        // Audio not supported
      }
    }

    createAlertSound()

    // Continuous vibration pattern
    const startVibration = () => {
      if (navigator.vibrate) {
        // Initial strong vibration
        navigator.vibrate([500, 200, 500, 200, 500])
        
        // Keep vibrating every 2 seconds
        vibrationIntervalRef.current = setInterval(() => {
          if (navigator.vibrate) {
            navigator.vibrate([500, 200, 500, 200, 500])
          }
        }, 2000)
      }
    }

    startVibration()

    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      if (vibrationIntervalRef.current) {
        clearInterval(vibrationIntervalRef.current)
        vibrationIntervalRef.current = null
      }
      if (navigator.vibrate) {
        navigator.vibrate(0) // Stop vibration
      }
    }
  }, [])

  const handleDismiss = () => {
    // Stop sound and vibration before dismissing
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    if (vibrationIntervalRef.current) {
      clearInterval(vibrationIntervalRef.current)
    }
    if (navigator.vibrate) {
      navigator.vibrate(0)
    }
    onDismiss()
  }

  const handleViewOnMap = () => {
    // Stop sound and vibration before viewing map
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    if (vibrationIntervalRef.current) {
      clearInterval(vibrationIntervalRef.current)
    }
    if (navigator.vibrate) {
      navigator.vibrate(0)
    }
    onViewOnMap()
  }

  const shareLocation = () => {
    const mapsUrl = `https://maps.google.com/?q=${senderCoordinates.latitude},${senderCoordinates.longitude}`
    const message = `SOS Alert from ${senderName}!\nLocation: ${mapsUrl}`
    
    if (navigator.share) {
      navigator.share({ text: message, url: mapsUrl })
    } else {
      navigator.clipboard.writeText(message)
      alert('Location copied to clipboard')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-red-600 animate-pulse">
      <div className="p-6 max-w-md w-full mx-4 text-white text-center">
        {/* SOS Icon */}
        <div className="text-8xl mb-4 animate-bounce">🚨</div>
        
        {/* Title */}
        <h1 className="text-4xl font-bold mb-2">SOS ALERT</h1>
        
        {/* Sender Info */}
        <p className="text-3xl font-bold mb-2">{senderName}</p>
        <p className="text-2xl mb-4">{formatDistance(distance)} away</p>
        
        {/* Coordinates */}
        <p className="text-sm font-mono mb-6 opacity-80">
          {senderCoordinates.latitude.toFixed(6)}, {senderCoordinates.longitude.toFixed(6)}
        </p>
        
        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleViewOnMap}
            className="w-full h-[120px] bg-white text-red-600 font-bold text-xl rounded-lg"
          >
            View on Map
          </button>
          
          <button
            onClick={shareLocation}
            className="w-full h-20 bg-white/20 text-white font-bold rounded-lg"
          >
            Share Location
          </button>
          
          <button
            onClick={handleDismiss}
            className="w-full h-16 bg-red-800 text-white font-bold rounded-lg"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  )
}
