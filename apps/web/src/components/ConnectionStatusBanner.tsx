import { useEffect, useState } from 'react'
import { useConnectionStore, ConnectionStatus } from '../store/connectionStore'

interface ConnectionStatusBannerProps {
  onRetry?: () => void
}

export function ConnectionStatusBanner({ onRetry }: ConnectionStatusBannerProps) {
  const { status, reconnectAttempt, maxAttempts, isOnline } = useConnectionStore()
  const [visible, setVisible] = useState(false)
  const [showConnected, setShowConnected] = useState(false)

  useEffect(() => {
    if (status === 'connected') {
      setShowConnected(true)
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
        setTimeout(() => setShowConnected(false), 300)
      }, 2000)
      return () => clearTimeout(timer)
    } else if (status === 'reconnecting' || status === 'failed' || status === 'offline') {
      setVisible(true)
      setShowConnected(false)
    } else {
      setVisible(false)
    }
  }, [status])

  const getStatusConfig = (): { bg: string; icon: string; text: string; animate: boolean } => {
    if (!isOnline) {
      return {
        bg: 'bg-gray-600',
        icon: '📡',
        text: 'Offline Mode - Limited Functionality',
        animate: false
      }
    }

    switch (status) {
      case 'reconnecting':
        return {
          bg: 'bg-orange-500',
          icon: '🔄',
          text: `Reconnecting... attempt ${reconnectAttempt}/${maxAttempts}`,
          animate: true
        }
      case 'connected':
        return {
          bg: 'bg-green-500',
          icon: '✓',
          text: 'Connected',
          animate: false
        }
      case 'failed':
        return {
          bg: 'bg-red-500',
          icon: '⚠️',
          text: 'Connection failed. Tap to retry.',
          animate: false
        }
      case 'offline':
        return {
          bg: 'bg-gray-600',
          icon: '📡',
          text: 'Offline Mode - Limited Functionality',
          animate: false
        }
      default:
        return {
          bg: 'bg-gray-500',
          icon: '○',
          text: 'Disconnected',
          animate: false
        }
    }
  }

  const config = getStatusConfig()

  if (!visible && !showConnected) return null

  const handleClick = () => {
    if (status === 'failed' && onRetry) {
      onRetry()
    }
  }

  return (
    <div
      onClick={handleClick}
      className={`
        fixed top-0 left-0 right-0 z-30 h-12 flex items-center justify-center gap-2
        ${config.bg} text-white font-medium
        transition-transform duration-300 ease-out
        ${visible ? 'translate-y-0' : '-translate-y-full'}
        ${status === 'failed' ? 'cursor-pointer active:opacity-80' : ''}
      `}
    >
      <span className={config.animate ? 'animate-spin' : ''}>
        {config.icon}
      </span>
      <span>{config.text}</span>
    </div>
  )
}
