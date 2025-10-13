import express, { Request, Response } from 'express';
import cors from 'cors';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3001;
const HLS_ORIGIN = process.env.HLS_ORIGIN || 'https://example.com/hls';
const FALLBACK_MP3 = process.env.FALLBACK_MP3 || 'https://example.com/fallback.mp3';

app.use(cors());
app.use(express.json());

// Ensure out directory exists
const outDir = path.join(__dirname, '../out');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const playsLogPath = path.join(outDir, 'plays.csv');
const adsLogPath = path.join(outDir, 'ads.csv');

// Initialize CSV files with headers if they don't exist
if (!fs.existsSync(playsLogPath)) {
  fs.writeFileSync(playsLogPath, 'timestamp,event,trackId,metadata\n');
}
if (!fs.existsSync(adsLogPath)) {
  fs.writeFileSync(adsLogPath, 'timestamp,event,adId,metadata\n');
}

// Log play event
function logPlay(trackId: string, metadata: string = '') {
  const timestamp = new Date().toISOString();
  const line = `${timestamp},play,${trackId},"${metadata}"\n`;
  fs.appendFileSync(playsLogPath, line);
}

// Log ad event
function logAd(adId: string, event: string = 'play', metadata: string = '') {
  const timestamp = new Date().toISOString();
  const line = `${timestamp},${event},${adId},"${metadata}"\n`;
  fs.appendFileSync(adsLogPath, line);
}

// Proxy HLS manifest and segments
app.get('/live/*', async (req: Request, res: Response) => {
  const path = req.params[0];
  const url = `${HLS_ORIGIN}/${path}`;
  
  try {
    const response = await axios.get(url, {
      responseType: req.path.endsWith('.m3u8') ? 'text' : 'stream',
      timeout: 5000
    });
    
    // Set appropriate headers
    if (req.path.endsWith('.m3u8')) {
      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    } else if (req.path.endsWith('.ts')) {
      res.setHeader('Content-Type', 'video/MP2T');
    }
    
    res.status(response.status).send(response.data);
    
    // Log the stream access
    logPlay(path, `HLS stream segment`);
  } catch (error) {
    console.error('HLS origin error:', error);
    // Fallback to MP3
    res.redirect(FALLBACK_MP3);
  }
});

// Health check
app.get('/healthz', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Metrics endpoint
app.get('/metrics', (req: Request, res: Response) => {
  try {
    const playsCount = fs.readFileSync(playsLogPath, 'utf-8').split('\n').length - 2;
    const adsCount = fs.readFileSync(adsLogPath, 'utf-8').split('\n').length - 2;
    
    res.json({
      plays: playsCount,
      ads: adsCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to read metrics' });
  }
});

// Log ad event endpoint
app.post('/log/ad', (req: Request, res: Response) => {
  const { adId, event = 'play', metadata = '' } = req.body;
  if (!adId) {
    return res.status(400).json({ error: 'adId is required' });
  }
  logAd(adId, event, metadata);
  res.json({ success: true });
});

// Log play event endpoint
app.post('/log/play', (req: Request, res: Response) => {
  const { trackId, metadata = '' } = req.body;
  if (!trackId) {
    return res.status(400).json({ error: 'trackId is required' });
  }
  logPlay(trackId, metadata);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`🎵 Trail Mixx Stream Service running on port ${PORT}`);
  console.log(`HLS Origin: ${HLS_ORIGIN}`);
  console.log(`Fallback MP3: ${FALLBACK_MP3}`);
});

export { app, logPlay, logAd };
