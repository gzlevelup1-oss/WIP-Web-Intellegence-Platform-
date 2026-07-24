export interface ICapabilityAdapter {
  getCapabilities(sessionId: string): Promise<Record<string, boolean>>;
}
