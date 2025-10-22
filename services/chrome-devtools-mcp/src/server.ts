// ============================================================================
// CHROME DEVTOOLS MCP SERVER
// Port: 3014
// ============================================================================

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3014;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'chrome-devtools-mcp',
    timestamp: new Date().toISOString(),
  });
});

// Get network logs (simulated)
app.get('/network', (req, res) => {
  res.json({
    requests: [
      { url: 'https://example.com/api/data', status: 200, duration: 45 },
      { url: 'https://example.com/styles.css', status: 200, duration: 12 },
    ],
  });
});

// Get performance metrics (simulated)
app.get('/performance', (req, res) => {
  res.json({
    firstContentfulPaint: 1.2,
    largestContentfulPaint: 2.5,
    totalBlockingTime: 150,
    cumulativeLayoutShift: 0.1,
  });
});

app.listen(PORT, () => {
  console.log(`✨ Chrome DevTools MCP running on port ${PORT}`);
});
