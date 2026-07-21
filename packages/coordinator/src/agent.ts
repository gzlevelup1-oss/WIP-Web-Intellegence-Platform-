import { GoogleGenAI } from '@google/genai';
import { CoordinatorToolDeclarations } from './tools.js';
import { IExecutionKernelAdapter, IWorkerAdapter, IValidationAdapter } from './adapter.js';

const SYSTEM_PROMPT = `
You are the Coordinator Agent for the Website Intelligence Platform.
Your purpose is to probabilistically orchestrate the extraction of semantic data and interaction with web pages using a deterministic Execution Kernel and Specialized Workers.

RULES:
1. You MUST NOT generate Playwright, Puppeteer, or JavaScript code.
2. You MUST reference elements by NodeID provided by the Observation Graph or Workers.
3. You operate in a Reason + Act loop. You will be given tools to observe, analyze, and interact.
4. When you have completed the objective, call Mission_complete.
`;

export class CoordinatorAgent {
  private ai: GoogleGenAI;
  private kernel: IExecutionKernelAdapter;
  private workers: IWorkerAdapter;
  private validation?: IValidationAdapter;
  private chat: any;

  constructor(apiKey: string, kernel: IExecutionKernelAdapter, workers: IWorkerAdapter, validation?: IValidationAdapter) {
    this.ai = new GoogleGenAI({ apiKey });
    this.kernel = kernel;
    this.workers = workers;
    this.validation = validation;
  }

  public start(objective: string) {
    this.chat = this.ai.chats.create({
      model: 'gemini-2.5-pro',
      config: {
        systemInstruction: SYSTEM_PROMPT,
        tools: CoordinatorToolDeclarations,
        temperature: 0.2
      }
    });

    return this.runLoop(`Mission Objective: ${objective}`);
  }

  private async runLoop(message: string): Promise<any> {
    let currentMessage: any = message;
    
    while (true) {
      console.log(`[Coordinator] Sending prompt...`);
      const response = await this.chat.sendMessage({ message: currentMessage });
      console.log(`[Coordinator] Received response.`);
      
      if (response.text) {
        console.log(`[Coordinator Thought]: ${response.text}`);
      }

      const calls = response.functionCalls;
      if (!calls || calls.length === 0) {
        if (response.text) {
          return { status: 'stopped', message: response.text };
        }
        break;
      }

      const results = [];
      for (const call of calls) {
        console.log(`[Coordinator Action]: ${call.name}(${JSON.stringify(call.args)})`);
        let callResult: any = { error: 'Unknown tool' };
        
        try {
          switch (call.name) {
            case 'Observation_capture':
              callResult = await this.kernel.captureObservation(call.args.levels);
              break;
            case 'Worker_extractDesignTokens':
              callResult = await this.workers.extractDesignTokens(call.args.snapshotId);
              break;
            case 'Worker_mineComponents':
              callResult = await this.workers.mineComponents(call.args.snapshotId, call.args.containerNodeId);
              break;
            case 'Worker_analyzeLayout':
              callResult = await this.workers.analyzeLayout(call.args.snapshotId, call.args.containerNodeId);
              break;
            case 'Interaction_click':
              callResult = await this.kernel.click(call.args.nodeId);
              break;
            case 'Interaction_type':
              callResult = await this.kernel.type(call.args.nodeId, call.args.text);
              break;
            case 'Navigation_goto':
              callResult = await this.kernel.goto(call.args.url);
              break;
            case 'Validation_evaluate':
              if (this.validation) {
                callResult = await this.validation.evaluate(call.args.originalSnapshotId, call.args.reconstructedSnapshotId);
              } else {
                callResult = { error: 'Validation Adapter not configured' };
              }
              break;
            case 'Mission_complete':
              console.log(`[Coordinator] Mission Complete: ${call.args.resultPayload}`);
              return { status: 'completed', payload: call.args.resultPayload };
          }
        } catch (e: any) {
          callResult = { error: e.message };
        }
        
        results.push({
          id: call.id,
          name: call.name,
          response: callResult
        });
      }
      currentMessage = results;
    }
  }
}
