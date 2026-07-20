import { describe, it, expect } from 'vitest';
import { validate } from '../engine.js';
import { PNG } from 'pngjs';

describe('ValidationEngine', () => {
  it('should pass validation for identical inputs', () => {
    const png = new PNG({ width: 2, height: 2 });
    const b1 = PNG.sync.write(png).toString('base64');
    
    const request = {
      originalGraph: { nodes: [] },
      reconstructedGraph: { nodes: [] },
      originalScreenshotBase64: b1,
      reconstructedScreenshotBase64: b1
    };
    
    const result = validate(request);
    expect(result.status).toBe('ValidationPassed');
    expect(result.violations.length).toBe(0);
  });
});
