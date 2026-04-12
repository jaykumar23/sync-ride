import { useState, useRef, useEffect } from 'react';

interface TripStats {
  personal: {
    totalDistance: number;
    ridingTime: number;
    maxSpeed: number;
    avgSpeed: number;
  };
  group: {
    riderCount: number;
    groupDistance: number;
    maxSeparation: number;
  };
  tripCode: string;
  tripStartedAt: Date;
  tripEndedAt: Date;
}

interface ExportSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: TripStats | null;
}

const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

export const ExportSummaryModal = ({
  isOpen,
  onClose,
  stats,
}: ExportSummaryModalProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen && stats && canvasRef.current) {
      generateImage();
    }
  }, [isOpen, stats]);

  const generateImage = () => {
    if (!canvasRef.current || !stats) return;
    
    setGenerating(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1080;
    const height = 1920;
    canvas.width = width;
    canvas.height = height;

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#0f0f23');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 72px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🏍️ SyncRide', width / 2, 150);

    ctx.font = '36px system-ui';
    ctx.fillStyle = '#a0a0a0';
    ctx.fillText('Trip Complete!', width / 2, 220);

    const tripDate = new Date(stats.tripEndedAt).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    ctx.font = '28px system-ui';
    ctx.fillStyle = '#808080';
    ctx.fillText(tripDate, width / 2, 270);

    const drawStatCard = (x: number, y: number, w: number, h: number, value: string, label: string, color: string) => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 24);
      ctx.fill();

      ctx.fillStyle = color;
      ctx.font = 'bold 64px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(value, x + w / 2, y + h / 2);

      ctx.fillStyle = '#a0a0a0';
      ctx.font = '28px system-ui';
      ctx.fillText(label, x + w / 2, y + h / 2 + 50);
    };

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 42px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('Your Ride', 80, 400);

    const cardWidth = 450;
    const cardHeight = 180;
    const gap = 40;
    const startX = 80;
    let startY = 450;

    drawStatCard(startX, startY, cardWidth, cardHeight, 
      `${stats.personal.totalDistance.toFixed(1)} km`, 'Distance', '#3b82f6');
    drawStatCard(startX + cardWidth + gap, startY, cardWidth, cardHeight, 
      formatDuration(stats.personal.ridingTime), 'Riding Time', '#3b82f6');

    startY += cardHeight + gap;
    drawStatCard(startX, startY, cardWidth, cardHeight, 
      `${stats.personal.maxSpeed} km/h`, 'Max Speed', '#22c55e');
    drawStatCard(startX + cardWidth + gap, startY, cardWidth, cardHeight, 
      `${stats.personal.avgSpeed} km/h`, 'Avg Speed', '#06b6d4');

    startY += cardHeight + 80;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 42px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('Group Stats', 80, startY);

    startY += 50;
    const smallCardWidth = (width - 160 - gap * 2) / 3;
    drawStatCard(startX, startY, smallCardWidth, cardHeight, 
      `${stats.group.riderCount}`, 'Riders', '#3b82f6');
    drawStatCard(startX + smallCardWidth + gap, startY, smallCardWidth, cardHeight, 
      `${stats.group.groupDistance.toFixed(1)} km`, 'Group Distance', '#22c55e');
    drawStatCard(startX + (smallCardWidth + gap) * 2, startY, smallCardWidth, cardHeight, 
      `${stats.group.maxSeparation.toFixed(1)} km`, 'Max Spread', '#f59e0b');

    ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
    ctx.beginPath();
    ctx.roundRect(80, height - 250, width - 160, 150, 24);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Track your group rides with SyncRide', width / 2, height - 160);
    ctx.font = '24px system-ui';
    ctx.fillStyle = '#a0a0a0';
    ctx.fillText('syncride.app', width / 2, height - 120);

    ctx.fillStyle = '#606060';
    ctx.font = '20px system-ui';
    ctx.fillText(`Trip Code: ${stats.tripCode}`, width / 2, height - 50);

    const dataUrl = canvas.toDataURL('image/png');
    setImageUrl(dataUrl);
    setGenerating(false);
  };

  const handleSaveToPhotos = () => {
    if (!imageUrl || !stats) return;
    
    const link = document.createElement('a');
    link.download = `syncride-trip-${new Date().toISOString().split('T')[0]}.png`;
    link.href = imageUrl;
    link.click();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleShareNow = async () => {
    if (!imageUrl) return;

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], 'syncride-trip.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'My SyncRide Trip',
        });
      } else {
        handleSaveToPhotos();
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Share failed:', err);
        handleSaveToPhotos();
      }
    }
  };

  const handleCopyImage = async () => {
    if (!imageUrl) return;

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
      handleSaveToPhotos();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-surface rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl animate-fade-in">
        <div className="p-5 text-center border-b border-[var(--border)]">
          <div className="text-4xl mb-2">🖼️</div>
          <h2 className="text-xl font-bold">Export Summary</h2>
          <p className="text-sm text-content-secondary mt-1">Share your trip achievement</p>
        </div>

        <div className="p-4">
          <canvas ref={canvasRef} className="hidden" />
          
          {generating ? (
            <div className="flex items-center justify-center h-48">
              <div className="text-center">
                <div className="animate-spin text-3xl mb-2">⏳</div>
                <p className="text-content-secondary">Generating image...</p>
              </div>
            </div>
          ) : imageUrl ? (
            <div className="relative rounded-xl overflow-hidden mb-4 bg-surface-secondary">
              <img 
                src={imageUrl} 
                alt="Trip Summary" 
                className="w-full h-auto max-h-[40vh] object-contain"
              />
            </div>
          ) : null}

          <div className="space-y-2">
            <button
              onClick={handleSaveToPhotos}
              disabled={!imageUrl}
              className="w-full h-12 btn btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{saved ? '✅' : '💾'}</span>
              {saved ? 'Saved!' : 'Save to Downloads'}
            </button>

            <button
              onClick={handleShareNow}
              disabled={!imageUrl}
              className="w-full h-12 btn btn-secondary flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>📤</span>
              Share Now
            </button>

            <button
              onClick={handleCopyImage}
              disabled={!imageUrl}
              className="w-full h-12 btn btn-secondary flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>📋</span>
              Copy Image
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-[var(--border)]">
          <button
            onClick={onClose}
            className="w-full h-10 btn btn-secondary text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
