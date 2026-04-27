# Cleanup Workflow

Use this workflow for low-risk repository cleanup.

## Goal

Keep the repository consistent, legible, and easy for future agent runs to modify.

## Allowed Actions

- fix stale docs that clearly disagree with code
- replace duplicated helpers with an existing shared utility
- remove dead code with local evidence
- split oversized files when ownership is obvious
- add validation for repeated regressions
- improve naming consistency when the intent is clear

## Do Not Do Automatically

- semantic product changes
- cross-domain rewrites
- migrations with rollout risk
- deleting code when usage is uncertain
- inventing a new architecture during cleanup

## Cleanup Loop

1. Read `AGENTS.md` and the rules files.
2. Scan for one small class of cleanup at a time.
3. Prefer the smallest safe fix.
4. Run the relevant checks from `docs/validation/checks.md`.
5. If the change is safe, prepare a small diff or PR.
6. If the change is not safe, record the finding in `docs/quality/debt-log.md`.

## Safe Output Types

- one small cleanup change
- one focused refactor
- one doc correction
- one debt log entry
