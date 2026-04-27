# Task Flow

Use this default loop unless a task-specific workflow overrides it.

## Default Execution Loop

1. Understand the request and restate the target change.
2. Find the owning package or domain from `docs/architecture/monorepo-map.md`.
3. Create a plan in `plans/active/` if the task is non-trivial.
4. Reproduce the problem or inspect the current behavior.
5. Identify the smallest correct change.
6. Implement the change.
7. Run the relevant checks from `docs/validation/checks.md`.
8. Record what changed, what was validated, and any follow-up work.

## Bugfix Flow

1. Reproduce the bug.
2. Identify the failing boundary, assumption, or data shape.
3. Add or update a test if practical.
4. Implement the fix.
5. Re-run the reproduction and validation steps.
6. Document any rule or invariant that the bug exposed.

## Feature Flow

1. Confirm the acceptance criteria.
2. Identify which package owns the change.
3. Prefer extending existing boundaries over inventing new ones.
4. Add tests, contract checks, or validation for the new behavior.
5. Update docs if the feature changes user, agent, or operator behavior.

## Escalation Triggers

Pause and ask for clarification when:

- the task conflicts with an invariant
- ownership is unclear across domains
- the request implies a migration or rollout risk
- the acceptance criteria are ambiguous
