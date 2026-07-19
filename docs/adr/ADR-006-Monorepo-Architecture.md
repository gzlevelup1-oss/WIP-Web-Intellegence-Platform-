# ADR-006: Monorepo Architecture via NPM Workspaces

**Status:** Approved
**Context:** The project requires separation of concerns across multiple runtimes (Browser UI, Headless Kernel, Coordinator). The Product Owner has directed the use of NPM Workspaces.
**Decision:** We will restructure the repository into an NPM Workspace monorepo. The existing codebase will be moved to `apps/browser-lab` as the initial application.
**Consequences:**
- Root `package.json` will manage workspaces and run shared scripts.
- Individual apps/packages will have their own `package.json`.
