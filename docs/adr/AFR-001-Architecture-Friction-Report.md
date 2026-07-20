# AFR-001: Architecture Friction Report Protocol

**Status:** Active
**Owner:** Architecture

## 1. Purpose
When the architecture cannot be preserved during implementation, the implementor must stop and produce an official Architecture Friction Report (AFR) instead of introducing workarounds. This promotes architectural conflicts into tracked engineering work.

## 2. AFR Schema
An Architecture Friction Report must contain:
*   **Violated Invariant:** Which architectural rule or boundary is causing friction.
*   **Why implementation cannot proceed:** The specific technical blocker.
*   **Candidate Solutions:** Potential ways to resolve the issue (including changing the architecture or changing the implementation).
*   **Architectural Tradeoffs:** Pros and cons of the candidate solutions.
*   **Recommendation:** The proposed path forward.

## 3. Workflow & Statuses
An AFR moves through the following statuses:
1.  **Draft:** Initial discovery of friction.
2.  **Review:** Waiting for architectural decision.
3.  **Approved:** Decision made to change architecture or adopt a specific solution.
4.  **Rejected:** Decision made to reject the proposed workaround and enforce the original architecture.
