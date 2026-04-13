import { Router } from 'express';
import { Trip } from '../models/Trip';
import { TripReplay } from '../models/TripReplay';
import { ConsentLog } from '../models/ConsentLog';
import { redis } from '../cache';
import { generateTripCode } from '../utils/tripCode';
import { Rider } from 'shared-types';
import { deleteAllTripLocations, deleteRiderLocation } from '../services/locationCache';
import crypto from 'crypto';

const hashData = (data: string): string => {
  return crypto.createHash('sha256').update(data).digest('hex').slice(0, 16);
};

const router = Router();

// POST /api/trips - Create new trip
router.post('/', async (req, res) => {
  try {
    const { hostId, displayName = 'Host' } = req.body;

    if (!hostId) {
      return res.status(400).json({ error: 'hostId is required' });
    }

    // Generate unique trip code
    const tripCode = await generateTripCode();

    // Create host rider object
    const hostRider: Rider = {
      riderId: hostId,
      displayName,
      joinedAt: new Date(),
      isHost: true,
    };

    // Create trip in MongoDB
    const trip = new Trip({
      tripCode,
      hostId,
      createdAt: new Date(),
      status: 'active',
      riders: [hostRider],
    });

    await trip.save();

    // Cache trip code in Redis with 12-hour TTL
    const ttlSeconds = 12 * 60 * 60; // 12 hours
    try {
      await redis.setex(`trip:${tripCode}`, ttlSeconds, trip._id.toString());
    } catch (redisError) {
      console.warn('Redis caching failed, continuing without cache:', redisError);
    }

    return res.status(201).json({
      tripCode: trip.tripCode,
      hostId: trip.hostId,
      createdAt: trip.createdAt,
      status: trip.status,
      riders: trip.riders,
    });
  } catch (error) {
    console.error('Error creating trip:', error);
    return res.status(500).json({ error: 'Failed to create trip' });
  }
});

// GET /api/trips/:code - Get trip by code
router.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const trip = await Trip.findOne({ tripCode: code.toUpperCase() });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    return res.json({
      tripCode: trip.tripCode,
      hostId: trip.hostId,
      createdAt: trip.createdAt,
      status: trip.status,
      riders: trip.riders,
    });
  } catch (error) {
    console.error('Error fetching trip:', error);
    return res.status(500).json({ error: 'Failed to fetch trip' });
  }
});

// POST /api/trips/:code/join - Join existing trip
router.post('/:code/join', async (req, res) => {
  try {
    const { code } = req.params;
    const { riderId, displayName } = req.body;

    if (!riderId) {
      return res.status(400).json({ error: 'riderId is required' });
    }

    const trip = await Trip.findOne({ tripCode: code.toUpperCase(), status: 'active' });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or has ended' });
    }

    // Check if rider already joined
    const existingRider = trip.riders.find(r => r.riderId === riderId);
    if (existingRider) {
      return res.status(200).json({
        message: 'Already in trip',
        tripCode: trip.tripCode,
        riders: trip.riders,
      });
    }

    // Generate display name if not provided
    const finalDisplayName = displayName?.trim() || `Rider ${trip.riders.length + 1}`;

    // Sanitize display name (remove HTML/script tags for XSS prevention)
    const sanitizedDisplayName = finalDisplayName.replace(/<[^>]*>/g, '').slice(0, 30);

    // Add new rider
    const newRider: Rider = {
      riderId,
      displayName: sanitizedDisplayName,
      joinedAt: new Date(),
      isHost: false,
    };

    trip.riders.push(newRider);
    await trip.save();

    return res.status(200).json({
      message: 'Joined trip successfully',
      tripCode: trip.tripCode,
      riders: trip.riders,
    });
  } catch (error) {
    console.error('Error joining trip:', error);
    return res.status(500).json({ error: 'Failed to join trip' });
  }
});

// POST /api/trips/:code/end - End trip (host only)
router.post('/:code/end', async (req, res) => {
  try {
    const { code } = req.params;
    const { hostId } = req.body;

    if (!hostId) {
      return res.status(400).json({ error: 'hostId is required' });
    }

    const tripCode = code.toUpperCase();
    const trip = await Trip.findOne({ tripCode, status: 'active' });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or already ended' });
    }

    // Verify host authorization
    if (trip.hostId !== hostId) {
      return res.status(403).json({ error: 'Only the host can end the trip' });
    }

    // Delete all location data BEFORE ending trip (privacy compliance)
    const locationDeletionSuccess = await deleteAllTripLocations(tripCode);
    if (!locationDeletionSuccess) {
      console.error(`⚠️ Location data deletion verification failed for trip ${tripCode}`);
    }

    // Update trip status
    trip.status = 'ended';
    trip.endedAt = new Date();
    await trip.save();

    // Remove trip code from Redis cache
    try {
      await redis.del(`trip:${tripCode}`);
    } catch (redisError) {
      console.warn('Redis trip cache deletion failed:', redisError);
    }

    return res.status(200).json({
      message: 'Trip ended successfully',
      tripCode: trip.tripCode,
      dataDeleted: locationDeletionSuccess,
    });
  } catch (error) {
    console.error('Error ending trip:', error);
    return res.status(500).json({ error: 'Failed to end trip' });
  }
});

// POST /api/trips/:code/leave - Leave trip (any rider)
router.post('/:code/leave', async (req, res) => {
  try {
    const { code } = req.params;
    const { riderId } = req.body;

    if (!riderId) {
      return res.status(400).json({ error: 'riderId is required' });
    }

    const tripCode = code.toUpperCase();
    const trip = await Trip.findOne({ tripCode, status: 'active' });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or has ended' });
    }

    // Find and remove the rider
    const riderIndex = trip.riders.findIndex(r => r.riderId === riderId);
    if (riderIndex === -1) {
      return res.status(404).json({ error: 'Rider not found in trip' });
    }

    const removedRider = trip.riders[riderIndex];
    trip.riders.splice(riderIndex, 1);
    await trip.save();

    // Delete rider's location data for privacy
    await deleteRiderLocation(tripCode, riderId);

    return res.status(200).json({
      message: 'Left trip successfully',
      tripCode: trip.tripCode,
      removedRider: removedRider.displayName,
    });
  } catch (error) {
    console.error('Error leaving trip:', error);
    return res.status(500).json({ error: 'Failed to leave trip' });
  }
});

// POST /api/trips/:code/kick - Kick rider (host only)
router.post('/:code/kick', async (req, res) => {
  try {
    const { code } = req.params;
    const { hostId, targetRiderId } = req.body;

    if (!hostId || !targetRiderId) {
      return res.status(400).json({ error: 'hostId and targetRiderId are required' });
    }

    const trip = await Trip.findOne({ tripCode: code.toUpperCase(), status: 'active' });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or has ended' });
    }

    // Verify host authorization
    if (trip.hostId !== hostId) {
      return res.status(403).json({ error: 'Only the host can kick riders' });
    }

    // Cannot kick yourself
    if (hostId === targetRiderId) {
      return res.status(400).json({ error: 'Cannot kick yourself' });
    }

    // Find and remove the rider
    const riderIndex = trip.riders.findIndex(r => r.riderId === targetRiderId);
    if (riderIndex === -1) {
      return res.status(404).json({ error: 'Rider not found in trip' });
    }

    const kickedRider = trip.riders[riderIndex];
    trip.riders.splice(riderIndex, 1);
    await trip.save();

    return res.status(200).json({
      message: 'Rider kicked successfully',
      tripCode: trip.tripCode,
      kickedRider: kickedRider.displayName,
      kickedRiderId: kickedRider.riderId,
    });
  } catch (error) {
    console.error('Error kicking rider:', error);
    return res.status(500).json({ error: 'Failed to kick rider' });
  }
});

// POST /api/trips/:code/consent - Record replay consent decision
router.post('/:code/consent', async (req, res) => {
  try {
    const { code } = req.params;
    const { riderId, displayName, consent, locationHistory, tripStartedAt } = req.body;

    if (!riderId) {
      return res.status(400).json({ error: 'riderId is required' });
    }

    const tripCode = code.toUpperCase();
    const trip = await Trip.findOne({ tripCode });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    // Create or update consent record
    await TripReplay.findOneAndUpdate(
      { tripCode, riderId },
      {
        tripCode,
        riderId,
        displayName: displayName || 'Unknown',
        consentGranted: consent === true,
        consentTimestamp: new Date(),
        consentDeviceId: riderId,
        tripStartedAt: tripStartedAt ? new Date(tripStartedAt) : trip.createdAt,
        tripEndedAt: new Date(),
        locationHistory: consent ? (locationHistory || []) : [],
        createdAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // Log consent event for regulatory compliance (Story 8.6)
    await ConsentLog.create({
      deviceId: hashData(riderId),
      consentType: 'trip_replay',
      action: consent ? 'granted' : 'denied',
      timestamp: new Date(),
      ipAddress: hashData(req.ip || 'unknown'),
      userAgent: req.get('User-Agent') || 'unknown',
      consentText: consent 
        ? 'User consented to save trip replay for 7 days' 
        : 'User declined to save trip replay',
      appVersion: '1.0.0',
    });

    console.log(`📋 Consent ${consent ? 'granted' : 'denied'} for rider ${riderId} in trip ${tripCode}`);

    return res.status(200).json({
      message: consent ? 'Replay consent granted' : 'Replay consent denied',
      tripCode,
      consentGranted: consent,
      expiresAt: consent ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null,
    });
  } catch (error) {
    console.error('Error recording consent:', error);
    return res.status(500).json({ error: 'Failed to record consent' });
  }
});

// GET /api/trips/history/:deviceId - Get user's trip history (within 7-day window)
router.get('/history/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;

    if (!deviceId) {
      return res.status(400).json({ error: 'deviceId is required' });
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const replays = await TripReplay.find({
      riderId: deviceId,
      consentGranted: true,
      createdAt: { $gte: sevenDaysAgo },
    })
      .sort({ createdAt: -1 })
      .select('tripCode displayName tripStartedAt tripEndedAt createdAt locationHistory')
      .lean();

    const trips = replays.map((replay) => {
      const expiresAt = new Date(replay.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);
      const daysRemaining = Math.ceil((expiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
      
      let totalDistance = 0;
      if (replay.locationHistory && replay.locationHistory.length > 1) {
        for (let i = 1; i < replay.locationHistory.length; i++) {
          const prev = replay.locationHistory[i - 1];
          const curr = replay.locationHistory[i];
          const prevLat = prev.coordinates?.latitude;
          const prevLon = prev.coordinates?.longitude;
          const currLat = curr.coordinates?.latitude;
          const currLon = curr.coordinates?.longitude;
          if (prevLat && prevLon && currLat && currLon) {
            const R = 6371;
            const dLat = (currLat - prevLat) * Math.PI / 180;
            const dLon = (currLon - prevLon) * Math.PI / 180;
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                      Math.cos(prevLat * Math.PI / 180) * Math.cos(currLat * Math.PI / 180) *
                      Math.sin(dLon/2) * Math.sin(dLon/2);
            totalDistance += R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          }
        }
      }

      const duration = replay.tripEndedAt && replay.tripStartedAt
        ? Math.round((new Date(replay.tripEndedAt).getTime() - new Date(replay.tripStartedAt).getTime()) / 1000 / 60)
        : 0;

      return {
        tripCode: replay.tripCode,
        displayName: replay.displayName,
        tripStartedAt: replay.tripStartedAt,
        tripEndedAt: replay.tripEndedAt,
        createdAt: replay.createdAt,
        expiresAt,
        daysRemaining: Math.max(0, daysRemaining),
        distance: Math.round(totalDistance * 10) / 10,
        duration,
        pointCount: replay.locationHistory?.length || 0,
      };
    });

    return res.status(200).json({
      trips,
      count: trips.length,
    });
  } catch (error) {
    console.error('Error fetching trip history:', error);
    return res.status(500).json({ error: 'Failed to fetch trip history' });
  }
});

// DELETE /api/trips/history/:tripCode/:deviceId - Delete a saved trip replay
router.delete('/history/:tripCode/:deviceId', async (req, res) => {
  try {
    const { tripCode, deviceId } = req.params;

    const result = await TripReplay.findOneAndDelete({
      tripCode: tripCode.toUpperCase(),
      riderId: deviceId,
    });

    if (!result) {
      return res.status(404).json({ error: 'Trip replay not found' });
    }

    console.log(`🗑️ Deleted trip replay ${tripCode} for device ${deviceId.slice(0, 8)}...`);

    return res.status(200).json({
      message: 'Trip replay deleted successfully',
      tripCode,
    });
  } catch (error) {
    console.error('Error deleting trip replay:', error);
    return res.status(500).json({ error: 'Failed to delete trip replay' });
  }
});

// GET /api/trips/:code/summary - Get trip summary statistics
router.get('/:code/summary', async (req, res) => {
  try {
    const { code } = req.params;
    const tripCode = code.toUpperCase();
    const trip = await Trip.findOne({ tripCode });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const tripDuration = trip.endedAt 
      ? (new Date(trip.endedAt).getTime() - new Date(trip.createdAt).getTime()) / 1000 / 60
      : (Date.now() - new Date(trip.createdAt).getTime()) / 1000 / 60;

    return res.status(200).json({
      tripCode: trip.tripCode,
      riderCount: trip.riders.length,
      tripStartedAt: trip.createdAt,
      tripEndedAt: trip.endedAt || new Date(),
      duration: Math.round(tripDuration),
      status: trip.status,
    });
  } catch (error) {
    console.error('Error fetching trip summary:', error);
    return res.status(500).json({ error: 'Failed to fetch trip summary' });
  }
});

// GET /api/trips/:code/replay/:riderId - Get replay data (if consented)
router.get('/:code/replay/:riderId', async (req, res) => {
  try {
    const { code, riderId } = req.params;
    const tripCode = code.toUpperCase();

    const replay = await TripReplay.findOne({ tripCode, riderId, consentGranted: true });

    if (!replay) {
      return res.status(404).json({ error: 'Replay not found or consent not granted' });
    }

    return res.status(200).json({
      tripCode: replay.tripCode,
      riderId: replay.riderId,
      displayName: replay.displayName,
      locationHistory: replay.locationHistory,
      tripStartedAt: replay.tripStartedAt,
      tripEndedAt: replay.tripEndedAt,
      expiresAt: new Date(replay.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000),
    });
  } catch (error) {
    console.error('Error fetching replay:', error);
    return res.status(500).json({ error: 'Failed to fetch replay' });
  }
});

export default router;
