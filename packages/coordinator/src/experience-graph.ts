export interface Hypothesis {
  hypothesisId: string;
  snapshotId: string;
  nodeId: string;
  semanticRole: string;
  confidence: number;
  timestamp: number;
}

export class ExperienceGraph {
  private hypotheses: Map<string, Hypothesis> = new Map();

  public addHypothesis(hypothesis: Omit<Hypothesis, 'hypothesisId' | 'timestamp'>): Hypothesis {
    const hypothesisId = `h-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const fullHypothesis: Hypothesis = {
      ...hypothesis,
      hypothesisId,
      timestamp: Date.now()
    };
    this.hypotheses.set(hypothesisId, fullHypothesis);
    return fullHypothesis;
  }

  public getHypothesesForNode(nodeId: string): Hypothesis[] {
    return Array.from(this.hypotheses.values()).filter(h => h.nodeId === nodeId);
  }

  public getAllHypotheses(): Hypothesis[] {
    return Array.from(this.hypotheses.values());
  }

  public resolveExperience(snapshotId: string): Hypothesis[] {
    return Array.from(this.hypotheses.values()).filter(h => h.snapshotId === snapshotId);
  }

  public clear(): void {
    this.hypotheses.clear();
  }
}
