import { Router } from 'express';
import { Trip } from '../models/Trip';
import { TripReplay } from '../models/TripReplay';
import { ConsentLog } from '../models/ConsentLog';
import crypto from 'crypto';

const router = Router();

// Helper to hash sensitive data
const hashData = (data: string): string => {
  return crypto.createHash('sha256').update(data).digest('hex').slice(0, 16);
};

// GET /api/privacy/export/:deviceId - Export user data
router.get('/export/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;

    if (!deviceId) {
      return res.status(400).json({ error: 'deviceId is required' });
    }

    // Find all trips this device participated in (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const trips = await Trip.find({
      $or: [
        { hostId: deviceId },
        { 'riders.riderId': deviceId }
      ],
      createdAt: { $gte: thirtyDaysAgo }
    }).select('tripCode createdAt status riders').lean();

    // Find consent logs for this device
    const consentLogs = await ConsentLog.find({
      deviceId: hashData(deviceId)
    }).select('consentType action timestamp -_id').lean();

    // Find any replay data
    const replays = await TripReplay.find({
      riderId: deviceId,
      consentGranted: true
    }).select('tripCode tripStartedAt tripEndedAt createdAt -_id').lean();

    // Prepare export data
    const exportData = {
      exportedAt: new Date().toISOString(),
      deviceId: `${deviceId.slice(0, 8)}...${deviceId.slice(-4)}`, // Masked
      dataRetentionPolicy: {
        liveLocationData: '30 seconds (auto-deleted)',
        tripReplayData: '7 days (if consented)',
        tripMetadata: '7 days',
        consentLogs: '7 years (regulatory requirement)'
      },
      trips: trips.map(trip => ({
        tripCode: trip.tripCode,
        createdAt: trip.createdAt,
        status: trip.status,
        role: trip.hostId === deviceId ? 'host' : 'rider',
        displayName: trip.riders.find(r => r.riderId === deviceId)?.displayName || 'Unknown'
      })),
      consentHistory: consentLogs,
      savedReplays: replays.map(r => ({
        tripCode: r.tripCode,
        tripStartedAt: r.tripStartedAt,
        tripEndedAt: r.tripEndedAt,
        expiresAt: new Date(r.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000)
      })),
      statistics: {
        totalTrips: trips.length,
        tripsAsHost: trips.filter(t => t.hostId === deviceId).length,
        tripsAsRider: trips.filter(t => t.hostId !== deviceId).length,
        savedReplays: replays.length
      }
    };

    return res.status(200).json(exportData);
  } catch (error) {
    console.error('Error exporting user data:', error);
    return res.status(500).json({ error: 'Failed to export data' });
  }
});

// DELETE /api/privacy/delete/:deviceId - Delete all user data
router.delete('/delete/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;

    if (!deviceId) {
      return res.status(400).json({ error: 'deviceId is required' });
    }

    const deletionResults = {
      tripReplays: 0,
      tripParticipation: 0,
      consentLogsAnonymized: 0
    };

    // Delete trip replay data
    const replayResult = await TripReplay.deleteMany({ riderId: deviceId });
    deletionResults.tripReplays = replayResult.deletedCount;

    // Remove from trip riders (anonymize historical participation)
    const trips = await Trip.find({
      'riders.riderId': deviceId
    });

    for (const trip of trips) {
      trip.riders = trip.riders.map(rider => {
        if (rider.riderId === deviceId) {
          return {
            ...rider,
            riderId: `deleted_${hashData(deviceId)}`,
            displayName: 'Deleted User'
          };
        }
        return rider;
      });
      await trip.save();
      deletionResults.tripParticipation++;
    }

    // Anonymize consent logs (keep for compliance but anonymize)
    const hashedDeviceId = hashData(deviceId);
    const consentResult = await ConsentLog.updateMany(
      { deviceId: hashedDeviceId },
      { 
        $set: { 
          deviceId: `anonymized_${Date.now()}`,
          anonymizedAt: new Date()
        } 
      }
    );
    deletionResults.consentLogsAnonymized = consentResult.modifiedCount;

    // Log the deletion request for compliance
    await ConsentLog.create({
      deviceId: `deletion_${hashData(deviceId)}`,
      consentType: 'data_deletion',
      action: 'requested',
      timestamp: new Date(),
      ipAddress: hashData(req.ip || 'unknown'),
      userAgent: req.get('User-Agent') || 'unknown',
      consentText: 'User requested complete data deletion under DPDP Act',
      appVersion: '1.0.0'
    });

    console.log(`🗑️ Data deletion completed for device ${deviceId.slice(0, 8)}...`);
    console.log(`   - Replays deleted: ${deletionResults.tripReplays}`);
    console.log(`   - Trip participations anonymized: ${deletionResults.tripParticipation}`);
    console.log(`   - Consent logs anonymized: ${deletionResults.consentLogsAnonymized}`);

    return res.status(200).json({
      message: 'Data deletion completed',
      deletionResults,
      completedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error deleting user data:', error);
    return res.status(500).json({ error: 'Failed to delete data' });
  }
});

export default router;
