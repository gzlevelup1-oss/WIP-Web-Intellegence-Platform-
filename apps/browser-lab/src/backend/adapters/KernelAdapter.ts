import { IExecutionKernelAdapter } from '@wip/coordinator';
import { ServiceLocator } from '../ServiceLocator.js';

export class KernelAdapter implements IExecutionKernelAdapter {
  private services = ServiceLocator.getInstance();
  private sessionId: string;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  async captureObservation(levels?: string[]): Promise<{ status: string; snapshotId: string; }> {
    let numericFlags = [1]; // Default to DOM (1)
    if (levels && levels.length > 0) {
      numericFlags = levels.map(l => {
        if (l === 'DOM') return 1;
        if (l === 'A11Y') return 2;
        return 1;
      });
    }
    const snapshot = await this.services.browserRuntime.capture(this.sessionId, numericFlags);
    await this.services.observationStore.saveSnapshot(snapshot.snapshotId, snapshot.graph as any);
    return { status: 'captured', snapshotId: snapshot.snapshotId };
  }

  async click(nodeId: string): Promise<{ status: string; nodeId: string; }> {
    await this.services.browserRuntime.click(this.sessionId, nodeId);
    return { status: 'clicked', nodeId };
  }

  async type(nodeId: string, text: string): Promise<{ status: string; nodeId: string; text: string; }> {
    await this.services.browserRuntime.type(this.sessionId, nodeId, text);
    return { status: 'typed', nodeId, text };
  }

  async goto(url: string): Promise<{ status: string; url: string; }> {
    await this.services.browserRuntime.navigate(this.sessionId, url);
    return { status: 'navigated', url };
  }
}
