import { useMemo } from 'react'
import { Coordinates } from 'shared-types'
import { calculateDistance, formatDistance, getDistanceColor } from '../utils/distance'

interface RiderLocation {
  riderId: string
  displayName?: string
  coordinates: Coordinates
  lastUpdate: Date
  isLive: boolean
  isStale: boolean
  isDisconnected: boolean
}

interface Rider {
  riderId: string
  displayName: string
  isHost: boolean
}

interface MemberListSheetProps {
  isOpen: boolean
  onClose: () => void
  riders: Rider[]
  locations: Record<string, RiderLocation>
  userPosition: Coordinates | null
  deviceId: string
}

export function MemberListSheet({
  isOpen,
  onClose,
  riders,
  locations,
  userPosition,
  deviceId
}: MemberListSheetProps) {
  
  // Sort riders: host first, then by distance (nearest first)
  const sortedRiders = useMemo(() => {
    return [...riders].sort((a, b) => {
      // Host always first
      if (a.isHost && !b.isHost) return -1
      if (!a.isHost && b.isHost) return 1
      
      // Then by online status
      const locA = locations[a.riderId]
      const locB = locations[b.riderId]
      
      const onlineA = locA?.isLive || locA?.isStale
      const onlineB = locB?.isLive || locB?.isStale
      
      if (onlineA && !onlineB) return -1
      if (!onlineA && onlineB) return 1
      
      // Then by distance
      if (userPosition && locA && locB) {
        const distA = calculateDistance(
          userPosition.latitude, userPosition.longitude,
          locA.coordinates.latitude, locA.coordinates.longitude
        )
        const distB = calculateDistance(
          userPosition.latitude, userPosition.longitude,
          locB.coordinates.latitude, locB.coordinates.longitude
        )
        return distA - distB
      }
      
      return 0
    })
  }, [riders, locations, userPosition])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Sheet */}
      <div 
        className="absolute bottom-0 left-0 right-0 bg-map-overlay rounded-t-2xl max-h-[70vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="w-12 h-1 bg-glance-text/30 rounded-full" />
        </div>
        
        {/* Header */}
        <div className="px-4 pb-3 border-b border-primary/20">
          <h2 className="text-xl font-bold text-glance-text">
            Members ({riders.length})
          </h2>
        </div>
        
        {/* List */}
        <div className="overflow-y-auto max-h-[calc(70vh-80px)]">
          {sortedRiders.map((rider) => {
            const location = locations[rider.riderId]
            const isMe = rider.riderId === deviceId
            // Use displayName from location if available, fallback to rider list
            const displayName = location?.displayName || rider.displayName || 'Unknown'
            
            let distance: number | null = null
            if (userPosition && location && !isMe) {
              distance = calculateDistance(
                userPosition.latitude, userPosition.longitude,
                location.coordinates.latitude, location.coordinates.longitude
              )
            }
            
            // For current user, always show as Online (they're connected if viewing this)
            // For others, check location status
            const statusColor = isMe 
              ? 'bg-green-500'
              : location?.isLive 
                ? 'bg-green-500' 
                : location?.isStale 
                  ? 'bg-yellow-500' 
                  : 'bg-red-500'
            
            const statusText = isMe
              ? 'Online'
              : location?.isLive 
                ? 'Online' 
                : location?.isStale 
                  ? 'Stale' 
                  : location?.isDisconnected 
                    ? 'Offline' 
                    : 'Waiting...'

            const lastSeenText = !isMe && location?.isDisconnected && location?.lastUpdate
              ? `Last seen ${Math.round((Date.now() - new Date(location.lastUpdate).getTime()) / 60000)}m ago`
              : null

            return (
              <div
                key={rider.riderId}
                className="flex items-center px-4 py-4 border-b border-primary/10 h-20 hover:bg-primary/10 transition-colors"
              >
                {/* Avatar with status ring */}
                <div className="relative mr-4">
                  <div className={`w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg border-2 ${statusColor.replace('bg-', 'border-')}`}>
                    {displayName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${statusColor} rounded-full border-2 border-map-overlay`} />
                </div>
                
                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-glance-text">
                      {displayName}
                    </span>
                    {rider.isHost && <span>👑</span>}
                    {isMe && <span className="text-xs text-glance-primary">(You)</span>}
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className={`${statusColor.replace('bg-', 'text-')}`}>
                      ● {statusText}
                    </span>
                    {lastSeenText && (
                      <span className="text-glance-text/50">{lastSeenText}</span>
                    )}
                  </div>
                </div>
                
                {/* Distance */}
                {distance !== null && (
                  <div className="text-right">
                    <p className={`font-bold ${getDistanceColor(distance)}`}>
                      {formatDistance(distance)}
                    </p>
                    <p className="text-xs text-glance-text/50">away</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
        
        {/* Close button */}
        <div className="p-4 border-t border-primary/20">
          <button
            onClick={onClose}
            className="w-full h-14 bg-primary hover:bg-primary/80 text-white font-bold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
