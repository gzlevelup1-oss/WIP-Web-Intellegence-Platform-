import { describe, it, expect } from 'vitest';
import { visualDiff } from '../visual.js';
import { PNG } from 'pngjs';

describe('visualDiff', () => {
  it('should return 0 MSE and 1 SSIM for identical images', () => {
    // 2x2 red pixel image
    const png = new PNG({ width: 2, height: 2 });
    for (let i = 0; i < png.data.length; i += 4) {
      png.data[i] = 255;
      png.data[i + 1] = 0;
      png.data[i + 2] = 0;
      png.data[i + 3] = 255;
    }
    const base64 = PNG.sync.write(png).toString('base64');
    
    const result = visualDiff(base64, base64);
    expect(result.mse).toBe(0);
    expect(result.ssim).toBe(1);
    expect(result.numDiffPixels).toBe(0);
  });

  it('should return error scores for mismatched dimensions', () => {
    const png1 = new PNG({ width: 2, height: 2 });
    const png2 = new PNG({ width: 3, height: 3 });
    const b1 = PNG.sync.write(png1).toString('base64');
    const b2 = PNG.sync.write(png2).toString('base64');
    
    const result = visualDiff(b1, b2);
    expect(result.mse).toBe(1);
    expect(result.ssim).toBe(0);
  });
});
