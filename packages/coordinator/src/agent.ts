import { EventEmitter } from 'events';
import { GoogleGenAI, Type, FunctionCall, Part, Tool } from '@google/genai';
import { CoordinatorToolDeclarations } from './tools.js';
import { IExecutionKernelAdapter, IWorkerAdapter, IValidationAdapter } from './adapter.js';
import { ExperienceGraph } from './experience-graph.js';

const SYSTEM_PROMPT = `You are the Coordinator Agent for the Website Intelligence Platform.
Your purpose is to probabilistically orchestrate the extraction of semantic data and interaction with web pages using a deterministic Execution Kernel and Specialized Workers.

RULES:
1. You MUST NOT generate Playwright, Puppeteer, or JavaScript code.
2. You MUST reference elements by NodeID provided by the Observation Graph or Workers.
3. You operate in a Reason + Act loop. You will be given tools to observe, analyze, and interact.
4. When you have completed the objective, call Mission_complete. Provide originalSnapshotId and reconstructedSnapshotId if applicable.`;

export class CoordinatorAgent extends EventEmitter {
  private ai: GoogleGenAI;
  private kernel: IExecutionKernelAdapter;
  private workers: IWorkerAdapter;
  private validation?: IValidationAdapter;
  private chat: any;
  private missionCompleteData: any = null;
  public experienceGraph: ExperienceGraph = new ExperienceGraph();

  constructor(apiKey: string, kernel: IExecutionKernelAdapter, workers: IWorkerAdapter, validation?: IValidationAdapter) {
    super();
    this.ai = new GoogleGenAI({ apiKey });
    this.kernel = kernel;
    this.workers = workers;
    this.validation = validation;
  }

  public enablePassiveMode(handler?: (event: any) => void) {
    // Wait for the passive stream. We assume the system will send Events to the coordinator instance.
    this.on('Event.Interaction.Recorded', (event) => {
      if (handler) handler(event);
      // Auto-form hypothesis based on recorded interaction
      if (event.nodeId) {
        this.experienceGraph.addHypothesis({
          snapshotId: event.snapshotId || 'unknown',
          nodeId: event.nodeId,
          semanticRole: 'interacted-element',
          confidence: 1.0
        });
        this.emit('Event.Mission.HypothesisFormed', { hypothesis: `Passive interaction on node ${event.nodeId}` });
      }
    });
  }

  public async start(objective: string) {
    this.missionCompleteData = null;
    let repairAttempts = 0;
    const self = this;
    
    // Capability Check
    let capabilities: Record<string, boolean> = {
        'Navigation': true,
        'Interaction': true,
        'Observation': true,
        'ScriptExecution': true
    };
    
    if (this.kernel.getCapabilities) {
        capabilities = await this.kernel.getCapabilities();
    }
    
    // Prune tools based on capabilities
    let activeTools = CoordinatorToolDeclarations.filter((decl: any) => {
        if (!capabilities['Interaction'] && (decl.name === 'Interaction_click' || decl.name === 'Interaction_type')) return false;
        if (!capabilities['Navigation'] && decl.name === 'Navigation_goto') return false;
        if (!capabilities['Observation'] && decl.name === 'Observation_capture') return false;
        if (!capabilities['ScriptExecution'] && decl.name === 'Validation_evaluate') return false;
        return true;
    });

    const callableTool = {
      tool: async () => ({ functionDeclarations: activeTools }),
      callTool: async (calls: FunctionCall[]): Promise<Part[]> => {
        const parts: Part[] = [];
        
        for (const call of calls) {
          console.log(`[Coordinator Action]: ${call.name}(${JSON.stringify(call.args!)})`);
          let callResult: any = { error: 'Unknown tool' };
          
          try {
            switch (call.name) {
              case 'Observation_capture':
                callResult = await self.kernel.captureObservation(call.args!.levels as string[]);
                break;
              case 'Worker_extractDesignTokens':
                callResult = await self.workers.extractDesignTokens(call.args!.snapshotId as string);
                break;
              case 'Worker_mineComponents':
                callResult = await self.workers.mineComponents(call.args!.snapshotId as string, call.args!.containerNodeId as string);
                break;
              case 'Worker_analyzeLayout':
                callResult = await self.workers.analyzeLayout(call.args!.snapshotId as string, call.args!.containerNodeId as string);
                break;
              case 'Interaction_click':
                callResult = await self.kernel.click(call.args!.nodeId as string);
                break;
              case 'Interaction_type':
                callResult = await self.kernel.type(call.args!.nodeId as string, call.args!.text as string);
                break;
              case 'Navigation_goto':
                callResult = await self.kernel.goto(call.args!.url as string);
                break;
              case 'Validation_evaluate':
                if (self.validation) {
                  callResult = await self.validation.evaluate(call.args!.originalSnapshotId as string, call.args!.reconstructedSnapshotId as string);
                } else {
                  callResult = { error: 'Validation Adapter not configured' };
                }
                break;
              case 'Mission_complete':
                if (self.validation && call.args!.originalSnapshotId && call.args!.reconstructedSnapshotId) {
                  const evalResult = await self.validation.evaluate(call.args!.originalSnapshotId as string, call.args!.reconstructedSnapshotId as string);
                  if (evalResult && evalResult.status === 'ValidationFailed' && repairAttempts < 3) {
                    repairAttempts++;
                    callResult = {
                        error: `ValidationFailed: You must repair the implementation. Attempt ${repairAttempts}/3. Discrepancy report: ${JSON.stringify(evalResult)}`
                      };
                    console.log(`[Coordinator] Repair Loop triggered (${repairAttempts}/3)`);
                    break;
                  }
                }
                console.log(`[Coordinator] Mission Complete: ${call.args!.resultPayload}`);
                self.missionCompleteData = { status: 'completed', payload: call.args!.resultPayload };
                break;
            }
          } catch (e: any) {
            callResult = { error: e.message };
          }

          parts.push({
            functionResponse: {
              id: call.id,
              name: call.name,
              response: callResult
            }
          } as Part);
        }
        
        return parts;
      }
    };
    
    // Add environment capabilities to context
    const dynamicPrompt = `${SYSTEM_PROMPT}\n\nENVIRONMENT CAPABILITIES:\n${JSON.stringify(capabilities, null, 2)}\nIf a capability is false, tools related to it will be unavailable.`;

    this.chat = this.ai.chats.create({
      model: 'gemini-2.5-pro',
      config: {
        systemInstruction: dynamicPrompt,
        tools: [callableTool as any],
        temperature: 0.2
      }
    });

    console.log(`[Coordinator] Starting automated ReAct loop...`);
    const response = await this.chat.sendMessage({ message: `Mission Objective: ${objective}\n\nCurrent Hypotheses: ${JSON.stringify(this.experienceGraph.getAllHypotheses())}` });
    this.emit('Event.Mission.HypothesisFormed', { hypothesis: response.text });
    
    if (this.missionCompleteData) {
      return this.missionCompleteData;
    }
    
    return { status: 'stopped', message: response.text };
  }
}
