# Golden Principles

These principles keep the repository legible over time.

## Principles

- Prefer one shared pattern over many local variants.
- Prefer explicit boundaries over convenience imports.
- Prefer validation over guessed data shapes.
- Prefer small local fixes over sweeping rewrites.
- Prefer durable docs and scripts over repeated chat explanations.
- Prefer repository truth over memory or external discussion.

## Cleanup Heuristics

When cleaning the repo, look for:

- duplicated helpers that should be shared
- stale docs that disagree with code
- oversized files with mixed responsibilities
- repeated TODO or FIXME clusters
- unvalidated inputs at system boundaries
- naming drift around shared types, schemas, and APIs

## Promotion Rule

When a problem repeats, promote the fix into one of:

- a shared utility
- a doc update
- a lint rule
- a test
- an automated cleanup check
