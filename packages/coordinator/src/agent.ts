import { GoogleGenAI, Type, FunctionCall, Part } from '@google/genai';
import { CoordinatorToolDeclarations } from './tools.js';
import { IExecutionKernelAdapter, IWorkerAdapter, IValidationAdapter } from './adapter.js';

const SYSTEM_PROMPT = `You are the Coordinator Agent for the Website Intelligence Platform.
Your purpose is to probabilistically orchestrate the extraction of semantic data and interaction with web pages using a deterministic Execution Kernel and Specialized Workers.
RULES:
1. You MUST NOT generate Playwright, Puppeteer, or JavaScript code.
2. You MUST reference elements by NodeID provided by the Observation Graph or Workers.
3. You operate in a Reason + Act loop. You will be given tools to observe, analyze, and interact.
4. When you have completed the objective, call Mission_complete. Provide originalSnapshotId and reconstructedSnapshotId if applicable.`;

export class CoordinatorAgent {
  private ai: GoogleGenAI;
  private kernel: IExecutionKernelAdapter;
  private workers: IWorkerAdapter;
  private validation?: IValidationAdapter;
  private chat: any;
  private missionCompleteData: any = null;

  constructor(apiKey: string, kernel: IExecutionKernelAdapter, workers: IWorkerAdapter, validation?: IValidationAdapter) {
    this.ai = new GoogleGenAI({ apiKey });
    this.kernel = kernel;
    this.workers = workers;
    this.validation = validation;
  }

  public async start(objective: string) {
    this.missionCompleteData = null;
    let repairAttempts = 0;

    const self = this;

    const callableTool = {
      tool: async () => CoordinatorToolDeclarations[0],
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

          // Use the `Part` factory or just construct the object
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

    this.chat = this.ai.chats.create({
      model: 'gemini-2.5-pro',
      config: {
        systemInstruction: SYSTEM_PROMPT,
        tools: [callableTool as any],
        temperature: 0.2
      }
    });

    console.log(`[Coordinator] Starting automated ReAct loop...`);
    const response = await this.chat.sendMessage({ message: `Mission Objective: ${objective}` });
    
    if (this.missionCompleteData) {
      return this.missionCompleteData;
    }
    
    return { status: 'stopped', message: response.text };
  }
}
