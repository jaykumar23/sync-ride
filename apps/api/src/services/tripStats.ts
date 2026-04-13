interface Coordinate {
  latitude: number;
  longitude: number;
  speed?: number;
  timestamp?: string | Date;
}

interface LocationPoint extends Coordinate {
  riderId: string;
  displayName?: string;
}

interface PersonalStats {
  totalDistance: number;
  ridingTime: number;
  maxSpeed: number;
  avgSpeed: number;
}

interface GroupStats {
  riderCount: number;
  groupDistance: number;
  maxSeparation: number;
}

export interface TripStats {
  personal: PersonalStats;
  group: GroupStats;
  tripCode: string;
  tripStartedAt: Date;
  tripEndedAt: Date;
}

const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

export const calculateHaversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const calculatePersonalStats = (locations: Coordinate[]): PersonalStats => {
  if (!locations || locations.length < 2) {
    return {
      totalDistance: 0,
      ridingTime: 0,
      maxSpeed: 0,
      avgSpeed: 0,
    };
  }

  let totalDistance = 0;
  let maxSpeed = 0;
  const speeds: number[] = [];

  for (let i = 1; i < locations.length; i++) {
    const prev = locations[i - 1];
    const curr = locations[i];

    const distance = calculateHaversineDistance(
      prev.latitude,
      prev.longitude,
      curr.latitude,
      curr.longitude
    );
    totalDistance += distance;

    if (curr.speed !== undefined && curr.speed > 0) {
      const speedKmh = curr.speed * 3.6;
      speeds.push(speedKmh);
      if (speedKmh > maxSpeed) {
        maxSpeed = speedKmh;
      }
    }
  }

  const firstTs = locations[0].timestamp;
  const lastTs = locations[locations.length - 1].timestamp;
  const firstTimestamp = firstTs ? new Date(firstTs).getTime() : 0;
  const lastTimestamp = lastTs ? new Date(lastTs).getTime() : 0;
  const ridingTime = (lastTimestamp - firstTimestamp) / 1000 / 60;

  const avgSpeed =
    speeds.length > 0
      ? speeds.reduce((a, b) => a + b, 0) / speeds.length
      : ridingTime > 0
      ? (totalDistance / ridingTime) * 60
      : 0;

  return {
    totalDistance: Math.round(totalDistance * 10) / 10,
    ridingTime: Math.round(ridingTime),
    maxSpeed: Math.round(maxSpeed),
    avgSpeed: Math.round(avgSpeed),
  };
};

export const calculateGroupStats = (
  allRiderLocations: Map<string, LocationPoint[]>,
  riderCount: number
): GroupStats => {
  let groupDistance = 0;
  let maxSeparation = 0;

  allRiderLocations.forEach((locations) => {
    const stats = calculatePersonalStats(locations);
    if (stats.totalDistance > groupDistance) {
      groupDistance = stats.totalDistance;
    }
  });

  const riderIds = Array.from(allRiderLocations.keys());
  for (let i = 0; i < riderIds.length; i++) {
    for (let j = i + 1; j < riderIds.length; j++) {
      const locations1 = allRiderLocations.get(riderIds[i]) || [];
      const locations2 = allRiderLocations.get(riderIds[j]) || [];

      if (locations1.length > 0 && locations2.length > 0) {
        const last1 = locations1[locations1.length - 1];
        const last2 = locations2[locations2.length - 1];
        const separation = calculateHaversineDistance(
          last1.latitude,
          last1.longitude,
          last2.latitude,
          last2.longitude
        );
        if (separation > maxSeparation) {
          maxSeparation = separation;
        }
      }
    }
  }

  return {
    riderCount,
    groupDistance: Math.round(groupDistance * 10) / 10,
    maxSeparation: Math.round(maxSeparation * 10) / 10,
  };
};

export const calculateTripStats = (
  tripCode: string,
  myLocations: Coordinate[],
  allRiderLocations: Map<string, LocationPoint[]>,
  riderCount: number,
  tripStartedAt: Date,
  tripEndedAt: Date = new Date()
): TripStats => {
  return {
    personal: calculatePersonalStats(myLocations),
    group: calculateGroupStats(allRiderLocations, riderCount),
    tripCode,
    tripStartedAt,
    tripEndedAt,
  };
};
