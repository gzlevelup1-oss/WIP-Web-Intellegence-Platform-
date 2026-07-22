import { IWorkerAdapter } from '@wip/coordinator';
import { ServiceLocator } from '../ServiceLocator.js';

export class WorkerAdapter implements IWorkerAdapter {
  private services = ServiceLocator.getInstance();

  async extractDesignTokens(snapshotId: string): Promise<any> {
    const graph = await this.services.observationStore.getSnapshot(snapshotId);
    if (!graph) throw new Error('Snapshot not found');
    return this.services.tokenExtractor.extract(graph);
  }

  async mineComponents(snapshotId: string, containerNodeId: string): Promise<any> {
    const graph = await this.services.observationStore.getSnapshot(snapshotId);
    if (!graph) throw new Error('Snapshot not found');
    return this.services.componentMiner.mine(graph, containerNodeId);
  }

  async analyzeLayout(snapshotId: string, containerNodeId: string): Promise<any> {
    const graph = await this.services.observationStore.getSnapshot(snapshotId);
    if (!graph) throw new Error('Snapshot not found');
    return this.services.layoutAnalyzer.analyze(graph, containerNodeId);
  }
}
