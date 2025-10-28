// ============================================================================
// BROWSER AUTOMATION SERVICE (Playwright)
// Port: 3013
// ============================================================================

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { chromium, Browser } from 'playwright';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3013;

let browser: Browser | null = null;

app.use(cors());
app.use(express.json());

// Initialize browser
async function initBrowser() {
  if (!browser) {
    browser = await chromium.launch({ headless: true });
    console.log('✓ Browser initialized');
  }
  return browser;
}

// Health check
app.get('/health', async (req, res) => {
  const browserConnected = browser?.isConnected() || false;
  res.json({
    status: 'healthy',
    service: 'browser-service',
    browserConnected,
    timestamp: new Date().toISOString(),
  });
});

// Run browser test
app.post('/test', async (req, res) => {
  const { url, scenario } = req.body;

  try {
    const browser = await initBrowser();
    const page = await browser.newPage();

    await page.goto(url);
    const screenshot = await page.screenshot({ type: 'png' });

    await page.close();

    res.json({
      success: true,
      url,
      scenario,
      screenshot: screenshot.toString('base64'),
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, async () => {
  console.log(`✨ Browser Service running on port ${PORT}`);
  await initBrowser();
});

// Cleanup on exit
process.on('SIGINT', async () => {
  if (browser) await browser.close();
  process.exit(0);
});
