import { structuralDiff } from './structural.js';
import { visualDiff } from './visual.js';
import { DiscrepancyReport, Discrepancy } from './types.js';

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

  // 2. Visual diffing
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

  const status = violations.length === 0 ? 'ValidationPassed' : 'ValidationFailed';

  return {
    status,
    ssim: visualResult.ssim,
    mse: visualResult.mse,
    violations
  };
}
