import React, { useState } from 'react';
import { ChevronDown, Send, Globe, Image, FileCode2, Command, Loader2 } from 'lucide-react';
import { useLab } from '../context/LabContext';

export function ChatPane() {
  const [input, setInput] = useState('');
  const { navigateUrl, sendCommand, isLoading, logs } = useLab();

  const handleSubmit = () => {
    if (!input.trim() || isLoading) return;
    
    const cmd = input.trim();
    if (cmd.startsWith('http://') || cmd.startsWith('https://')) {
      navigateUrl(cmd);
    } else {
      sendCommand(cmd);
    }
    
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Session Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <button className="flex items-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 px-2 py-1.5 rounded-md transition-colors text-sm font-medium">
          <span>Current Session</span>
          <ChevronDown className="w-4 h-4 text-zinc-500" />
        </button>
      </div>

      {/* Log View */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {logs.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4">
              <Globe className="w-6 h-6" />
            </div>
            <h2 className="text-sm font-semibold mb-2">Browser Laboratory</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-[240px] mb-6">
              Enter a URL to start an interactive headless session and generate an observation graph.
            </p>
            
            <div className="flex flex-col w-full gap-2">
              <button 
                onClick={() => setInput('https://example.com')}
                className="text-left text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
              >
                <span className="font-medium">Try navigating to</span>
                <span className="text-zinc-500 block mt-0.5">https://example.com</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 font-mono text-xs">
            {logs.map((log, i) => (
              <div key={i} className="text-zinc-600 dark:text-zinc-400 border-l-2 border-blue-500 pl-3 py-1">
                {log}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Artifact Strip */}
      <div className="h-20 border-t border-zinc-200 dark:border-zinc-800 px-4 py-2 flex items-center gap-2 overflow-x-auto bg-zinc-50 dark:bg-zinc-900/50">
        {/* Placeholder for artifacts */}
        <div className="flex-shrink-0 w-16 h-12 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md flex items-center justify-center text-zinc-400">
          <Image className="w-4 h-4" />
        </div>
        <div className="flex-shrink-0 w-16 h-12 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md flex items-center justify-center text-zinc-400">
          <FileCode2 className="w-4 h-4" />
        </div>
      </div>

      {/* Composer */}
      <div className="p-4 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800">
        <div className="relative flex items-end bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/50 transition-shadow">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter URL or command..."
            className="w-full bg-transparent resize-none outline-none py-3 px-3 text-sm min-h-[44px] max-h-[200px]"
            rows={1}
            disabled={isLoading}
          />
          <button 
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 bottom-2 p-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        <div className="flex items-center gap-4 mt-2 px-1 text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
          <div className="flex items-center gap-1">
            <Command className="w-3 h-3" />
            <span>Cmd + Enter to run</span>
          </div>
        </div>
      </div>
    </div>
  );
}
