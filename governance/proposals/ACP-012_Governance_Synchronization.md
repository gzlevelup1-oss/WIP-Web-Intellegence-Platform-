# ACP-012: Governance Synchronization and Discrepancy Reconciliation
**Status:** Approved
**Owner:** Architecture

## 1. Purpose
This proposal addresses prose and state discrepancies across the core governance artifacts (`MANIFEST.yaml`, `SYSTEM_CONTEXT.md`, `ROADMAP.md`, `TASKS.md`, `MISSION.md`). As the repository evolved through Missions 14-26 and the AFR-002 remediation, documentation drift occurred where some documents were updated while others were not.

## 2. Identified Discrepancies
1. **Missing Active Documents:** `AFR-002`, `CIR-001`, and `ACP-007` through `ACP-011` are missing from the Active ADRs list in `SYSTEM_CONTEXT.md` and `MANIFEST.yaml`.
2. **Missing Missions in Manifest:** `MANIFEST.yaml`'s `locked` list omits several completed/locked missions (e.g., 9, 11, 12, 13, 14, 19, and the AFR-002 Remediation).
3. **Outdated Task Status:** `governance/TASKS.md` lists the AFR-002 Remediation Mission as "Pending Approval" despite both AFR-002 and CIR-001 being formally Approved.
4. **Roadmap Omissions:** `ROADMAP.md` does not track the AFR-002 Remediation Mission.

## 3. Implementation Plan
- Update `SYSTEM_CONTEXT.md` to include the missing active documents.
- Update `MANIFEST.yaml` to include the missing active documents and sync the `locked` missions list with `TASKS.md`.
- Update `governance/TASKS.md` to mark the AFR-002 Remediation Mission as `*Status: LOCKED*` and remove the "Pending Approval" note.
- Update `ROADMAP.md` to include the AFR-002 Remediation Mission under Phase 5 (Compliance & Stability).
