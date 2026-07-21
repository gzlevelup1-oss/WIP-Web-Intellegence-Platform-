import { BrowserAction, ActionResult } from './types.js';

export type TaskStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export class Task {
  public id: string;
  public actions: BrowserAction[];
  public status: TaskStatus;

  constructor(actions: BrowserAction[]) {
    this.id = `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    this.actions = actions;
    this.status = 'PENDING';
  }
}
