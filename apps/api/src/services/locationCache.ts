import { redis } from '../cache';
import { Coordinates } from 'shared-types';

const LOCATION_TTL_SECONDS = 30;
const LOCATION_KEY_PREFIX = 'location';

interface CachedLocation {
  riderId: string;
  displayName: string;
  coordinates: Coordinates;
  timestamp: string;
}

/**
 * Cache a rider's location with automatic TTL expiration
 * Key format: location:{tripCode}:{riderId}
 */
export async function cacheLocation(
  tripCode: string,
  riderId: string,
  displayName: string,
  coordinates: Coordinates
): Promise<void> {
  const key = `${LOCATION_KEY_PREFIX}:${tripCode}:${riderId}`;
  const data: CachedLocation = {
    riderId,
    displayName,
    coordinates,
    timestamp: new Date().toISOString(),
  };

  try {
    await redis.setex(key, LOCATION_TTL_SECONDS, JSON.stringify(data));
  } catch (error) {
    console.warn(`⚠️ Failed to cache location for ${riderId}:`, error);
  }
}

/**
 * Get all cached locations for a trip
 * Used for late-joining riders to get current positions
 */
export async function getTripLocations(tripCode: string): Promise<CachedLocation[]> {
  const pattern = `${LOCATION_KEY_PREFIX}:${tripCode}:*`;
  const locations: CachedLocation[] = [];

  try {
    const keys = await redis.keys(pattern);
    if (keys.length === 0) return locations;

    const values = await redis.mget(...keys);
    for (const value of values) {
      if (value) {
        try {
          locations.push(JSON.parse(value));
        } catch {
          // Skip invalid JSON
        }
      }
    }
  } catch (error) {
    console.warn(`⚠️ Failed to get trip locations:`, error);
  }

  return locations;
}

/**
 * Delete all location data for a trip (called on trip end)
 * Returns true if deletion was successful or no keys existed
 */
export async function deleteAllTripLocations(tripCode: string): Promise<boolean> {
  const pattern = `${LOCATION_KEY_PREFIX}:${tripCode}:*`;

  try {
    const keys = await redis.keys(pattern);
    
    if (keys.length === 0) {
      console.log(`✅ No location keys to delete for trip ${tripCode}`);
      return true;
    }

    const deleted = await redis.del(...keys);
    console.log(`✅ Deleted ${deleted}/${keys.length} location keys for trip ${tripCode}`);

    // Verification check
    const remainingKeys = await redis.keys(pattern);
    if (remainingKeys.length > 0) {
      console.error(`❌ Location deletion verification failed: ${remainingKeys.length} keys remain for trip ${tripCode}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`❌ Failed to delete location data for trip ${tripCode}:`, error);
    return false;
  }
}

/**
 * Delete location data for a specific rider (called when rider leaves)
 */
export async function deleteRiderLocation(tripCode: string, riderId: string): Promise<void> {
  const key = `${LOCATION_KEY_PREFIX}:${tripCode}:${riderId}`;

  try {
    await redis.del(key);
    console.log(`✅ Deleted location for rider ${riderId} in trip ${tripCode}`);
  } catch (error) {
    console.warn(`⚠️ Failed to delete rider location:`, error);
  }
}

/**
 * Get the TTL remaining for a rider's location key
 * Returns -2 if key doesn't exist, -1 if no TTL, or seconds remaining
 */
export async function getLocationTTL(tripCode: string, riderId: string): Promise<number> {
  const key = `${LOCATION_KEY_PREFIX}:${tripCode}:${riderId}`;
  
  try {
    return await redis.ttl(key);
  } catch {
    return -2;
  }
}
