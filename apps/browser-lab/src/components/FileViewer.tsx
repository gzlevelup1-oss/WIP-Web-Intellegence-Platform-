import React, { useState } from 'react';
import { Monitor, Tablet, Smartphone, ZoomIn, ZoomOut, Maximize, MousePointer2, Frame, Eye, Code, List, Globe, CheckSquare } from 'lucide-react';
import { ObservationInspector } from './ObservationInspector';
import { useLab } from '../context/LabContext';

type ViewMode = 'visual' | 'dom' | 'logs' | 'diff';
type ViewportSize = 'desktop' | 'tablet' | 'mobile';

export function FileViewer() {
  const [mode, setMode] = useState<ViewMode>('visual');
  const [viewport, setViewport] = useState<ViewportSize>('desktop');
  const [zoom, setZoom] = useState(100);
  const { currentUrl, isLoading, screenshotUrl, logs, graph } = useLab();

  return (
    <div className="flex flex-col h-full bg-zinc-100 dark:bg-zinc-900/50">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 h-12 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 flex-shrink-0">
        
        {/* Left: Meta */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-zinc-500">{currentUrl ? new URL(currentUrl).hostname : 'No session'}</span>
        </div>

        {/* Center: Actions/Tabs */}
        <div className="flex items-center gap-6">
          
          {/* Viewport Toggles */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 rounded-md p-0.5">
            <button 
              onClick={() => setViewport('desktop')}
              className={`p-1.5 rounded-sm transition-colors ${viewport === 'desktop' ? 'bg-white dark:bg-zinc-800 shadow-sm text-blue-600 dark:text-blue-400' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
              title="Desktop View"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewport('tablet')}
              className={`p-1.5 rounded-sm transition-colors ${viewport === 'tablet' ? 'bg-white dark:bg-zinc-800 shadow-sm text-blue-600 dark:text-blue-400' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
              title="Tablet View"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewport('mobile')}
              className={`p-1.5 rounded-sm transition-colors ${viewport === 'mobile' ? 'bg-white dark:bg-zinc-800 shadow-sm text-blue-600 dark:text-blue-400' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
              title="Mobile View"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800" />

          {/* Zoom Controls */}
          <div className="flex items-center gap-1">
            <button className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors rounded hover:bg-zinc-100 dark:hover:bg-zinc-800">
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono w-12 text-center text-zinc-600 dark:text-zinc-400">{zoom}%</span>
            <button className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors rounded hover:bg-zinc-100 dark:hover:bg-zinc-800">
              <ZoomIn className="w-4 h-4" />
            </button>
            <button className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 ml-1" title="Fit to Screen">
              <Maximize className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800" />

          {/* Mode Tabs */}
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setMode('visual')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${mode === 'visual' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
            >
              <Eye className="w-3.5 h-3.5" />
              Preview
            </button>
            <button 
              onClick={() => setMode('dom')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${mode === 'dom' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
            >
              <Code className="w-3.5 h-3.5" />
              Inspector
            </button>
            <button 
              onClick={() => setMode('logs')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${mode === 'logs' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
            >
              <List className="w-3.5 h-3.5" />
              Logs
            </button>
            <button 
              onClick={() => setMode('diff')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${mode === 'diff' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              Validation
            </button>
          </div>
          
        </div>

        {/* Right empty for balance */}
        <div className="w-[100px]" />
      </div>

      {/* Stage Area */}
      <div className={`flex-1 relative ${mode === 'visual' || mode === 'diff' ? 'overflow-auto flex items-center justify-center p-8' : 'flex'}`}>
        
        {mode === 'visual' && (
          <div className="relative shadow-2xl bg-white transition-all duration-300" style={{
            width: viewport === 'desktop' ? 1200 : viewport === 'tablet' ? 768 : 375,
            height: viewport === 'desktop' ? 800 : viewport === 'tablet' ? 1024 : 812,
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'center center'
          }}>
            {/* Overlay Toolbar (Preview Draw Dock) */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center bg-zinc-900/90 text-white rounded-full px-2 py-1.5 shadow-xl backdrop-blur-md gap-1 border border-white/10 z-10">
              <button className="p-2 rounded-full hover:bg-white/10 transition-colors text-zinc-300 hover:text-white" title="Select Element">
                <MousePointer2 className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-full hover:bg-white/10 transition-colors text-zinc-300 hover:text-white" title="Draw Box">
                <Frame className="w-4 h-4" />
              </button>
            </div>

            {/* Empty placeholder for the screenshot */}
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-50 border border-zinc-200">
              {screenshotUrl ? (
                <img src={screenshotUrl} alt="Viewport Snapshot" className="w-full h-full object-cover" />
              ) : (
                <div className="text-zinc-400 flex flex-col items-center gap-3">
                  <Globe className="w-12 h-12 opacity-50" />
                  <p className="text-sm">{isLoading ? 'Simulating browser session...' : 'No active session'}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {mode === 'dom' && (
          <div className="flex-1 w-full h-full relative">
            <ObservationInspector />
          </div>
        )}

        {mode === 'logs' && (
          <div className="absolute inset-0 bg-white dark:bg-zinc-950 p-6 overflow-auto">
             <div className="max-w-4xl mx-auto">
              <h3 className="text-sm font-semibold mb-4 text-zinc-800 dark:text-zinc-200">Execution Logs</h3>
              <div className="text-xs font-mono text-zinc-500 bg-zinc-50 dark:bg-zinc-900 p-4 rounded border border-zinc-200 dark:border-zinc-800 min-h-[600px] flex flex-col gap-2">
                {logs.length === 0 ? (
                  <div className="h-full flex items-center justify-center">No logs available</div>
                ) : (
                  logs.map((log, i) => (
                    <div key={i} className="text-zinc-600 dark:text-zinc-400">
                      <span className="text-zinc-400 mr-2">[{new Date().toISOString().split('T')[1].split('.')[0]}]</span>
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {mode === 'diff' && (
          <div className="absolute inset-0 bg-zinc-50 dark:bg-zinc-900/50 p-8 overflow-auto flex flex-col">
            <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Validation Suite</h3>
                  <p className="text-sm text-zinc-500">Visual comparison between design baseline and current snapshot.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-xs font-medium text-red-500 bg-red-50 dark:bg-red-500/10 px-2 py-1 rounded border border-red-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    2 Differences
                  </span>
                  <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded border border-green-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    98% Match
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 flex-1">
                {/* Baseline */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Baseline (Expected)</h4>
                  </div>
                  <div className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden relative shadow-sm">
                    {screenshotUrl ? (
                      <div className="relative w-full h-full">
                        <img src={screenshotUrl} alt="Baseline" className="w-full h-full object-cover opacity-90 filter grayscale-[20%]" />
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-zinc-400">
                        <Globe className="w-8 h-8 opacity-20" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Current Snapshot */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Current (Actual)</h4>
                  </div>
                  <div className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden relative shadow-sm">
                    {screenshotUrl ? (
                      <div className="relative w-full h-full">
                        <img src={screenshotUrl} alt="Current" className="w-full h-full object-cover" />
                        {/* Fake diff highlights for prototype */}
                        <div className="absolute top-[20%] left-[30%] w-32 h-12 border-2 border-red-500 bg-red-500/20 rounded animate-pulse"></div>
                        <div className="absolute top-[60%] left-[10%] w-48 h-24 border-2 border-red-500 bg-red-500/20 rounded animate-pulse"></div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-zinc-400">
                        <Globe className="w-8 h-8 opacity-20" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
