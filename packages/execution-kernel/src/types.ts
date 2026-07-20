

export type TransactionStatus = 'PENDING' | 'ACTIVE' | 'COMMITTED' | 'ABORTING' | 'ABORTED';

export interface BrowserAction {
  type: 'navigate' | 'click' | 'type' | 'snapshot' | 'evaluate';
  payload?: any;
}

export interface ActionResult {
  success: boolean;
  data?: any;
  error?: string;
}
