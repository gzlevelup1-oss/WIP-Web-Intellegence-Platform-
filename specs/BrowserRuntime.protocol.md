# Browser Runtime Protocol Specification

**Version:** 1.0.0-Draft  
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
    "data": { ... }
  }
  ```

### 5.3. Interaction
- **Request:** `Interaction.click`
  - *Params:* `{"sessionId": "sess-123", "nodeId": "node-45"}`
- **Request:** `Interaction.type`
  - *Params:* `{"sessionId": "sess-123", "nodeId": "node-45", "text": "hello world"}`

### 5.4. Viewport
- **Request:** `Viewport.scroll`
  - *Params:* `{"sessionId": "sess-123", "distanceY": 500}`

## 6. Event Stream
- **`Event.Network.RequestSent`** / **`Event.Network.ResponseReceived`**
- **`Event.Page.Console`**
- **`Event.Lifecycle.FontsReady`**
- **`Event.Lifecycle.AnimationsStable`**

## 7. Error Codes
| Code | Category |
| :--- | :--- |
| `-32601` | MethodNotFound |
| `4001` | NavigationError |
| `4002` | TimeoutError |
| `4005` | UnsupportedCapabilityError |
| `5001` | BrowserCrashError |
