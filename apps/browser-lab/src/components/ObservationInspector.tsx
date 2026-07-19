import React, { useMemo } from 'react';
import * as reactWindow from 'react-window';
const { FixedSizeList: List } = reactWindow as any;
import { AutoSizer } from './AutoSizer';
import { ChevronRight, ChevronDown, Layers } from 'lucide-react';
import { useLab, ObservationGraph } from '../context/LabContext';

interface InspectorRowProps {
  index: number;
  style: React.CSSProperties;
  data: ObservationGraph['nodes'];
}

const InspectorRow = ({ index, style, data }: InspectorRowProps) => {
  const node = data[index];
  const props = node.properties || {};
  const depth = props.depth || 0;
  const isDOM = node.type === 'DOMNode';
  
  return (
    <div 
      style={style} 
      className="flex items-center px-4 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer font-mono text-xs border-b border-transparent dark:hover:border-zinc-800 transition-colors"
    >
      <div 
        style={{ paddingLeft: `${depth * 16}px` }}
        className="flex items-center w-full whitespace-nowrap overflow-hidden text-ellipsis"
      >
        <button className="p-0.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 mr-1">
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
        {isDOM ? (
          <>
            <span className="text-blue-600 dark:text-blue-400 font-medium">
              &lt;{props.tagName}&gt;
            </span>
            {props.classes && props.classes.length > 0 && (
              <span className="text-amber-600 dark:text-amber-400 ml-2">
                .{props.classes.join('.')}
              </span>
            )}
            {props.text && (
              <span className="text-zinc-500 ml-2 truncate">
                "{props.text}"
              </span>
            )}
          </>
        ) : (
          <span className="text-purple-600 dark:text-purple-400 font-medium">
            [{node.type}] {node.id}
          </span>
        )}
      </div>
    </div>
  );
};

export function ObservationInspector() {
  const { graph, isLoading } = useLab();
  const flattenedNodes = useMemo(() => graph ? graph.nodes : [], [graph]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950 w-full overflow-hidden">
      {/* Inspector Header */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
        <Layers className="w-4 h-4 text-zinc-500" />
        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
          Observation Graph {graph ? `(${flattenedNodes.length} nodes, ${graph.edges.length} edges)` : ''}
        </span>
      </div>
      
      {/* Virtualized List */}
      <div className="flex-1 w-full h-full relative">
        {!graph && !isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center text-xs font-mono text-zinc-500">
            Waiting for snapshot...
          </div>
        ) : isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center text-xs font-mono text-zinc-500">
            Simulating capture...
          </div>
        ) : (
          <AutoSizer>
            {({ height, width }) => (
              <List
                height={height}
                width={width}
                itemCount={flattenedNodes.length}
                itemSize={28}
                itemData={flattenedNodes}
              >
                {InspectorRow}
              </List>
            )}
          </AutoSizer>
        )}
      </div>
    </div>
  );
}
