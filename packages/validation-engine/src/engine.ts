import { structuralDiff } from './structural.js';
import { visualDiff } from './visual.js';
import { accessibilityDiff } from './accessibility.js';
import { DiscrepancyReport, Discrepancy } from './types.js';
import * as fs from 'fs';
import * as path from 'path';

export interface ValidationRequest {
  originalGraph: any;
  reconstructedGraph: any;
  originalScreenshotBase64: string;
  reconstructedScreenshotBase64: string;
}

export function validate(request: ValidationRequest): DiscrepancyReport {
  const violations: Discrepancy[] = [];
  
  // 1. Structural diffing
  const structuralViolations = structuralDiff(request.originalGraph, request.reconstructedGraph);
  violations.push(...structuralViolations);

  // 2. Accessibility diffing
  const a11yViolations = accessibilityDiff(request.originalGraph, request.reconstructedGraph);
  violations.push(...a11yViolations);

  // 3. Visual diffing
  const visualResult = visualDiff(request.originalScreenshotBase64, request.reconstructedScreenshotBase64);
  
  // Apply visual thresholds
  if (visualResult.ssim < 0.98) {
    violations.push({
      type: 'Visual',
      message: `SSIM (${visualResult.ssim.toFixed(4)}) is below threshold (0.98)`
    });
  }
  
  if (visualResult.mse > 0.05) {
    violations.push({
      type: 'Visual',
      message: `MSE (${visualResult.mse.toFixed(4)}) is above threshold (0.05)`
    });
  }

  const status: 'ValidationPassed' | 'ValidationFailed' = violations.length === 0 ? 'ValidationPassed' : 'ValidationFailed';

  const report = {
    status,
    ssim: visualResult.ssim,
    mse: visualResult.mse,
    violations
  };

  try {
    const evidenceDir = path.resolve(process.cwd(), 'logs', 'evidence');
    if (!fs.existsSync(evidenceDir)) {
      fs.mkdirSync(evidenceDir, { recursive: true });
    }
    const filename = `validation-${Date.now()}-${Math.floor(Math.random() * 1000)}.json`;
    fs.writeFileSync(path.join(evidenceDir, filename), JSON.stringify(report, null, 2));
  } catch (e) {
    console.error('Failed to write validation evidence', e);
  }

  return report;
}
