import { useMemo } from 'react'
import { Coordinates } from 'shared-types'
import { calculateDistance, formatDistance, getDistanceColor, getDistanceLabel } from '../utils/distance'

interface RiderLocation {
  riderId: string
  displayName?: string
  coordinates: Coordinates
  isLive: boolean
  isStale: boolean
  isDisconnected: boolean
}

interface BottomStatusBarProps {
  userPosition: Coordinates | null
  otherLocations: RiderLocation[]
  riderCount: number
  onMembersClick: () => void
  isOffline?: boolean
}

export function BottomStatusBar({ 
  userPosition, 
  otherLocations, 
  riderCount,
  onMembersClick,
  isOffline = false
}: BottomStatusBarProps) {
  
  const nearestRider = useMemo(() => {
    if (!userPosition || otherLocations.length === 0) return null
    
    let nearest: { rider: RiderLocation; distance: number } | null = null
    
    for (const location of otherLocations) {
      if (!location.isLive && !location.isStale) continue
      
      const distance = calculateDistance(
        userPosition.latitude,
        userPosition.longitude,
        location.coordinates.latitude,
        location.coordinates.longitude
      )
      
      if (!nearest || distance < nearest.distance) {
        nearest = { rider: location, distance }
      }
    }
    
    return nearest
  }, [userPosition, otherLocations])

  const groupSpread = useMemo(() => {
    if (!userPosition || otherLocations.length === 0) return null
    
    const allPositions = [
      { lat: userPosition.latitude, lon: userPosition.longitude },
      ...otherLocations
        .filter((l) => l.isLive || l.isStale)
        .map((l) => ({ lat: l.coordinates.latitude, lon: l.coordinates.longitude }))
    ]
    
    if (allPositions.length < 2) return null
    
    let maxDistance = 0
    
    for (let i = 0; i < allPositions.length; i++) {
      for (let j = i + 1; j < allPositions.length; j++) {
        const distance = calculateDistance(
          allPositions[i].lat,
          allPositions[i].lon,
          allPositions[j].lat,
          allPositions[j].lon
        )
        if (distance > maxDistance) {
          maxDistance = distance
        }
      }
    }
    
    return maxDistance
  }, [userPosition, otherLocations])

  const liveCount = otherLocations.filter((l) => l.isLive).length

  return (
    <div 
      className="bg-surface-elevated border-t border-[var(--border)] p-4 cursor-pointer active:bg-surface-secondary transition-colors"
      onClick={onMembersClick}
    >
      <div className="flex justify-between items-center">
        {/* Nearest Rider */}
        <div className="flex-1">
          {isOffline ? (
            <div>
              <p className="text-xs text-content-muted mb-0.5">Nearest Rider</p>
              <p className="text-xl font-bold text-content-muted">—</p>
              <p className="text-xs text-content-muted">Offline</p>
            </div>
          ) : nearestRider ? (
            <div>
              <p className="text-xs text-content-muted mb-0.5">Nearest Rider</p>
              <p className={`text-xl font-bold ${getDistanceColor(nearestRider.distance)}`}>
                {formatDistance(nearestRider.distance)}
              </p>
              <p className="text-xs text-content-secondary truncate max-w-[80px]">
                {nearestRider.rider.displayName || 'Unknown'}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-xs text-content-muted mb-0.5">Nearest Rider</p>
              <p className="text-sm text-content-muted">No riders nearby</p>
            </div>
          )}
        </div>

        {/* Group Spread */}
        <div className="flex-1 text-center">
          {isOffline ? (
            <div>
              <p className="text-xs text-content-muted mb-0.5">Group Spread</p>
              <p className="text-xl font-bold text-content-muted">—</p>
              <p className="text-xs text-content-muted">Offline</p>
            </div>
          ) : groupSpread !== null ? (
            <div>
              <p className="text-xs text-content-muted mb-0.5">Group Spread</p>
              <p className={`text-xl font-bold ${getDistanceColor(groupSpread)}`}>
                ⟷ {formatDistance(groupSpread)}
              </p>
              <p className="text-xs text-content-secondary">
                {getDistanceLabel(groupSpread)}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-xs text-content-muted mb-0.5">Group Spread</p>
              <p className="text-sm text-content-muted">—</p>
            </div>
          )}
        </div>

        {/* Rider Count */}
        <div className="flex-1 text-right">
          <p className="text-xs text-content-muted mb-0.5">Riders</p>
          <p className="text-xl font-bold">
            {riderCount}
          </p>
          <p className={`text-xs ${isOffline ? 'text-content-muted' : 'text-success'}`}>
            {isOffline ? 'Offline' : `${liveCount} live`}
          </p>
        </div>
      </div>
      
      <p className="text-xs text-center text-content-muted mt-3">
        Tap for member list
      </p>
    </div>
  )
}
