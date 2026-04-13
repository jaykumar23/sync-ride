import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Trip } from 'shared-types'
import { useGeolocation } from './hooks/useGeolocation'
import { useSocket } from './hooks/useSocket'
import { useOfflineBuffer } from './hooks/useOfflineBuffer'
import { useLocationStore } from './store/locationStore'
import { useSOSStore } from './store/sosStore'
import { useConnectionStore } from './store/connectionStore'
import { useTheme } from './context/ThemeContext'
import { MapView } from './components/MapView'
import { BottomStatusBar } from './components/BottomStatusBar'
import { MemberListSheet } from './components/MemberListSheet'
import { SOSButton } from './components/SOSButton'
import { SOSAlert } from './components/SOSAlert'
import { StatusSheet } from './components/StatusSheet'
import { TripSettings } from './components/TripSettings'
import { ConnectionStatusBanner } from './components/ConnectionStatusBanner'
import { ConsentModal } from './components/ConsentModal'
import { DataDeletionModal } from './components/DataDeletionModal'
import { PrivacySettings } from './components/PrivacySettings'
import { TripSummary } from './components/TripSummary'
import { AttributionSurvey } from './components/AttributionSurvey'
import { ShareTripModal } from './components/ShareTripModal'
import { ExportSummaryModal } from './components/ExportSummaryModal'
import { TripHistory } from './components/TripHistory'
import { calculateDistance } from './utils/distance'

interface TripStats {
  personal: {
    totalDistance: number;
    ridingTime: number;
    maxSpeed: number;
    avgSpeed: number;
  };
  group: {
    riderCount: number;
    groupDistance: number;
    maxSeparation: number;
  };
  tripCode: string;
  tripStartedAt: Date;
  tripEndedAt: Date;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

type View = 'home' | 'trip' | 'join' | 'create'

const getDeviceId = (): string => {
  let id = localStorage.getItem('deviceId')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('deviceId', id)
  }
  return id
}

const rotateDeviceId = (): string => {
  const newId = crypto.randomUUID()
  localStorage.setItem('deviceId', newId)
  console.log('🔄 Device ID rotated for privacy')
  return newId
}

let DEVICE_ID = getDeviceId()

function App() {
  const { theme, toggleTheme } = useTheme()
  const [view, setView] = useState<View>('home')
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [joinCode, setJoinCode] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [myDisplayName, setMyDisplayName] = useState<string>('')
  const [_showCopied, setShowCopied] = useState(false)
  const [showMemberList, setShowMemberList] = useState(false)
  const [showStatusSheet, setShowStatusSheet] = useState(false)
  const [showTripSettings, setShowTripSettings] = useState(false)
  const [statusToast, setStatusToast] = useState<string | null>(null)
  const [tripEndedMessage, setTripEndedMessage] = useState<string | null>(null)
  const [showConsentModal, setShowConsentModal] = useState(false)
  const [showDeletionModal, setShowDeletionModal] = useState(false)
  const [showPrivacySettings, setShowPrivacySettings] = useState(false)
  const [endedTripCode, setEndedTripCode] = useState<string | null>(null)
  const [consentGiven, setConsentGiven] = useState<boolean | null>(null)
  const [showTripSummary, setShowTripSummary] = useState(false)
  const [tripStats, setTripStats] = useState<TripStats | null>(null)
  const [showAttributionSurvey, setShowAttributionSurvey] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showTripHistory, setShowTripHistory] = useState(false)
  const [pendingLeaveInfo, setPendingLeaveInfo] = useState<{isHost: boolean; displayName: string} | null>(null)
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const tripStartTimeRef = useRef<Date | null>(null)
  const locationHistoryRef = useRef<Array<{latitude: number; longitude: number; speed?: number; timestamp: string}>>([])
  const otherRiderLocationsRef = useRef<Map<string, Array<{latitude: number; longitude: number; riderId: string}>>>(new Map())
  const tripRef = useRef<Trip | null>(null)
  
  // Keep tripRef in sync with trip state
  useEffect(() => {
    tripRef.current = trip
  }, [trip])
  
  const showToast = useCallback((message: string, duration = 5000) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current)
    }
    setStatusToast(message)
    toastTimeoutRef.current = setTimeout(() => {
      setStatusToast(null)
      toastTimeoutRef.current = null
    }, duration)
  }, [])

  const gps = useGeolocation(view === 'trip')

  const tripEventCallbacks = useMemo(() => ({
    onTripEnded: () => {
      console.log('🛑 onTripEnded callback received')
      // Use tripRef to get current trip data (avoids stale closure)
      const currentTrip = tripRef.current
      if (currentTrip) {
        // Calculate stats before clearing trip
        const locations = locationHistoryRef.current
        let totalDistance = 0
        let maxSpeed = 0
        const speeds: number[] = []
        
        const toRadians = (deg: number) => deg * (Math.PI / 180)
        const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
          const R = 6371
          const dLat = toRadians(lat2 - lat1)
          const dLon = toRadians(lon2 - lon1)
          const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
                    Math.sin(dLon/2) * Math.sin(dLon/2)
          return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
        }
        
        for (let i = 1; i < locations.length; i++) {
          totalDistance += haversine(
            locations[i-1].latitude, locations[i-1].longitude,
            locations[i].latitude, locations[i].longitude
          )
          const speed = locations[i].speed
          if (speed !== undefined && speed > 0) {
            const speedKmh = speed * 3.6
            speeds.push(speedKmh)
            maxSpeed = Math.max(maxSpeed, speedKmh)
          }
        }
        
        const ridingTime = tripStartTimeRef.current 
          ? (Date.now() - tripStartTimeRef.current.getTime()) / 1000 / 60 
          : 0
        const avgSpeed = speeds.length > 0 
          ? speeds.reduce((a,b) => a+b, 0) / speeds.length 
          : (ridingTime > 0 ? (totalDistance / ridingTime) * 60 : 0)
        
        setTripStats({
          personal: {
            totalDistance: Math.round(totalDistance * 10) / 10,
            ridingTime: Math.round(ridingTime),
            maxSpeed: Math.round(maxSpeed),
            avgSpeed: Math.round(avgSpeed),
          },
          group: {
            riderCount: currentTrip.riders.length,
            groupDistance: Math.round(totalDistance * 10) / 10,
            maxSeparation: 0,
          },
          tripCode: currentTrip.tripCode,
          tripStartedAt: tripStartTimeRef.current || new Date(),
          tripEndedAt: new Date(),
        })
        setEndedTripCode(currentTrip.tripCode)
      }
      setTripEndedMessage('Trip ended by host. Location data deleted.')
      setTrip(null)
      setView('home')
      // Show trip summary for all riders
      setShowTripSummary(true)
      // Rotate device ID for privacy
      DEVICE_ID = rotateDeviceId()
    },
    onRiderLeft: (riderId: string, displayName: string) => {
      showToast(`${displayName} left the trip`, 3000)
      if (trip) {
        setTrip({
          ...trip,
          riders: trip.riders.filter(r => r.riderId !== riderId)
        })
      }
    },
    onRiderKicked: (riderId: string, displayName: string) => {
      showToast(`${displayName} was removed from the trip`, 3000)
      if (trip) {
        setTrip({
          ...trip,
          riders: trip.riders.filter(r => r.riderId !== riderId)
        })
      }
    },
    onKicked: () => {
      setTripEndedMessage('You have been removed from this trip by the host.')
      setTrip(null)
      setView('home')
      // Rotate device ID for privacy
      DEVICE_ID = rotateDeviceId()
    },
    onStatusReceived: (displayName: string, status: string) => {
      showToast(`${displayName}: ${status}`, 5000)
    },
    onRiderJoined: async (_riderId: string, riderName: string) => {
      showToast(`${riderName} joined the trip`, 3000)
      // Refresh trip data to get updated riders list
      if (trip) {
        try {
          const response = await fetch(`${API_URL}/api/trips/${trip.tripCode}`)
          if (response.ok) {
            const updatedTrip = await response.json()
            setTrip(updatedTrip)
          }
        } catch (err) {
          console.error('Failed to refresh trip data:', err)
        }
      }
    },
    onRiderReconnected: (_riderId: string, riderName: string, bufferedPath: unknown[]) => {
      const pathCount = bufferedPath?.length || 0
      showToast(`🔄 ${riderName} reconnected${pathCount > 0 ? ` (${pathCount} locations synced)` : ''}`, 4000)
    }
  }), [trip, showToast])

  const { 
    socket, 
    connected: wsConnected, 
    sendSOS, 
    cancelSOS, 
    sendStatus,
    endTrip,
    leaveTrip,
    kickRider: _kickRider,
    retryConnection
  } = useSocket(
    trip?.tripCode || null,
    DEVICE_ID,
    myDisplayName || null,
    tripEventCallbacks
  )

  const locations = useLocationStore((state) => state.locations)
  const otherLocations = Object.values(locations).filter(
    (loc) => loc.riderId !== DEVICE_ID
  )
  
  const _connectionStatus = useConnectionStore((state) => state.status)
  const isOnline = useConnectionStore((state) => state.isOnline)
  
  const { bufferLocationUpdate, isBuffering } = useOfflineBuffer({
    socket,
    tripCode: trip?.tripCode || null,
    riderId: DEVICE_ID,
    displayName: myDisplayName
  })
  
  const mySOSActive = useSOSStore((state) => state.mySOSActive)
  const pendingAlert = useSOSStore((state) => state.pendingAlert)
  const clearPendingAlert = useSOSStore((state) => state.clearPendingAlert)

  useEffect(() => {
    if (!gps.position || !trip) return
    
    // Track location history for stats calculation
    locationHistoryRef.current.push({
      latitude: gps.position.latitude,
      longitude: gps.position.longitude,
      speed: gps.position.speed || undefined,
      timestamp: new Date().toISOString(),
    })
    
    if (socket && wsConnected && isOnline) {
      // Online: send directly
      socket.emit('location:update', {
        tripCode: trip.tripCode,
        riderId: DEVICE_ID,
        displayName: myDisplayName || 'Unknown',
        location: gps.position,
      })
    } else if (isBuffering) {
      // Offline: buffer for later
      bufferLocationUpdate(gps.position)
    }
  }, [socket, wsConnected, gps.position, trip, myDisplayName, isOnline, isBuffering, bufferLocationUpdate])
  
  // Track other riders' locations for group stats
  useEffect(() => {
    Object.entries(locations).forEach(([riderId, loc]) => {
      if (riderId !== DEVICE_ID && loc) {
        const existing = otherRiderLocationsRef.current.get(riderId) || []
        existing.push({
          latitude: loc.coordinates.latitude,
          longitude: loc.coordinates.longitude,
          riderId,
        })
        otherRiderLocationsRef.current.set(riderId, existing)
      }
    })
  }, [locations])

  const _copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text)
    setShowCopied(true)
    setTimeout(() => setShowCopied(false), 2000)
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }
  }, [])

  const _shareWhatsApp = useCallback((code: string) => {
    const message = encodeURIComponent(`Join my SyncRide trip: ${code}`)
    window.open(`https://wa.me/?text=${message}`, '_blank')
  }, [])

  const _shareSMS = useCallback((code: string) => {
    const message = encodeURIComponent(`Join my SyncRide trip: ${code}`)
    window.location.href = `sms:?body=${message}`
  }, [])
  
  const myRider = useMemo(() => {
    return trip?.riders.find(r => r.riderId === DEVICE_ID)
  }, [trip?.riders])
  
  const isHost = useMemo(() => {
    return trip?.hostId === DEVICE_ID
  }, [trip?.hostId])
  
  const handleSOS = useCallback(() => {
    if (gps.position && myRider) {
      sendSOS(myRider.displayName, gps.position)
    }
  }, [gps.position, myRider, sendSOS])
  
  const handleCancelSOS = useCallback(() => {
    cancelSOS()
  }, [cancelSOS])
  
  const sosDistance = useMemo(() => {
    if (!pendingAlert || !gps.position) return 0
    return calculateDistance(
      gps.position.latitude,
      gps.position.longitude,
      pendingAlert.coordinates.latitude,
      pendingAlert.coordinates.longitude
    )
  }, [pendingAlert, gps.position])
  
  const handleSendStatus = useCallback((status: string) => {
    if (myRider) {
      sendStatus(myRider.displayName, status)
      showToast(`${status} sent to group`, 3000)
    }
  }, [myRider, sendStatus, showToast])
  
  const calculateTripStats = useCallback((): TripStats | null => {
    if (!trip) return null
    
    const locations = locationHistoryRef.current
    let totalDistance = 0
    let maxSpeed = 0
    const speeds: number[] = []
    
    // Haversine distance calculation
    const toRadians = (deg: number) => deg * (Math.PI / 180)
    const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371
      const dLat = toRadians(lat2 - lat1)
      const dLon = toRadians(lon2 - lon1)
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
                Math.sin(dLon/2) * Math.sin(dLon/2)
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    }
    
    for (let i = 1; i < locations.length; i++) {
      totalDistance += haversine(
        locations[i-1].latitude, locations[i-1].longitude,
        locations[i].latitude, locations[i].longitude
      )
      const speed = locations[i].speed
      if (speed !== undefined && speed > 0) {
        const speedKmh = speed * 3.6
        speeds.push(speedKmh)
        maxSpeed = Math.max(maxSpeed, speedKmh)
      }
    }
    
    const ridingTime = tripStartTimeRef.current 
      ? (Date.now() - tripStartTimeRef.current.getTime()) / 1000 / 60 
      : 0
    const avgSpeed = speeds.length > 0 
      ? speeds.reduce((a,b) => a+b, 0) / speeds.length 
      : (ridingTime > 0 ? (totalDistance / ridingTime) * 60 : 0)
    
    // Group stats
    let groupDistance = totalDistance
    let maxSeparation = 0
    
    otherRiderLocationsRef.current.forEach((riderLocs) => {
      let riderDistance = 0
      for (let i = 1; i < riderLocs.length; i++) {
        riderDistance += haversine(
          riderLocs[i-1].latitude, riderLocs[i-1].longitude,
          riderLocs[i].latitude, riderLocs[i].longitude
        )
      }
      groupDistance = Math.max(groupDistance, riderDistance)
      
      if (riderLocs.length > 0 && locations.length > 0) {
        const lastOther = riderLocs[riderLocs.length - 1]
        const lastMe = locations[locations.length - 1]
        const separation = haversine(lastMe.latitude, lastMe.longitude, lastOther.latitude, lastOther.longitude)
        maxSeparation = Math.max(maxSeparation, separation)
      }
    })
    
    return {
      personal: {
        totalDistance: Math.round(totalDistance * 10) / 10,
        ridingTime: Math.round(ridingTime),
        maxSpeed: Math.round(maxSpeed),
        avgSpeed: Math.round(avgSpeed),
      },
      group: {
        riderCount: trip.riders.length,
        groupDistance: Math.round(groupDistance * 10) / 10,
        maxSeparation: Math.round(maxSeparation * 10) / 10,
      },
      tripCode: trip.tripCode,
      tripStartedAt: tripStartTimeRef.current || new Date(),
      tripEndedAt: new Date(),
    }
  }, [trip])
  
  const handleEndTrip = useCallback(async () => {
    if (!trip) return
    
    // Calculate and store stats before showing consent modal
    const stats = calculateTripStats()
    setTripStats(stats)
    
    // Store info needed for consent callback (host ending trip)
    setPendingLeaveInfo({ isHost: true, displayName: myDisplayName || 'Host' })
    
    // Show consent modal before ending
    setEndedTripCode(trip.tripCode)
    setShowConsentModal(true)
  }, [trip, calculateTripStats, myDisplayName])
  
  const handleLeaveTrip = useCallback(async () => {
    if (!trip) return
    
    // Calculate and store stats before showing consent modal
    const stats = calculateTripStats()
    setTripStats(stats)
    
    // Get display name from myRider or fall back to stored myDisplayName
    const displayName = myRider?.displayName || myDisplayName || 'Rider'
    
    // Store info needed for consent callback (member leaving trip)
    setPendingLeaveInfo({ isHost: false, displayName })
    
    // Show consent modal before leaving
    setEndedTripCode(trip.tripCode)
    setShowConsentModal(true)
  }, [trip, myRider, myDisplayName, calculateTripStats])
  
  const handleConsentSubmit = useCallback(async (consent: boolean, _shareStats: boolean) => {
    if (!endedTripCode || !pendingLeaveInfo) return
    
    try {
      // Record consent decision
      await fetch(`${API_URL}/api/trips/${endedTripCode}/consent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          riderId: DEVICE_ID,
          displayName: pendingLeaveInfo.displayName,
          consent,
          tripStartedAt: tripStartTimeRef.current?.toISOString(),
        }),
      })
    } catch (err) {
      console.error('Error recording consent:', err)
    }
    
    setConsentGiven(consent)
    setShowConsentModal(false)
    
    // Now actually end/leave the trip
    try {
      if (pendingLeaveInfo.isHost) {
        const response = await fetch(`${API_URL}/api/trips/${endedTripCode}/end`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hostId: DEVICE_ID }),
        })
        
        if (response.ok) {
          // Pass tripCode explicitly to ensure WebSocket event is emitted
          endTrip(endedTripCode)
        }
      } else {
        const response = await fetch(`${API_URL}/api/trips/${endedTripCode}/leave`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ riderId: DEVICE_ID }),
        })
        
        if (response.ok) {
          // Pass tripCode explicitly to ensure WebSocket event is emitted
          leaveTrip(pendingLeaveInfo.displayName, endedTripCode)
        }
      }
      
      setTrip(null)
      setView('home')
      setShowDeletionModal(true)
      setPendingLeaveInfo(null)
      
      // Show trip summary after deletion modal
      setTimeout(() => {
        setShowDeletionModal(false)
        setShowTripSummary(true)
      }, 2000)
      
      // Rotate device ID for privacy (Story 8.9)
      // This prevents cross-trip tracking while allowing the current session to complete
      DEVICE_ID = rotateDeviceId()
    } catch (err) {
      console.error('Error ending/leaving trip:', err)
    }
  }, [endedTripCode, pendingLeaveInfo, endTrip, leaveTrip])
  
  const handleCloseTripSummary = useCallback(() => {
    setShowTripSummary(false)
    setTripStats(null)
    setEndedTripCode(null)
    setConsentGiven(null)
    setPendingLeaveInfo(null)
    // Clear location history
    locationHistoryRef.current = []
    otherRiderLocationsRef.current = new Map()
  }, [])
  
  const handleShareTrip = useCallback(() => {
    if (!tripStats) return
    setShowShareModal(true)
  }, [tripStats])
  
  const handleSaveReplayFromSummary = useCallback(async () => {
    if (!endedTripCode) return
    // Trigger the consent flow for saving replay
    try {
      await fetch(`${API_URL}/api/trips/${endedTripCode}/consent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          riderId: DEVICE_ID,
          displayName: myDisplayName,
          consent: true,
          tripStartedAt: tripStartTimeRef.current?.toISOString(),
          locationHistory: locationHistoryRef.current,
        }),
      })
      setConsentGiven(true)
      showToast('Trip replay saved for 7 days!', 3000)
    } catch (err) {
      console.error('Error saving replay:', err)
      showToast('Failed to save replay', 3000)
    }
  }, [endedTripCode, myDisplayName, showToast])

  const createTrip = async () => {
    const hostName = displayName.trim().replace(/<[^>]*>/g, '') || 'Host'
    
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/api/trips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostId: DEVICE_ID, displayName: hostName }),
      })

      if (!response.ok) {
        throw new Error('Failed to create trip')
      }

      const data = await response.json()
      setMyDisplayName(hostName)
      setTrip(data)
      tripStartTimeRef.current = new Date()
      setView('trip')
      setDisplayName('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create trip')
    } finally {
      setLoading(false)
    }
  }

  const joinTrip = async () => {
    if (joinCode.length !== 6) return

    setLoading(true)
    setError(null)

    try {
      const sanitizedName = displayName.trim().replace(/<[^>]*>/g, '') || 'Rider'
      
      const response = await fetch(`${API_URL}/api/trips/${joinCode}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          riderId: DEVICE_ID,
          displayName: sanitizedName
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to join trip')
      }

      const tripResponse = await fetch(`${API_URL}/api/trips/${joinCode}`)
      const tripData = await tripResponse.json()
      
      setMyDisplayName(sanitizedName)
      setTrip(tripData)
      tripStartTimeRef.current = new Date()
      setView('trip')
      setJoinCode('')
      setDisplayName('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join trip')
      setJoinCode('')
    } finally {
      setLoading(false)
    }
  }

  // Create View
  if (view === 'create') {
    return (
      <div className="min-h-screen bg-surface flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b border-[var(--border)]">
          <div className="flex justify-between items-center max-w-md mx-auto">
            <button
              onClick={() => { setView('home'); setError(null); setDisplayName('') }}
              className="w-10 h-10 rounded-xl bg-surface-secondary flex items-center justify-center"
            >
              ←
            </button>
            <h2 className="text-xl font-bold">Create Trip</h2>
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-xl bg-surface-secondary flex items-center justify-center"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md space-y-6">
            {error && (
              <div className="bg-danger/10 text-danger p-4 rounded-2xl text-center border border-danger/20">
                {error}
              </div>
            )}

            <div className="card p-6 space-y-6">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">🏍️</div>
                <p className="text-content-secondary">You're the trip host</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-content-secondary mb-2">Your Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value.slice(0, 30))}
                  placeholder="Enter your name"
                  maxLength={30}
                  autoFocus
                  className="input h-14"
                />
                <p className="text-xs text-content-muted mt-2">This name will be visible to all riders</p>
              </div>
            </div>

            <button
              onClick={createTrip}
              disabled={loading}
              className="w-full h-16 btn btn-primary text-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span> Creating...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>🚀</span> Start Trip
                </span>
              )}
            </button>

            <p className="text-xs text-content-muted text-center">
              A unique trip code will be generated for others to join
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Join View
  if (view === 'join') {
    return (
      <div className="min-h-screen bg-surface flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b border-[var(--border)]">
          <div className="flex justify-between items-center max-w-md mx-auto">
            <button
              onClick={() => { setView('home'); setError(null); setJoinCode(''); setDisplayName('') }}
              className="w-10 h-10 rounded-xl bg-surface-secondary flex items-center justify-center"
            >
              ←
            </button>
            <h2 className="text-xl font-bold">Join Trip</h2>
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-xl bg-surface-secondary flex items-center justify-center"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md space-y-6">
            {error && (
              <div className="bg-danger/10 text-danger p-4 rounded-2xl text-center border border-danger/20">
                {error}
              </div>
            )}

            <div className="card p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-content-secondary mb-2">Trip Code</label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="XXXXXX"
                  maxLength={6}
                  className="input text-2xl text-center font-mono uppercase tracking-widest h-16"
                />
              </div>

              {joinCode.length === 6 && (
                <div>
                  <label className="block text-sm font-medium text-content-secondary mb-2">Your Name (optional)</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value.slice(0, 30))}
                    placeholder="Enter your name"
                    maxLength={30}
                    className="input h-14"
                  />
                </div>
              )}
            </div>

            <button
              onClick={joinTrip}
              disabled={loading || joinCode.length !== 6}
              className="w-full h-16 btn btn-primary text-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span> Joining...
                </span>
              ) : (
                'Join Trip'
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Trip View
  if (view === 'trip' && trip) {
    return (
      <div className="h-screen bg-surface flex flex-col overflow-hidden">
        {/* Connection Status Banner */}
        <ConnectionStatusBanner onRetry={retryConnection} />
        
        {/* Header */}
        <div className="flex-shrink-0 bg-surface-elevated p-4 border-b border-[var(--border)]">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                {isHost && <span className="text-lg">👑</span>}
                <h2 className="text-xl font-bold">{trip.tripCode}</h2>
              </div>
              <p className="text-sm text-content-secondary">{trip.riders.length} rider{trip.riders.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Status indicators */}
              <div className="text-right text-xs space-y-0.5">
                <div className={`flex items-center justify-end gap-1 ${wsConnected ? 'text-success' : 'text-warning'}`}>
                  <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-success' : 'bg-warning animate-pulse'}`}></span>
                  {wsConnected ? 'Connected' : 'Connecting...'}
                </div>
                {gps.position && (
                  <div className="text-success flex items-center justify-end gap-1">
                    <span className="w-2 h-2 rounded-full bg-success"></span>
                    GPS ±{gps.position.accuracy?.toFixed(0)}m
                  </div>
                )}
                {gps.loading && !gps.position && (
                  <div className="text-warning">📡 Finding GPS...</div>
                )}
              </div>
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="w-10 h-10 rounded-xl bg-surface-secondary flex items-center justify-center"
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
              {/* Settings Button */}
              <button
                onClick={() => setShowTripSettings(true)}
                className="w-10 h-10 rounded-xl bg-surface-secondary flex items-center justify-center"
              >
                ⚙️
              </button>
            </div>
          </div>
        </div>

        {/* Map View */}
        <div className="flex-1 min-h-0 relative">
          <MapView
            userPosition={gps.position}
            deviceId={DEVICE_ID}
            riders={trip.riders}
          />
        </div>

        {/* Bottom Status Bar */}
        <div className="flex-shrink-0">
          <BottomStatusBar
            userPosition={gps.position}
            otherLocations={otherLocations}
            riderCount={trip.riders.length}
            onMembersClick={() => setShowMemberList(true)}
            isOffline={!isOnline || !wsConnected}
          />
        </div>

        {/* Member List Sheet */}
        <MemberListSheet
          isOpen={showMemberList}
          onClose={() => setShowMemberList(false)}
          riders={trip.riders}
          locations={locations}
          userPosition={gps.position}
          deviceId={DEVICE_ID}
        />
        
        {/* SOS Button - disabled when offline */}
        {isOnline && wsConnected ? (
          <SOSButton
            onSOS={handleSOS}
            isActive={mySOSActive}
            onCancel={handleCancelSOS}
          />
        ) : (
          <button
            onClick={() => showToast('SOS requires network connection', 3000)}
            className="fixed bottom-24 left-4 z-20 w-20 h-20 rounded-full bg-gray-400 text-white font-bold text-sm shadow-lg opacity-50 cursor-not-allowed"
          >
            SOS
          </button>
        )}
        
        {/* Status Button - disabled when offline */}
        <button
          onClick={() => {
            if (isOnline && wsConnected) {
              setShowStatusSheet(true)
            } else {
              showToast('Status updates require network connection', 3000)
            }
          }}
          className={`fixed bottom-24 right-4 z-20 w-16 h-16 rounded-full text-white font-bold shadow-glow flex items-center justify-center transition-transform ${
            isOnline && wsConnected 
              ? 'bg-brand-500 active:scale-95' 
              : 'bg-gray-400 opacity-50 cursor-not-allowed'
          }`}
        >
          <span className="text-2xl">📢</span>
        </button>
        
        {/* Status Sheet */}
        <StatusSheet
          isOpen={showStatusSheet}
          onClose={() => setShowStatusSheet(false)}
          onSendStatus={handleSendStatus}
        />
        
        {/* Status Toast */}
        {statusToast && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-surface-elevated border border-[var(--border)] px-6 py-3 rounded-2xl shadow-soft max-w-sm text-center animate-fade-in">
            <p className="font-medium">📢 {statusToast}</p>
          </div>
        )}
        
        {/* Trip Settings */}
        <TripSettings
          isOpen={showTripSettings}
          onClose={() => setShowTripSettings(false)}
          tripCode={trip.tripCode}
          isHost={isHost}
          onEndTrip={handleEndTrip}
          onLeaveTrip={handleLeaveTrip}
          onOpenPrivacy={() => setShowPrivacySettings(true)}
        />
        
        {/* Privacy Settings */}
        <PrivacySettings
          isOpen={showPrivacySettings}
          onClose={() => setShowPrivacySettings(false)}
          deviceId={DEVICE_ID}
          onOpenTripHistory={() => {
            setShowPrivacySettings(false)
            setShowTripHistory(true)
          }}
        />
        
        {/* Trip History */}
        <TripHistory
          isOpen={showTripHistory}
          onClose={() => setShowTripHistory(false)}
          deviceId={DEVICE_ID}
        />
        
        {/* SOS Alert */}
        {pendingAlert && pendingAlert.riderId !== DEVICE_ID && (
          <SOSAlert
            senderName={pendingAlert.displayName}
            senderCoordinates={pendingAlert.coordinates}
            distance={sosDistance}
            onViewOnMap={() => {
              clearPendingAlert()
            }}
            onDismiss={clearPendingAlert}
          />
        )}
        
        <ConsentModal
          isOpen={showConsentModal}
          tripCode={endedTripCode || trip.tripCode}
          onConsent={handleConsentSubmit}
          onClose={() => setShowConsentModal(false)}
        />
      </div>
    )
  }

  // Home View
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4">
        <div className="flex justify-end">
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-xl bg-surface-secondary flex items-center justify-center"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center space-y-8 w-full max-w-md">
          {/* Logo */}
          <div className="space-y-2">
            <div className="text-6xl">🏍️</div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-brand-500 to-brand-600 bg-clip-text text-transparent">
              SyncRide
            </h1>
            <p className="text-content-secondary">Real-Time Group Coordination</p>
          </div>

          {tripEndedMessage && (
            <div className="card p-4 text-center">
              <p className="text-content-secondary">{tripEndedMessage}</p>
              <button
                onClick={() => setTripEndedMessage(null)}
                className="mt-2 text-brand-500 text-sm font-medium"
              >
                Dismiss
              </button>
            </div>
          )}

          {error && (
            <div className="bg-danger/10 text-danger p-4 rounded-2xl text-center border border-danger/20">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={() => setView('create')}
              disabled={loading}
              className="w-full h-16 btn btn-primary text-lg"
            >
              <span className="flex items-center justify-center gap-2">
                <span>🚀</span> Create Trip
              </span>
            </button>

            <button
              onClick={() => setView('join')}
              className="w-full h-16 btn btn-secondary text-lg border border-[var(--border)]"
            >
              <span className="flex items-center justify-center gap-2">
                <span>🔗</span> Join Trip
              </span>
            </button>
          </div>

          <p className="text-xs text-content-muted">
            Track your riding group in real-time
          </p>
          
          {/* Privacy Settings Link */}
          <button
            onClick={() => setShowPrivacySettings(true)}
            className="text-xs text-brand-500 underline mt-2"
          >
            Your Data Rights & Privacy
          </button>
        </div>
      </div>
      
      {/* Privacy Settings Modal - accessible from home */}
      <PrivacySettings
        isOpen={showPrivacySettings}
        onClose={() => setShowPrivacySettings(false)}
        deviceId={DEVICE_ID}
        onOpenTripHistory={() => {
          setShowPrivacySettings(false)
          setShowTripHistory(true)
        }}
      />
      
      {/* Trip History Modal - accessible from privacy settings */}
      <TripHistory
        isOpen={showTripHistory}
        onClose={() => setShowTripHistory(false)}
        deviceId={DEVICE_ID}
      />
      
      {/* Consent Modal - shown when trip ends */}
      <ConsentModal
        isOpen={showConsentModal}
        tripCode={endedTripCode || ''}
        onConsent={handleConsentSubmit}
        onClose={() => setShowConsentModal(false)}
      />
      
      {/* Data Deletion Confirmation - shown after consent */}
      <DataDeletionModal
        isOpen={showDeletionModal}
        consentGiven={consentGiven}
        onClose={() => {
          setShowDeletionModal(false)
        }}
      />
      
      {/* Trip Summary - shown after trip ends */}
      <TripSummary
        isOpen={showTripSummary}
        onClose={handleCloseTripSummary}
        stats={tripStats}
        onShareTrip={handleShareTrip}
        onSaveReplay={handleSaveReplayFromSummary}
        replayAlreadySaved={consentGiven === true}
        onShowAttribution={() => setShowAttributionSurvey(true)}
        onExportSummary={() => setShowExportModal(true)}
      />
      
      {/* Export Summary Modal */}
      <ExportSummaryModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        stats={tripStats}
      />
      
      {/* Attribution Survey - shown once per device */}
      <AttributionSurvey
        isOpen={showAttributionSurvey}
        onClose={() => setShowAttributionSurvey(false)}
        deviceId={DEVICE_ID}
        tripCode={endedTripCode || undefined}
      />
      
      {/* Share Trip Modal */}
      <ShareTripModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        stats={tripStats}
        replayEnabled={consentGiven === true}
      />
    </div>
  )
}

export default App
