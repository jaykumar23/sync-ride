import { create } from 'zustand'
import { Coordinates } from 'shared-types'

interface RiderLocation {
  riderId: string
  displayName?: string
  coordinates: Coordinates
  lastUpdate: Date
  isLive: boolean
  isStale: boolean
  isDisconnected: boolean
}

interface LocationStore {
  locations: Record<string, RiderLocation>
  updateLocation: (riderId: string, coordinates: Coordinates, displayName?: string) => void
  removeLocation: (riderId: string) => void
  updateStatuses: () => void
}

export const useLocationStore = create<LocationStore>((set, get) => ({
  locations: {},

  updateLocation: (riderId, coordinates, displayName) => {
    if (
      coordinates.latitude < -90 || coordinates.latitude > 90 ||
      coordinates.longitude < -180 || coordinates.longitude > 180
    ) {
      console.warn(`Invalid coordinates for ${riderId}`, coordinates)
      return
    }

    const now = new Date()
    const coordTimestamp = new Date(coordinates.timestamp)
    const age = now.getTime() - coordTimestamp.getTime()

    set((state) => ({
      locations: {
        ...state.locations,
        [riderId]: {
          riderId,
          displayName,
          coordinates,
          lastUpdate: coordTimestamp,
          isLive: age < 10000,
          isStale: age >= 10000 && age < 30000,
          isDisconnected: age >= 30000,
        },
      },
    }))
  },

  removeLocation: (riderId) => {
    set((state) => {
      const { [riderId]: _, ...rest } = state.locations
      return { locations: rest }
    })
  },

  updateStatuses: () => {
    const now = new Date()
    set((state) => {
      const newLocations: Record<string, RiderLocation> = {}
      
      Object.values(state.locations).forEach((location) => {
        const age = now.getTime() - location.lastUpdate.getTime()
        newLocations[location.riderId] = {
          ...location,
          isLive: age < 10000,
          isStale: age >= 10000 && age < 30000,
          isDisconnected: age >= 30000,
        }
      })

      return { locations: newLocations }
    })
  },
}))

// Selector hooks - these are stable and won't cause re-renders
export const useOtherLocations = (excludeRiderId: string) => {
  return useLocationStore((state) => {
    const locs = Object.values(state.locations)
    return locs.filter((loc) => loc.riderId !== excludeRiderId)
  })
}
