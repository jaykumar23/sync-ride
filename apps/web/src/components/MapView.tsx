import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useLocationStore } from '../store/locationStore'
import { useTheme } from '../context/ThemeContext'
import { Coordinates } from 'shared-types'

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as { _getIconUrl?: () => string })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface MapViewProps {
  userPosition: Coordinates | null
  deviceId: string
  riders: Array<{ riderId: string; displayName: string; isHost: boolean }>
}

// Map tile options
const MAP_TILES = {
  light: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>'
  }
}

// Custom marker icons
const createUserIcon = () => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 28px;
        height: 28px;
        background: #3B82F6;
        border: 4px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 10px rgba(59,130,246,0.5);
      ">
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 10px;
          height: 10px;
          background: white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })
}

const createRiderIcon = (
  displayName: string, 
  isLive: boolean, 
  isStale: boolean, 
  isHost: boolean,
  lastSeenMinutes?: number
) => {
  const initial = displayName.charAt(0).toUpperCase()
  const bgColor = isLive ? '#22C55E' : isStale ? '#EAB308' : '#EF4444'
  const hostBadge = isHost ? '👑' : ''
  const isDisconnected = !isLive && !isStale
  const opacity = isDisconnected ? '0.5' : '1'
  
  // Show "last seen" label for disconnected riders
  const lastSeenLabel = isDisconnected && lastSeenMinutes !== undefined
    ? `<div style="
        position: absolute;
        bottom: -20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(239, 68, 68, 0.9);
        color: white;
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 8px;
        white-space: nowrap;
        font-family: system-ui, -apple-system, sans-serif;
      ">${lastSeenMinutes}m ago</div>`
    : ''
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        position: relative;
        width: 40px;
        height: 60px;
        opacity: ${opacity};
      ">
        <div style="
          width: 40px;
          height: 40px;
          background: ${bgColor};
          border: 4px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 10px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: white;
          font-size: 18px;
          font-family: system-ui, -apple-system, sans-serif;
        ">${initial}</div>
        ${hostBadge ? `<span style="position: absolute; top: -10px; right: -6px; font-size: 14px;">${hostBadge}</span>` : ''}
        ${lastSeenLabel}
      </div>
    `,
    iconSize: [40, 60],
    iconAnchor: [20, 20],
  })
}

// Component to handle map view changes
function MapController({ center, recenterTrigger }: { center: [number, number] | null; recenterTrigger: number }) {
  const map = useMap()
  const hasInitialized = useRef(false)
  
  useEffect(() => {
    if (center && !hasInitialized.current) {
      map.setView(center, 16)
      hasInitialized.current = true
    }
  }, [center, map])
  
  useEffect(() => {
    if (center && recenterTrigger > 0) {
      map.setView(center, 16, { animate: true })
    }
  }, [center, recenterTrigger, map])
  
  // Force map to refresh size after mount
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize()
    }, 100)
  }, [map])
  
  return null
}

export function MapView({ userPosition, deviceId, riders }: MapViewProps) {
  const locations = useLocationStore((state) => state.locations)
  const { theme } = useTheme()
  const [recenterTrigger, setRecenterTrigger] = useState(0)
  
  const otherLocations = Object.values(locations).filter(
    (loc) => loc.riderId !== deviceId
  )
  
  const defaultCenter: [number, number] = userPosition 
    ? [userPosition.latitude, userPosition.longitude]
    : [19.0760, 72.8777] // Mumbai default

  const currentTiles = MAP_TILES[theme]
  
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      <MapContainer
        center={defaultCenter}
        zoom={16}
        scrollWheelZoom={true}
        zoomControl={false}
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: theme === 'dark' ? '#1a1a1a' : '#e5e5e5'
        }}
      >
        <TileLayer
          key={theme}
          attribution={currentTiles.attribution}
          url={currentTiles.url}
        />
        
        <MapController 
          center={userPosition ? [userPosition.latitude, userPosition.longitude] : null}
          recenterTrigger={recenterTrigger}
        />
        
        {/* User's current position */}
        {userPosition && (
          <>
            {/* Accuracy circle */}
            <Circle
              center={[userPosition.latitude, userPosition.longitude]}
              radius={userPosition.accuracy || 50}
              pathOptions={{
                color: '#3B82F6',
                fillColor: '#3B82F6',
                fillOpacity: 0.15,
                weight: 2,
              }}
            />
            
            {/* User marker */}
            <Marker
              position={[userPosition.latitude, userPosition.longitude]}
              icon={createUserIcon()}
            >
              <Popup>
                <div style={{ textAlign: 'center', padding: '4px' }}>
                  <strong style={{ fontSize: '14px' }}>You</strong>
                  <br />
                  <span style={{ fontSize: '11px', color: '#666' }}>
                    ±{userPosition.accuracy?.toFixed(0)}m accuracy
                  </span>
                </div>
              </Popup>
            </Marker>
          </>
        )}
        
        {/* Other riders */}
        {otherLocations.map((location) => {
          const rider = riders.find((r) => r.riderId === location.riderId)
          // Prioritize displayName from location broadcast, fallback to rider list
          const displayName = location.displayName || rider?.displayName || 'Unknown'
          const isHost = rider?.isHost || false
          
          // Calculate last seen minutes for disconnected riders
          const lastSeenMinutes = location.isDisconnected && location.lastUpdate
            ? Math.round((Date.now() - new Date(location.lastUpdate).getTime()) / 60000)
            : undefined
          
          return (
            <Marker
              key={location.riderId}
              position={[location.coordinates.latitude, location.coordinates.longitude]}
              icon={createRiderIcon(displayName, location.isLive, location.isStale, isHost, lastSeenMinutes)}
            >
              <Popup>
                <div style={{ textAlign: 'center', padding: '4px' }}>
                  <strong style={{ fontSize: '14px' }}>{isHost ? '👑 ' : ''}{displayName}</strong>
                  <br />
                  {location.isDisconnected && lastSeenMinutes !== undefined && (
                    <>
                      <span style={{ fontSize: '11px', color: '#EF4444' }}>
                        Last seen {lastSeenMinutes}m ago
                      </span>
                      <br />
                    </>
                  )}
                  <span style={{ 
                    fontSize: '12px',
                    color: location.isLive ? '#22C55E' : location.isStale ? '#EAB308' : '#EF4444'
                  }}>
                    {location.isLive ? '● Live' : location.isStale ? '● Stale' : '● Offline'}
                  </span>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
      
      
      {/* Recenter button */}
      {userPosition && (
        <button
          onClick={() => setRecenterTrigger(prev => prev + 1)}
          className="absolute bottom-4 right-4 z-[1000] w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-primary"
          title="Center on my location"
        >
          <span className="text-xl">📍</span>
        </button>
      )}
      
      {/* Loading indicator when no position */}
      {!userPosition && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-[500]">
          <div className="bg-white rounded-lg p-4 shadow-lg text-center">
            <div className="text-2xl mb-2">📡</div>
            <p className="text-gray-700 font-medium">Acquiring GPS...</p>
            <p className="text-gray-500 text-sm">Please enable location access</p>
          </div>
        </div>
      )}
    </div>
  )
}
