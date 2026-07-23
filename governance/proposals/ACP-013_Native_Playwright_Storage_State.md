# ACP-013: Native Playwright Storage State Integration

**Status:** Approved
**Owner:** Architecture
**Date:** 2026-07-23

## 1. Context and Motivation
A recent analysis of community packages vs. custom components highlighted that our checkpointing logic in `PlaywrightAdapter.ts` manually extracts and restores `localStorage` via custom injected JavaScript (`page.evaluate()`). 
Playwright provides a native `context.storageState()` API which is built expressly for this purpose. Utilizing the native API eliminates custom brittle JS evaluation, aligns with Playwright best practices, and is more resilient across different browser contexts.

## 2. Proposed Changes
- **Refactor `createCheckpoint`**: Replace the manual `cookies` and `localStorage` evaluation in `PlaywrightAdapter.ts` with Playwright's `await context.storageState()`.
- **Refactor `restoreCheckpoint`**: Update `restoreCheckpoint` to apply the structure returned by `storageState()` or cleanly inject it.
- **Update `RuntimeCheckpoint` Interface**: Enhance the `RuntimeCheckpoint` type in `packages/browser-runtime/src/contracts/types.ts` to properly include `storageState` instead of using `any` or loose generic properties, ensuring strict architectural typing.

## 3. Impact Analysis
- **Execution Kernel**: Minor impact. The state payload of a checkpoint will change structurally, but the `createCheckpoint` and `restoreCheckpoint` contract signatures remain identical.
- **Performance**: Improved. Extracting state natively via CDP (`storageState()`) is faster and less error-prone than injecting JavaScript.
- **Compatibility**: The native `storageState()` accurately serializes origins and `localStorage`, handling multi-origin storage better than our current single-origin `window.localStorage` dump.

## 4. Alternative Considered
- **Keep Custom Logic**: Retaining the current 10-line `localStorage` eval. This was rejected because `storageState()` is standard, handles IndexedDB/ServiceWorkers context better over time, and supports cross-origin localStorage isolation.

## 5. Required Actions (If Approved)
1. Update `RuntimeCheckpoint` interface in `types.ts` to match the native storage state structure.
2. Refactor `PlaywrightAdapter.createCheckpoint` to use `context.storageState()`.
3. Refactor `PlaywrightAdapter.restoreCheckpoint` to restore via iterating origins, or updating context creation logic if supported.
4. Update `MANIFEST.yaml` and `SYSTEM_CONTEXT.md` to document the active proposal.

## 6. Approval Status

Approved by User/Product Owner. Implementation has been completed and locked.
