// Haversine formula to calculate distance between two GPS coordinates
// Returns distance in meters

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000 // Earth's radius in meters
  
  const toRad = (deg: number) => (deg * Math.PI) / 180
  
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  
  return R * c // Distance in meters
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`
  }
  return `${(meters / 1000).toFixed(1)}km`
}

export function getDistanceColor(meters: number): string {
  if (meters < 500) return 'text-green-500' // Tight group
  if (meters < 2000) return 'text-yellow-500' // Moderate spread
  if (meters < 5000) return 'text-orange-500' // Wide spread
  return 'text-red-500' // Separated
}

export function getDistanceLabel(meters: number): string {
  if (meters < 500) return 'Tight'
  if (meters < 2000) return 'Moderate'
  if (meters < 5000) return 'Wide'
  return 'Separated'
}
