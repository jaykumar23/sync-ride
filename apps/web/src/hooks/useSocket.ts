import { useEffect, useState, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { Coordinates } from 'shared-types'
import { useLocationStore } from '../store/locationStore'
import { useSOSStore } from '../store/sosStore'
import { useConnectionStore } from '../store/connectionStore'

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000'

interface BufferedPathPoint {
  latitude: number
  longitude: number
  timestamp: Date
}

interface TripEventCallbacks {
  onTripEnded?: () => void
  onRiderLeft?: (riderId: string, displayName: string) => void
  onRiderKicked?: (riderId: string, displayName: string) => void
  onKicked?: () => void
  onStatusReceived?: (displayName: string, status: string) => void
  onRiderJoined?: (riderId: string, displayName: string) => void
  onRiderReconnected?: (riderId: string, displayName: string, bufferedPath: BufferedPathPoint[]) => void
}

export function useSocket(
  tripCode: string | null, 
  riderId: string | null,
  displayName: string | null,
  callbacks?: TripEventCallbacks
) {
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const socketRef = useRef<Socket | null>(null)
  const reconnectAttemptRef = useRef(0)
  const updateLocation = useLocationStore((state) => state.updateLocation)
  const removeLocation = useLocationStore((state) => state.removeLocation)
  const addSOSAlert = useSOSStore((state) => state.addAlert)
  const removeSOSAlert = useSOSStore((state) => state.removeAlert)
  const setMySOSActive = useSOSStore((state) => state.setMySOSActive)
  const { setConnected: setConnectionConnected, setReconnecting, setFailed, setOffline, reset: resetConnection } = useConnectionStore()
  const callbacksRef = useRef(callbacks)
  callbacksRef.current = callbacks

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Network online')
      setOffline(false)
    }
    const handleOffline = () => {
      console.log('📴 Network offline')
      setOffline(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Set initial state
    if (!navigator.onLine) {
      setOffline(true)
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [setOffline])

  useEffect(() => {
    if (!tripCode || !riderId) {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
      setConnected(false)
      resetConnection()
      return
    }

    console.log(`🔌 Connecting to WebSocket: ${WS_URL}`)
    
    const socket = io(WS_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 8000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
      randomizationFactor: 0.25, // Add jitter ±25%
    })

    socket.on('connect', () => {
      console.log('✅ WebSocket connected:', socket.id)
      setConnected(true)
      setError(null)
      setConnectionConnected()
      reconnectAttemptRef.current = 0

      // Join trip room with displayName
      socket.emit('trip:join', { tripCode, riderId, displayName })
    })

    socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason)
      setConnected(false)
      reconnectAttemptRef.current = 0
    })

    // Track reconnection attempts
    socket.io.on('reconnect_attempt', (attempt) => {
      console.log(`🔄 Reconnection attempt ${attempt}/5`)
      reconnectAttemptRef.current = attempt
      setReconnecting(attempt)
    })

    socket.io.on('reconnect', () => {
      console.log('✅ Reconnected successfully')
      setConnectionConnected()
      reconnectAttemptRef.current = 0
    })

    socket.io.on('reconnect_failed', () => {
      console.log('❌ Reconnection failed after all attempts')
      setFailed()
    })

    socket.on('connect_error', (err) => {
      console.error('⚠️ WebSocket connection error:', err.message)
      setError(`Connection failed: ${err.message}`)
    })

    // Listen for location broadcasts from other riders
    socket.on('location:broadcast', (payload: { riderId: string; displayName?: string; location: Coordinates }) => {
      console.log(`📍 Received location from ${payload.displayName || payload.riderId}`)
      updateLocation(payload.riderId, payload.location, payload.displayName)
    })

    // Listen for rider joined events
    socket.on('rider:joined', (payload: { riderId: string; displayName: string; socketId: string }) => {
      console.log(`👋 Rider joined: ${payload.displayName} (${payload.riderId})`)
      callbacksRef.current?.onRiderJoined?.(payload.riderId, payload.displayName)
    })
    
    // Listen for SOS broadcasts
    socket.on('sos:broadcast', (payload: { riderId: string; displayName: string; coordinates: Coordinates; timestamp: string }) => {
      console.log(`🚨 SOS received from ${payload.displayName}`)
      addSOSAlert(payload)
    })
    
    // Listen for SOS cancellation
    socket.on('sos:cancelled', (payload: { riderId: string }) => {
      console.log(`✅ SOS cancelled by ${payload.riderId}`)
      removeSOSAlert(payload.riderId)
    })
    
    // Listen for status broadcasts
    socket.on('status:broadcast', (payload: { riderId: string; displayName: string; status: string; timestamp: string }) => {
      console.log(`📢 Status from ${payload.displayName}: ${payload.status}`)
      // Only show status from other riders
      if (payload.riderId !== riderId) {
        callbacksRef.current?.onStatusReceived?.(payload.displayName, payload.status)
      }
    })
    
    // Listen for trip ended
    socket.on('trip:ended', () => {
      console.log('🛑 Trip ended by host')
      callbacksRef.current?.onTripEnded?.()
    })
    
    // Listen for rider left
    socket.on('rider:left', (payload: { riderId: string; displayName: string }) => {
      console.log(`👋 ${payload.displayName} left the trip`)
      removeLocation(payload.riderId)
      callbacksRef.current?.onRiderLeft?.(payload.riderId, payload.displayName)
    })
    
    // Listen for rider kicked
    socket.on('rider:kicked', (payload: { riderId: string; displayName: string }) => {
      console.log(`🚫 ${payload.displayName} was kicked`)
      removeLocation(payload.riderId)
      if (payload.riderId === riderId) {
        callbacksRef.current?.onKicked?.()
      } else {
        callbacksRef.current?.onRiderKicked?.(payload.riderId, payload.displayName)
      }
    })

    // Listen for rider reconnected (after being offline)
    socket.on('rider:reconnected', (payload: { riderId: string; displayName: string; bufferedPath: BufferedPathPoint[]; timestamp: string }) => {
      console.log(`🔄 ${payload.displayName} reconnected with ${payload.bufferedPath?.length || 0} buffered locations`)
      callbacksRef.current?.onRiderReconnected?.(payload.riderId, payload.displayName, payload.bufferedPath || [])
    })

    socketRef.current = socket

    return () => {
      socket.disconnect()
      socketRef.current = null
      resetConnection()
    }
  }, [tripCode, riderId, displayName, updateLocation, removeLocation, addSOSAlert, removeSOSAlert, setConnectionConnected, setReconnecting, setFailed, setOffline, resetConnection])

  // Update location statuses every 5 seconds
  const updateStatuses = useLocationStore((state) => state.updateStatuses)
  useEffect(() => {
    if (!connected) return
    
    const interval = setInterval(() => {
      updateStatuses()
    }, 5000)

    return () => clearInterval(interval)
  }, [connected, updateStatuses])

  // SOS functions
  const sendSOS = (displayName: string, coordinates: Coordinates) => {
    if (socketRef.current && tripCode && riderId) {
      socketRef.current.emit('sos:send', {
        tripCode,
        riderId,
        displayName,
        coordinates
      })
      setMySOSActive(true)
    }
  }

  const cancelSOS = () => {
    console.log('🛑 Cancelling SOS...', { socket: !!socketRef.current, tripCode, riderId })
    // Always reset local state first
    setMySOSActive(false)
    
    if (socketRef.current && tripCode && riderId) {
      socketRef.current.emit('sos:cancel', { tripCode, riderId })
      console.log('✅ SOS cancel emitted')
    }
  }

  const sendStatus = (displayName: string, status: string) => {
    if (socketRef.current && tripCode && riderId) {
      socketRef.current.emit('status:send', {
        tripCode,
        riderId,
        displayName,
        status
      })
    }
  }

  const endTrip = (code?: string) => {
    const tripCodeToUse = code || tripCode
    console.log('🛑 endTrip called:', { socket: !!socketRef.current, tripCode: tripCodeToUse })
    if (socketRef.current && tripCodeToUse) {
      socketRef.current.emit('trip:end', { tripCode: tripCodeToUse })
      console.log('✅ trip:end event emitted for', tripCodeToUse)
    } else {
      console.warn('⚠️ endTrip failed - socket or tripCode missing')
    }
  }

  const leaveTrip = (displayName: string, code?: string) => {
    const tripCodeToUse = code || tripCode
    console.log('👋 leaveTrip called:', { socket: !!socketRef.current, tripCode: tripCodeToUse, riderId })
    if (socketRef.current && tripCodeToUse && riderId) {
      socketRef.current.emit('trip:leave', {
        tripCode: tripCodeToUse,
        riderId,
        displayName
      })
      console.log('✅ trip:leave event emitted')
    } else {
      console.warn('⚠️ leaveTrip failed - socket, tripCode, or riderId missing')
    }
  }

  const kickRider = (targetRiderId: string, displayName: string) => {
    if (socketRef.current && tripCode) {
      socketRef.current.emit('trip:kick', {
        tripCode,
        targetRiderId,
        displayName
      })
    }
  }

  const retryConnection = useCallback(() => {
    if (socketRef.current) {
      console.log('🔄 Manual reconnection attempt')
      reconnectAttemptRef.current = 0
      setReconnecting(1)
      socketRef.current.connect()
    }
  }, [setReconnecting])

  return { 
    socket: socketRef.current, 
    connected, 
    error, 
    sendSOS, 
    cancelSOS, 
    sendStatus,
    endTrip,
    leaveTrip,
    kickRider,
    retryConnection
  }
}
