# Browser Runtime Protocol Specification

**Version:** 1.0.0-Locked  
**Protocol Type:** Message-based RPC (JSON-RPC 2.0 compatible)  

## 1. Overview
Defines the formal communication contract between the Coordinator and the Browser Runtime. It answers *how* messages are exchanged.

## 2. Protocol Envelopes
Standard JSON-RPC 2.0 structures for `Request`, `Response`, `Error`, and `Event`.

## 3. Discovery & Metadata
Before establishing a session, the Coordinator queries the Runtime capabilities.

### 3.1. Metadata
- **Request:** `Runtime.getMetadata`
- **Response:** `{"runtimeId": "rt-1", "browserVersion": "120.0", "protocolVersion": "1.0", "platform": "linux", "userAgent": "..."}`

### 3.2. Capabilities
- **Request:** `Runtime.getCapabilities`
- **Response:** `{"capabilities": {"Navigation": true, "Accessibility": true, "WebGL": false}}`

## 4. Session
Sessions isolate browser context.

### 4.1. Session Management
- **Request:** `Session.create` / `Session.destroy`

## 5. Capability Messages

### 5.1. Navigation
- **Request:** `Navigation.open`
- **Params:** `{"sessionId": "sess-123", "url": "https://example.com"}`

### 5.2. Observation & Snapshots
Observations output an immutable Snapshot reference.

- **Request:** `Observation.capture`
  - *Params:* `{"sessionId": "sess-123", "levels": [0, 1, 2, 3]}`
- **Response:**
  ```json
  {
    "snapshotId": "snap-abc",
    "timestamp": 1690000001,
    "hash": "sha256-xyz...",
    "graph": {
      "nodes": [
        { "id": "node-1", "type": "DOMNode", "properties": { "tagName": "body" } },
        { "id": "a1", "type": "A11yNode", "properties": { "role": "document" } }
      ],
      "edges": [
        { "source": "node-1", "target": "a1", "type": "HAS_A11Y" }
      ]
    }
  }
  ```

### 5.3. Interaction
- **Request:** `Interaction.click`
  - *Params:* `{"sessionId": "sess-123", "nodeId": "node-45", "modifiers": ["shift"]}`
- **Request:** `Interaction.type`
  - *Params:* `{"sessionId": "sess-123", "nodeId": "node-45", "text": "hello world", "delay": 10}`

### 5.4. Viewport
- **Request:** `Viewport.scroll`
  - *Params:* `{"sessionId": "sess-123", "distanceY": 500, "behavior": "smooth"}`

## 6. Event Stream
The runtime emits real-time events over a WebSocket or SSE connection.

- **`Event.Network.RequestSent`** 
  - *Payload:* `{"requestId": "req-1", "url": "https://...", "method": "GET"}`
- **`Event.Network.ResponseReceived`**
  - *Payload:* `{"requestId": "req-1", "status": 200, "mimeType": "application/json"}`
- **`Event.Page.Console`**
  - *Payload:* `{"type": "error", "message": "Failed to load resource"}`
- **`Event.Lifecycle.FontsReady`**
  - *Payload:* `{"timestamp": 1690000005}`
- **`Event.Lifecycle.AnimationsStable`**
  - *Payload:* `{"timestamp": 1690000006}`

## 7. Error Codes
| Code | Category |
| :--- | :--- |
| `-32601` | MethodNotFound |
| `4001` | NavigationError |
| `4002` | TimeoutError |
| `4005` | UnsupportedCapabilityError |
| `5001` | BrowserCrashError |
