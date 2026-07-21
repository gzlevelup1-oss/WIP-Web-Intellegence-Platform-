# CIR-001: Discrepancy Remediation Impact Analysis

**Status:** Draft
**Owner:** Architecture

## 1. Purpose
This Change Impact Report (CIR) analyzes the downstream effects of resolving the architectural discrepancies identified in AFR-002. It serves to separate the identification of friction (AFR) from the implementation planning (CIR), ensuring deterministic impact assessment before code modification.

## 2. Impact Assessment by Discrepancy

| AFR ID | System | Impacted Components / Packages | Required Changes | Risk Level |
|---|---|---|---|---|
| AFR-002.1 | Browser Runtime | `@wip/browser-runtime`, `@wip/execution-kernel` | `types.ts` (RuntimeMetadata schema, ObservationSnapshot schema) and `PlaywrightAdapter` implementation need updating to extract correct viewport/device data. | Medium |
| AFR-002.2 | Execution Kernel | `@wip/execution-kernel`, `@wip/browser-runtime` | `checkpoint.ts` schema update. `BrowserRuntime` and underlying adapters must implement serialization of `localStorage` and `historyIndex`. This may require injecting client-side scripts to extract state. | High |
| AFR-002.3 | Execution Kernel | `@wip/execution-kernel` | Introduction of `Task` class. Restructuring of `Transaction` to own an array of `Tasks`, and `Scheduler` to operate on `Tasks`. | High |
| AFR-002.4 | Execution Kernel | `@wip/execution-kernel`, `@wip/coordinator` | `kernel.ts` needs a validation step in `beginTransaction`. Coordinator adapter needs to pass mission permissions to the kernel during initialization. | Medium |
| AFR-002.5 | Observation Store | `@wip/observation-store`, `@wip/validation-engine`, `@wip/workers` | `types.ts` requires strict discriminated unions for node types. All consumers of the graph (validation engine, miners, token extractors) must be audited to ensure they handle the strict types correctly. | High |
| AFR-002.6 | Validation Engine | `@wip/validation-engine` | Minor constant change in `structural.ts` (`0.1` -> `0.05`). May cause existing tests to fail if they relied on the loose threshold. | Low |
| AFR-002.7 | Validation Engine | `@wip/validation-engine`, `@wip/browser-lab` | `engine.ts` must implement file I/O to write evidence files. The Node server (`server.ts`) will need to provide a writable directory path to the engine. | Medium |
| AFR-002.8 | Validation Engine | `@wip/validation-engine` | New `accessibility.ts` logic required to diff `A11yNode`s. | Medium |
| AFR-002.9 | Coordinator | `@wip/coordinator` | `agent.ts` logic flow for `Mission_complete` needs a major rewrite to loop back into the generation phase upon a `ValidationFailed` exception. | High |
| AFR-002.10 | Coordinator / Runtime | `@wip/coordinator`, `@wip/browser-lab` | The `kernelAdapter` in `server.ts` must translate string array args (e.g. `['DOM']`) into the numeric array expected by `BrowserRuntime.capture`. | Low |

## 3. Recommended Phased Implementation
Phase 1: Implement low/medium risk fixes (AFR-002.6, AFR-002.10) to stabilize basic operations.
Phase 2: Implement data schema enforcements (AFR-002.1, AFR-002.5, AFR-002.8).
Phase 3: Implement core workflow/architectural changes (AFR-002.3, AFR-002.4, AFR-002.9).
Phase 4: Implement state persistence capabilities (AFR-002.2, AFR-002.7).
