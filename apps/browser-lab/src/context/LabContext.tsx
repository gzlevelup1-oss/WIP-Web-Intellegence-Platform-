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
  isLoading: boolean;
  graph: ObservationGraph | null;
  logs: string[];
  screenshotUrl: string | null;
  error: string | null;
}

interface LabContextType extends LabState {
  navigateUrl: (url: string) => Promise<void>;
  sendCommand: (command: string) => Promise<void>;
  clearSession: () => void;
}

const LabContext = createContext<LabContextType | undefined>(undefined);

export function LabProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LabState>({
    currentUrl: '',
    isLoading: false,
    graph: null,
    logs: [],
    screenshotUrl: null,
    error: null,
  });

  const navigateUrl = async (url: string) => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      currentUrl: url,
      logs: [...prev.logs, `Running simulation for ${url}...`],
      error: null,
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
        graph: data.graph,
        logs: [...prev.logs, ...data.logs],
        screenshotUrl: data.screenshotUrl,
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
        body: JSON.stringify({ command, graph: state.graph }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Command failed');
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        logs: [...prev.logs, ...data.logs],
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

  const clearSession = () => {
    setState({
      currentUrl: '',
      isLoading: false,
      graph: null,
      logs: [],
      screenshotUrl: null,
      error: null,
    });
  };

  return (
    <LabContext.Provider value={{ ...state, navigateUrl, sendCommand, clearSession }}>
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
