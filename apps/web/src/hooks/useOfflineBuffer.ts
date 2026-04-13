import { useEffect, useRef, useCallback } from 'react'
import { Coordinates } from 'shared-types'
import { Socket } from 'socket.io-client'
import { useConnectionStore } from '../store/connectionStore'
import { 
  bufferLocation, 
  getBufferedLocations, 
  clearBuffer, 
  checkStorageAvailable
} from '../utils/offlineBuffer'

const BATCH_INTERVAL = 5000 // Batch every 5 seconds

interface UseOfflineBufferProps {
  socket: Socket | null
  tripCode: string | null
  riderId: string | null
  displayName: string | null
}

export function useOfflineBuffer({ socket, tripCode, riderId, displayName }: UseOfflineBufferProps) {
  const { status, isOnline } = useConnectionStore()
  const pendingLocationsRef = useRef<Coordinates[]>([])
  const batchTimerRef = useRef<NodeJS.Timeout | null>(null)
  const storageAvailableRef = useRef(true)

  // Check storage on mount
  useEffect(() => {
    checkStorageAvailable().then(available => {
      storageAvailableRef.current = available
    })
  }, [])

  // Buffer a location when offline
  const bufferLocationUpdate = useCallback(async (coordinates: Coordinates) => {
    if (!riderId || !storageAvailableRef.current) return

    pendingLocationsRef.current.push(coordinates)

    // Batch writes to reduce IndexedDB operations
    if (!batchTimerRef.current) {
      batchTimerRef.current = setTimeout(async () => {
        const locationsToBuffer = [...pendingLocationsRef.current]
        pendingLocationsRef.current = []
        batchTimerRef.current = null

        for (const coords of locationsToBuffer) {
          try {
            await bufferLocation({
              riderId,
              coordinates: coords,
              timestamp: coords.timestamp instanceof Date ? coords.timestamp : new Date(coords.timestamp),
              heading: coords.heading,
              speed: coords.speed
            })
          } catch (error) {
            console.error('Failed to buffer location:', error)
          }
        }
      }, BATCH_INTERVAL)
    }
  }, [riderId])

  // Flush buffered locations when reconnected
  const flushBuffer = useCallback(async () => {
    if (!socket || !tripCode || !riderId || !displayName) return

    try {
      const bufferedLocations = await getBufferedLocations(riderId)
      
      if (bufferedLocations.length === 0) {
        console.log('📦 No buffered locations to flush')
        return
      }

      console.log(`📤 Flushing ${bufferedLocations.length} buffered locations`)

      // Extract path coordinates for trail display
      const bufferedPath = bufferedLocations.map(loc => ({
        latitude: loc.coordinates.latitude,
        longitude: loc.coordinates.longitude,
        timestamp: loc.timestamp
      }))

      // Notify other riders about reconnection with trail
      socket.emit('rider:reconnect', {
        tripCode,
        riderId,
        displayName,
        bufferedPath
      })

      // Send the latest location update
      const lastLocation = bufferedLocations[bufferedLocations.length - 1]
      socket.emit('location:update', {
        tripCode,
        riderId,
        displayName,
        location: lastLocation.coordinates
      })

      // Clear the buffer after successful flush
      await clearBuffer(riderId)
      
      console.log('✅ Buffer flushed successfully')
    } catch (error) {
      console.error('❌ Failed to flush buffer:', error)
    }
  }, [socket, tripCode, riderId, displayName])

  // Auto-flush when connection is restored
  useEffect(() => {
    if (status === 'connected' && isOnline) {
      flushBuffer()
    }
  }, [status, isOnline, flushBuffer])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (batchTimerRef.current) {
        clearTimeout(batchTimerRef.current)
      }
    }
  }, [])

  return {
    bufferLocationUpdate,
    flushBuffer,
    isBuffering: !isOnline || status !== 'connected'
  }
}
