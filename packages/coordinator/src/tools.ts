import { Tool } from '@google/genai';

export const CoordinatorToolDeclarations: Tool[] = [{
  functionDeclarations: [
    {
      name: "Observation_capture",
      description: "Requests a new Snapshot of the current state and returns the Observation Graph snapshotId.",
      parameters: {
        type: "OBJECT" as any,
        properties: {
          levels: { 
            type: "ARRAY" as any, 
            description: "List of extraction levels, e.g., ['DOM', 'A11Y']",
            items: { type: "STRING" as any }
          }
        }
      }
    },
    {
      name: "Worker_extractDesignTokens",
      description: "Dispatches the Design Token worker to extract the global design system.",
      parameters: {
        type: "OBJECT" as any,
        properties: {
          snapshotId: { type: "STRING" as any }
        },
        required: ["snapshotId"]
      }
    },
    {
      name: "Worker_mineComponents",
      description: "Queries the Component Miner worker for a given sub-tree to identify components.",
      parameters: {
        type: "OBJECT" as any,
        properties: {
          snapshotId: { type: "STRING" as any },
          containerNodeId: { type: "STRING" as any }
        },
        required: ["snapshotId", "containerNodeId"]
      }
    },
    {
      name: "Worker_analyzeLayout",
      description: "Queries the Layout Analyzer worker to determine alignment and geometry.",
      parameters: {
        type: "OBJECT" as any,
        properties: {
          snapshotId: { type: "STRING" as any },
          containerNodeId: { type: "STRING" as any }
        },
        required: ["snapshotId", "containerNodeId"]
      }
    },
    {
      name: "Interaction_click",
      description: "Dispatches a click via the Kernel.",
      parameters: {
        type: "OBJECT" as any,
        properties: {
          nodeId: { type: "STRING" as any, description: "The target NodeID from the Observation Graph" }
        },
        required: ["nodeId"]
      }
    },
    {
      name: "Interaction_type",
      description: "Dispatches text input via the Kernel.",
      parameters: {
        type: "OBJECT" as any,
        properties: {
          nodeId: { type: "STRING" as any },
          text: { type: "STRING" as any }
        },
        required: ["nodeId", "text"]
      }
    },
    {
      name: "Navigation_goto",
      description: "Dispatches a top-level navigation via the Kernel.",
      parameters: {
        type: "OBJECT" as any,
        properties: {
          url: { type: "STRING" as any }
        },
        required: ["url"]
      }
    },
    {
      name: "Validation_evaluate",
      description: "Evaluates a reconstructed page against the original using Structural and Visual diffing.",
      parameters: {
        type: "OBJECT" as any,
        properties: {
          originalSnapshotId: { type: "STRING" as any },
          reconstructedSnapshotId: { type: "STRING" as any }
        },
        required: ["originalSnapshotId", "reconstructedSnapshotId"]
      }
    },
    {
      name: "Mission_complete",
      description: "Marks the mission as successful with the result payload.",
      parameters: {
        type: "OBJECT" as any,
        properties: {
          resultPayload: { type: "STRING" as any, description: "Summary or code mapping of the completed mission" }
        },
        required: ["resultPayload"]
      }
    }
  ]
}];
