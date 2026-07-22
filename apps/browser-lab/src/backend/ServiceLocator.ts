import { ExecutionKernel } from '@wip/execution-kernel';
import { DesignTokenExtractor, ComponentMiner, LayoutAnalyzer } from '@wip/workers';
import { MemoryObservationStore } from '@wip/observation-store';
import { BrowserRuntime, PlaywrightAdapter } from '@wip/browser-runtime';

export class ServiceLocator {
  private static _instance: ServiceLocator;
  
  public browserRuntime: BrowserRuntime;
  public executionKernel: ExecutionKernel;
  public tokenExtractor: DesignTokenExtractor;
  public componentMiner: ComponentMiner;
  public layoutAnalyzer: LayoutAnalyzer;
  public observationStore: MemoryObservationStore;

  private constructor() {
    const browserAdapter = new PlaywrightAdapter();
    this.browserRuntime = new BrowserRuntime(browserAdapter);
    
    this.executionKernel = new ExecutionKernel({
      createCheckpoint: async (sessionId: string) => {
        return await this.browserRuntime.createCheckpoint(sessionId);
      },
      restoreCheckpoint: async (sessionId: string, checkpoint: any) => {
        await this.browserRuntime.restoreCheckpoint(sessionId, checkpoint);
      }
    });

    this.tokenExtractor = new DesignTokenExtractor();
    this.componentMiner = new ComponentMiner();
    this.layoutAnalyzer = new LayoutAnalyzer();
    this.observationStore = new MemoryObservationStore();
  }

  public static getInstance(): ServiceLocator {
    if (!ServiceLocator._instance) {
      ServiceLocator._instance = new ServiceLocator();
    }
    return ServiceLocator._instance;
  }
}
