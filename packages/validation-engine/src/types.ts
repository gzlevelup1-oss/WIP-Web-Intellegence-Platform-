export interface Discrepancy {
  type: 'Structural' | 'Visual' | 'Accessibility';
  message: string;
  expectedNodeId?: string;
  actualNodeId?: string;
}

export interface DiscrepancyReport {
  status: 'ValidationFailed' | 'ValidationPassed';
  ssim: number;
  mse: number;
  violations: Discrepancy[];
}
