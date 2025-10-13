import fs from 'fs';
import path from 'path';
import { logPlay, logAd } from '../src/index';

describe('Stream Service Logging', () => {
  const testOutDir = path.join(__dirname, '../out');
  
  beforeAll(() => {
    if (!fs.existsSync(testOutDir)) {
      fs.mkdirSync(testOutDir, { recursive: true });
    }
  });

  it('should log play events to plays.csv', () => {
    const playsPath = path.join(testOutDir, 'plays.csv');
    const initialLines = fs.existsSync(playsPath) 
      ? fs.readFileSync(playsPath, 'utf-8').split('\n').length 
      : 0;
    
    logPlay('test-track-123', 'test metadata');
    
    const finalLines = fs.readFileSync(playsPath, 'utf-8').split('\n').length;
    expect(finalLines).toBeGreaterThan(initialLines);
  });

  it('should log ad events to ads.csv', () => {
    const adsPath = path.join(testOutDir, 'ads.csv');
    const initialLines = fs.existsSync(adsPath) 
      ? fs.readFileSync(adsPath, 'utf-8').split('\n').length 
      : 0;
    
    logAd('test-ad-456', 'start', 'ad metadata');
    
    const finalLines = fs.readFileSync(adsPath, 'utf-8').split('\n').length;
    expect(finalLines).toBeGreaterThan(initialLines);
  });
});
