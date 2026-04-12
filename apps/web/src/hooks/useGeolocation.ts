import { useState, useEffect } from 'react'
import { Coordinates } from 'shared-types'

interface GeolocationState {
  position: Coordinates | null
  error: string | null
  loading: boolean
}

export function useGeolocation(active: boolean = false) {
  const [state, setState] = useState<GeolocationState>({
    position: null,
    error: null,
    loading: false,
  })

  useEffect(() => {
    if (!active) {
      setState({ position: null, error: null, loading: false })
      return
    }

    if (!navigator.geolocation) {
      setState({ position: null, error: 'Geolocation not supported', loading: false })
      return
    }

    setState({ position: null, error: null, loading: true })

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const coordinates: Coordinates = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          heading: pos.coords.heading || undefined,
          speed: pos.coords.speed || undefined,
          timestamp: new Date(pos.timestamp),
        }

        setState({ position: coordinates, error: null, loading: false })
      },
      (err) => {
        let errorMsg = 'GPS unavailable'
        if (err.code === 1) errorMsg = 'Location permission denied'
        if (err.code === 2) errorMsg = 'Location unavailable'
        if (err.code === 3) errorMsg = 'Location timeout'

        setState({ position: null, error: errorMsg, loading: false })
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      }
    )

    return () => {
      navigator.geolocation.clearWatch(watchId)
    }
  }, [active])

  return state
}
