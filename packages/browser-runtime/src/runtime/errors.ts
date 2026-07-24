export class RuntimeError extends Error {
  public code: number;
  constructor(message: string, code: number = -32000) {
    super(message);
    this.name = 'RuntimeError';
    this.code = code;
  }
}

export class NavigationError extends RuntimeError {
  constructor(message: string) {
    super(message, 4001);
    this.name = 'NavigationError';
  }
}

export class TimeoutError extends RuntimeError {
  constructor(message: string) {
    super(message, 4002);
    this.name = 'TimeoutError';
  }
}

export class UnsupportedCapabilityError extends RuntimeError {
  constructor(message: string) {
    super(message, 4005);
    this.name = 'UnsupportedCapabilityError';
  }
}

export class BrowserCrashError extends RuntimeError {
  constructor(message: string) {
    super(message, 5001);
    this.name = 'BrowserCrashError';
  }
}

export class NetworkError extends RuntimeError {
  constructor(message: string) {
    super(message, 4003); // Picking arbitrary for network since spec doesn't give a specific one, or let's use 4000 series
    this.name = 'NetworkError';
  }
}

export class PermissionError extends RuntimeError {
  constructor(message: string) {
    super(message, 4004);
    this.name = 'PermissionError';
  }
}

export class ObservationError extends RuntimeError {
  constructor(message: string) {
    super(message, 4006);
    this.name = 'ObservationError';
  }
}

// Additional necessary runtime errors
export class SessionNotFoundError extends RuntimeError {
  constructor(message: string) {
    super(message, -32602); // Invalid params equivalent in JSON-RPC
    this.name = 'SessionNotFoundError';
  }
}

export class BrowserLaunchError extends RuntimeError {
  constructor(message: string) {
    super(message, 5002);
    this.name = 'BrowserLaunchError';
  }
}

export class MethodNotFoundError extends RuntimeError {
  constructor(message: string) {
    super(message, -32601);
    this.name = 'MethodNotFoundError';
  }
}
