import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ObservationGraph {
  snapshot: {
    id: string;
    timestamp: number;
    url: string;
  };
  nodes: {
    id: string;
    type: string;
    properties: any;
  }[];
  edges: {
    source: string;
    target: string;
    type: string;
  }[];
}

interface LabState {
  currentUrl: string;
  sessionId: string | null;
  isLoading: boolean;
  graph: ObservationGraph | null;
  logs: string[];
  screenshotBase64: string | null;
  error: string | null;
  validationResult: any | null;
}

interface LabContextType extends LabState {
  navigateUrl: (url: string) => Promise<void>;
  sendCommand: (command: string) => Promise<void>;
  validateSnapshot: () => Promise<void>;
  clearSession: () => void;
}

const LabContext = createContext<LabContextType | undefined>(undefined);

export function LabProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LabState>({
    currentUrl: '',
    sessionId: null,
    isLoading: false,
    graph: null,
    logs: [],
    screenshotBase64: null,
    error: null,
    validationResult: null
  });

  const navigateUrl = async (url: string) => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      currentUrl: url,
      logs: [...prev.logs, `Navigating to ${url}...`],
      error: null,
      validationResult: null
    }));
    try {
      const res = await fetch('/api/simulator/snapshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to capture snapshot');
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        sessionId: data.sessionId,
        graph: data.graph,
        logs: [...prev.logs, ...(data.logs || [])],
        screenshotBase64: data.screenshotBase64,
      }));
    } catch (e: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: e.message,
        logs: [...prev.logs, `Error: ${e.message}`]
      }));
    }
  };

  const sendCommand = async (command: string) => {
    if (!state.sessionId || !state.graph?.snapshot?.id) {
       setState(prev => ({...prev, error: 'No active session or snapshot.', logs: [...prev.logs, 'Error: No active session.']}));
       return;
    }
    setState(prev => ({
      ...prev,
      isLoading: true,
      logs: [...prev.logs, `> ${command}`],
      error: null,
    }));
    try {
      const res = await fetch('/api/simulator/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, snapshotId: state.graph.snapshot.id, sessionId: state.sessionId }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Command failed');
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        graph: data.graph || prev.graph,
        screenshotBase64: data.screenshotBase64 || prev.screenshotBase64,
        logs: [...prev.logs, ...(data.logs || [])],
      }));
    } catch (e: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: e.message,
        logs: [...prev.logs, `Error: ${e.message}`]
      }));
    }
  };

  const validateSnapshot = async () => {
     if (!state.graph || !state.screenshotBase64) return;
     try {
       setState(prev => ({...prev, logs: [...prev.logs, 'Running validation engine...']}));
       const res = await fetch('/api/validation/evaluate', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ 
           originalGraph: state.graph, 
           reconstructedGraph: state.graph, // Mock self-diff for now
           originalScreenshotBase64: state.screenshotBase64,
           reconstructedScreenshotBase64: state.screenshotBase64
         })
       });
       const data = await res.json();
       if (data.success) {
          setState(prev => ({...prev, validationResult: data.result, logs: [...prev.logs, 'Validation complete.']}));
       }
     } catch (e: any) {
       setState(prev => ({...prev, error: e.message, logs: [...prev.logs, `Validation Error: ${e.message}`]}));
     }
  };

  const clearSession = () => {
    setState({
      currentUrl: '',
      sessionId: null,
      isLoading: false,
      graph: null,
      logs: [],
      screenshotBase64: null,
      error: null,
      validationResult: null
    });
  };

  return (
    <LabContext.Provider value={{ ...state, navigateUrl, sendCommand, validateSnapshot, clearSession }}>
      {children}
    </LabContext.Provider>
  );
}

export function useLab() {
  const context = useContext(LabContext);
  if (context === undefined) {
    throw new Error('useLab must be used within a LabProvider');
  }
  return context;
}
