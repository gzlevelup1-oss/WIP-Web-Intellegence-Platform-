# ACP-014: Technical Debt Resolution Strategy (TD-005 - TD-009)

**Status:** Approved
**Owner:** Architecture
**Date:** 2026-07-23

## 1. Context and Motivation
A backlog of technical debt items (TD-005, TD-006, TD-007, TD-008, TD-009) has accumulated. To resolve these, we must define the correct architectural approach for each—specifically, when to implement from the ground up vs. when to leverage mature community packages, strictly adhering to WIP architectural rules. User/Product Owner feedback has provided a clear direction.

## 2. Decision and Approach

### 1. Merkle-Tree Hashing (TD-005)
- **Approach:** 🛠️ Ground Up (using native primitives)
- **Why:** Community packages for crypto Merkle Trees (e.g., `merkletreejs`) are designed for flat arrays, not deeply nested UI component trees.
- **How:** Write a custom recursive function to traverse the `graphology` Observation Graph bottom-up, hashing each node combined with its children's hashes. Use Node's native `crypto.createHash('sha256')` or a lightweight library like `xxhash-wasm`.

### 2. JSON Schema Validation in Store (TD-008)
- **Approach:** 📦 Community Package
- **Why:** Custom JSON validation logic is error-prone and slow. The community has definitively solved this.
- **How:** Integrate `ajv`. `ajv` is the industry standard for high-performance JSON schema validation (it compiles the schema into JIT JavaScript) and is perfect for validating massive ObservationGraph JSON payloads before saving them to disk.

### 3. Cross-Origin Iframe Stitching (TD-009)
- **Approach:** 🛠️ Ground Up (leveraging existing Playwright)
- **Why:** No community package exists to stitch custom "WIP Observation Graphs" together.
- **How:** Use existing `playwright` dependency to bypass Same-Origin Policy via `page.frames()`. The logic to calculate X/Y bounding box offsets and graft child graphs into the parent graph must be implemented natively inside `PlaywrightAdapter.ts`.

### 4. Node Type Mismatches & Edge Invariants (TD-006, TD-007)
- **Approach:** 🛠️ Ground Up (Internal Refactoring)
- **Why:** These are strictness bugs in our own code, not new features.
- **How:** 
  - For TD-006: Fix typos (`AccessibilityNode` → `A11yNode`) and add a loop over `element.attributes` in `browser-script.ts`.
  - For TD-007: Update insertion of edges into the existing `graphology` instance to ensure structural invariants. No external packages are needed.

## 3. Impact Analysis
- **Quality & Correctness:** Resolves 5 major active tech debt items, ensuring strict schema conformance and robust graph construction.
- **Dependencies:** Introduces `ajv` for validation. No unnecessary heavy crypto libraries for Merkle trees.

## 4. Required Actions
1. Document this ACP.
2. Update `governance/MISSION.md` and `governance/TASKS.md` with a new Mission to implement these resolutions based on the established strategies.

## 5. Approval Status
Approved by User/Product Owner. Implementation has been completed and locked (for the strategy definition).
