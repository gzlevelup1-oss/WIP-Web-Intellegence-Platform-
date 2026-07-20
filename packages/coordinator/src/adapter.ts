export interface IExecutionKernelAdapter {
  captureObservation(): Promise<any>;
  click(nodeId: string): Promise<any>;
  type(nodeId: string, text: string): Promise<any>;
  goto(url: string): Promise<any>;
}

export interface IWorkerAdapter {
  extractDesignTokens(snapshotId: string): Promise<any>;
  mineComponents(snapshotId: string, containerNodeId: string): Promise<any>;
  analyzeLayout(snapshotId: string, containerNodeId: string): Promise<any>;
}

export interface IValidationAdapter {
  evaluate(originalSnapshotId: string, reconstructedSnapshotId: string): Promise<any>;
}
