# Current Mission
**Mission:** Validation TED and Shadow DOM
**Status:** LOCKED
**ID:** M-017

## References
- `docs/adr/ACP-001-Validation-TED-ShadowDOM.md`
- `governance/ROADMAP.md` (Phase 4 / Phase 5)

## Objective
Implement Shadow DOM traversal for Observation Graph extraction and replace naive structural diffing with a Tree Edit Distance (TED) algorithm to accurately validate complex structures.

## Scope
**In Scope:**
- Updating `apps/browser-lab/server.ts` to pierce `shadowRoot` during DOM traversal.
- Implementing a Top-Down TED algorithm in `packages/validation-engine/src/structural.ts`.
- Resolving TD-001 and TD-002.

**Out of Scope:**
- Full $O(N^4)$ Zhang-Shasha TED algorithm for non-ordered trees (using simplified/constrained Top-Down TED for performance).

## Next Steps
- Obtain user approval for Mission 17 definition (already implicitly approved via ACP).
