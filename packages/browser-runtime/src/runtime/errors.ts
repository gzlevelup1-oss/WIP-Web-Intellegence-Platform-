export class BrowserLaunchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BrowserLaunchError';
  }
}

export class SessionNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SessionNotFoundError';
  }
}

export class NavigationTimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NavigationTimeoutError';
  }
}

export class BrowserExecutionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BrowserExecutionError';
  }
}
