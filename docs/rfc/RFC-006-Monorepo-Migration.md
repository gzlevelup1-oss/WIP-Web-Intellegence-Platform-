# RFC-006: Monorepo Migration via NPM Workspaces

## 1. Summary
Migrate the single-project repository into a monorepo structure using NPM Workspaces to support scaling, separation of concerns (e.g., UI vs Execution Kernel vs Coordinator), and shared packages.

## 2. Motivation
As the Website Intelligence Platform (WIP) grows, maintaining all components in a single package will lead to tight coupling, conflicting dependencies, and deployment complexities. The Product Owner has requested transitioning to a workspace-based architecture.

## 3. Proposed Structure
```text
/
  package.json (Root Workspace)
  apps/
    browser-lab/ (React/Vite UI + Express Backend)
    coordinator/ (AI Reasoning loop)
  packages/
    core-models/ (Shared TS types, schemas, Observation Graph definitions)
```

## 4. Drawbacks
- Adds overhead to dependency management.
- Requires updating build scripts.

## 5. Alternatives
- Use PNPM Workspaces (rejected: unavailable in current environment).
