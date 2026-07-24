import { IBrowserRuntime } from '../contracts/IBrowserRuntime.js';
import { JsonRpcRequest, JsonRpcResponse, JsonRpcEvent } from './jsonRpcTypes.js';
import { RuntimeError, MethodNotFoundError } from './errors.js';

export class JsonRpcServer {
  private runtime: IBrowserRuntime;
  private sendMessage: (message: string) => void;

  constructor(runtime: IBrowserRuntime, sendMessage: (message: string) => void) {
    this.runtime = runtime;
    this.sendMessage = sendMessage;
    
    // Wire up events
    const eventTypes = [
      'Event.Network.RequestSent',
      'Event.Network.ResponseReceived',
      'Event.Page.Console',
      'Event.Lifecycle.FontsReady',
      'Event.Lifecycle.AnimationsStable'
    ];
    
    eventTypes.forEach(eventType => {
      this.runtime.on(eventType, (event) => {
        const rpcEvent: JsonRpcEvent = {
          jsonrpc: '2.0',
          method: eventType,
          params: event.payload
        };
        this.sendMessage(JSON.stringify(rpcEvent));
      });
    });
  }

  public async handleMessage(message: string): Promise<void> {
    let req: JsonRpcRequest;
    try {
      req = JSON.parse(message);
    } catch (err) {
      this.sendError(null, -32700, 'Parse error');
      return;
    }

    if (req.jsonrpc !== '2.0' || !req.method) {
      this.sendError(req.id || null, -32600, 'Invalid Request');
      return;
    }

    try {
      const result = await this.dispatch(req.method, req.params);
      if (req.id !== undefined) {
        const response: JsonRpcResponse = {
          jsonrpc: '2.0',
          id: req.id,
          result: result || null
        };
        this.sendMessage(JSON.stringify(response));
      }
    } catch (error: any) {
      if (req.id !== undefined) {
        const code = error instanceof RuntimeError ? error.code : -32000;
        this.sendError(req.id, code, error.message, error.stack);
      }
    }
  }

  private async dispatch(method: string, params: any): Promise<any> {
    switch (method) {
      case 'Runtime.getMetadata':
        return await this.runtime.getMetadata();
      case 'Runtime.getCapabilities':
        return await this.runtime.getCapabilities();
      case 'Session.create':
        return { sessionId: await this.runtime.createSession() };
      case 'Session.destroy':
        if (!params || !params.sessionId) throw new RuntimeError('Missing sessionId', -32602);
        await this.runtime.closeSession(params.sessionId);
        return { success: true };
      case 'Navigation.open':
        if (!params || !params.sessionId || !params.url) throw new RuntimeError('Missing params', -32602);
        await this.runtime.navigate(params.sessionId, params.url);
        return { success: true };
      case 'Observation.capture':
        if (!params || !params.sessionId || !params.levels) throw new RuntimeError('Missing params', -32602);
        return await this.runtime.capture(params.sessionId, params.levels);
      case 'Interaction.click':
        if (!params || !params.sessionId || !params.nodeId) throw new RuntimeError('Missing params', -32602);
        await this.runtime.click(params.sessionId, params.nodeId, params.modifiers);
        return { success: true };
      case 'Interaction.type':
        if (!params || !params.sessionId || !params.nodeId || !params.text) throw new RuntimeError('Missing params', -32602);
        await this.runtime.type(params.sessionId, params.nodeId, params.text, params.delay);
        return { success: true };
      case 'Session.createCheckpoint':
        if (!params || !params.sessionId) throw new RuntimeError('Missing sessionId', -32602);
        return await this.runtime.createCheckpoint(params.sessionId);
      case 'Session.restoreCheckpoint':
        if (!params || !params.sessionId || !params.checkpoint) throw new RuntimeError('Missing params', -32602);
        await this.runtime.restoreCheckpoint(params.sessionId, params.checkpoint, params.options);
        return { success: true };

      case 'Viewport.scroll':
        if (!params || !params.sessionId || typeof params.distanceY !== 'number') throw new RuntimeError('Missing params', -32602);
        await this.runtime.scroll(params.sessionId, params.distanceY, params.behavior);
        return { success: true };
      default:
        throw new MethodNotFoundError(`Method ${method} not found`);
    }
  }

  private sendError(id: string | number | null, code: number, message: string, data?: any) {
    const response: JsonRpcResponse = {
      jsonrpc: '2.0',
      id,
      error: { code, message, data }
    };
    this.sendMessage(JSON.stringify(response));
  }
}
