import { Router } from 'express';
import { Attribution } from '../models/Attribution';
import crypto from 'crypto';

const router = Router();

const hashData = (data: string): string => {
  return crypto.createHash('sha256').update(data).digest('hex').slice(0, 16);
};

router.post('/attribution', async (req, res) => {
  try {
    const { deviceId, attributionSource, attributionDetails, tripCode } = req.body;

    if (!deviceId || !attributionSource) {
      return res.status(400).json({ error: 'deviceId and attributionSource are required' });
    }

    const validSources = ['google', 'social', 'friend', 'motorcycle', 'news', 'podcast', 'other'];
    if (!validSources.includes(attributionSource)) {
      return res.status(400).json({ error: 'Invalid attribution source' });
    }

    const attribution = await Attribution.create({
      deviceIdHash: hashData(deviceId),
      attributionSource,
      attributionDetails: attributionDetails?.slice(0, 200),
      tripCode: tripCode ? hashData(tripCode) : undefined,
      timestamp: new Date(),
      appVersion: '1.0.0',
    });

    console.log(`📊 Attribution recorded: ${attributionSource} from device ${hashData(deviceId).slice(0, 8)}...`);

    return res.status(201).json({
      message: 'Attribution recorded successfully',
      id: attribution._id,
    });
  } catch (error) {
    console.error('Error recording attribution:', error);
    return res.status(500).json({ error: 'Failed to record attribution' });
  }
});

router.get('/attribution/stats', async (_req, res) => {
  try {
    const stats = await Attribution.aggregate([
      {
        $group: {
          _id: '$attributionSource',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const total = await Attribution.countDocuments();

    return res.status(200).json({
      total,
      bySource: stats,
    });
  } catch (error) {
    console.error('Error fetching attribution stats:', error);
    return res.status(500).json({ error: 'Failed to fetch attribution stats' });
  }
});

export default router;
