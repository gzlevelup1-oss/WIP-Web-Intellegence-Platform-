import { Tool, Type } from '@google/genai';

export const CoordinatorToolDeclarations: Tool[] = [
{
  functionDeclarations: [
    {
      name: "Observation_capture",
      description: "Requests a new Snapshot of the current state and returns the Observation Graph snapshotId.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          levels: { 
            type: Type.ARRAY, 
            description: "List of extraction levels, e.g., ['DOM', 'A11Y']",
            items: { type: Type.STRING }
          }
        }
      }
    },
    {
      name: "Worker_extractDesignTokens",
      description: "Dispatches the Design Token worker to extract the global design system.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          snapshotId: { type: Type.STRING }
        },
        required: ["snapshotId"]
      }
    },
    {
      name: "Worker_mineComponents",
      description: "Queries the Component Miner worker for a given sub-tree to identify components.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          snapshotId: { type: Type.STRING },
          containerNodeId: { type: Type.STRING }
        },
        required: ["snapshotId", "containerNodeId"]
      }
    },
    {
      name: "Worker_analyzeLayout",
      description: "Queries the Layout Analyzer worker to determine alignment and geometry.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          snapshotId: { type: Type.STRING },
          containerNodeId: { type: Type.STRING }
        },
        required: ["snapshotId", "containerNodeId"]
      }
    },
    {
      name: "Interaction_click",
      description: "Dispatches a click via the Kernel.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          nodeId: { type: Type.STRING, description: "The target NodeID from the Observation Graph" }
        },
        required: ["nodeId"]
      }
    },
    {
      name: "Interaction_type",
      description: "Dispatches text input via the Kernel.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          nodeId: { type: Type.STRING },
          text: { type: Type.STRING }
        },
        required: ["nodeId", "text"]
      }
    },
    {
      name: "Navigation_goto",
      description: "Dispatches a top-level navigation via the Kernel.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          url: { type: Type.STRING }
        },
        required: ["url"]
      }
    },
    {
      name: "Validation_evaluate",
      description: "Evaluates a reconstructed page against the original using Structural and Visual diffing.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          originalSnapshotId: { type: Type.STRING },
          reconstructedSnapshotId: { type: Type.STRING }
        },
        required: ["originalSnapshotId", "reconstructedSnapshotId"]
      }
    },
    {
      name: "Mission_complete",
      description: "Marks the mission as successful. Validates the result if snapshot IDs are provided.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          resultPayload: { type: Type.STRING, description: "Summary or code mapping of the completed mission" },
          originalSnapshotId: { type: Type.STRING },
          reconstructedSnapshotId: { type: Type.STRING }
        },
        required: ["resultPayload"]
      }
    }
  ]
}
];
