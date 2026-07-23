export const observationGraphSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["snapshot", "nodes", "edges"],
  "properties": {
    "snapshot": {
      "type": "object",
      "required": ["id", "timestamp", "url"],
      "properties": {
        "id": { "type": "string" },
        "timestamp": { "type": "number" },
        "url": { "type": "string", "format": "uri" }
      }
    },
    "nodes": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "type", "properties"],
        "properties": {
          "id": { "type": "string" },
          "type": { "type": "string", "enum": ["DOMNode", "StyleNode", "GeometryNode", "A11yNode", "InteractiveNode", "NetworkRequestNode", "ResourceNode", "TemporalNode", "PerformanceNode", "ValidationNode", "SnapshotNode"] },
          "properties": { "type": "object", "additionalProperties": true }
        }
      }
    },
    "edges": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["source", "target", "type"],
        "properties": {
          "source": { "type": "string" },
          "target": { "type": "string" },
          "type": { "type": "string" }
        }
      }
    }
  }
};
