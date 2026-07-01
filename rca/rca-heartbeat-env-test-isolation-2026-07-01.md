# RCA: Morning heartbeat test gate read live source tokens

**Date:** 2026-07-01
**Trigger:** Deterministic heartbeat verification failed before ship
**Surface-fix commit:** pending in current branch
**Structural-fix commit:** pending in current branch

## What happened

The morning heartbeat loaded the shared podcast env file, then ran the Python test gate.
That env file included a live Apify token, so a fake-fetcher test collected an X record and failed.
The heartbeat was expected to test code against fixtures before collection, not let live source config change test behavior.

## Surface symptom

`tests/test_competitive_intel.py::test_collect_ai_raw_records_from_public_sources_with_fake_fetchers` expected GitHub, Hacker News, and arXiv records.
The run also returned `x-ai-builders`.

## Surface root cause

`scripts/run_morning.sh` sourced shared env before running `uv run python -m pytest -q`.
The test gate inherited `APIFY_TOKEN`, which enabled the X collector inside a test that was written for fake GitHub, Hacker News, and arXiv fetchers.

## Structural root cause

### Root cause #1

type: missing-test

There was no test or script gate proving that the morning test phase runs isolated from live source credentials.

### Root cause #2

type: implicit-contract

The heartbeat script had an implicit contract: tests are fixture-only, collection is live-config-aware.
That contract was not encoded in the command boundary.

## Verification

Ran:

```bash
RUN_DATE=2026-07-01 COMPETITIVE_ANALYSIS_RAW_RECORDS=examples/competitive-intel/ai-builds-raw-records.json COMPETITIVE_ANALYSIS_OUTPUT_DIR=/tmp/competitive-analysis-heartbeat.0ZBrBZ bash scripts/run_morning.sh
```

Result:

```text
heartbeat status: ok
records_seen: 5
market_moves: 3
podcast_digest: /tmp/competitive-analysis-heartbeat.0ZBrBZ/competitive-intel/2026-07-01.podcast.txt
```

## Contributing factors

The env loader originally had its own parser, then the heartbeat shared a config file with a different syntax.
The script also treated the test phase and live collection phase as one env scope.

## Fixes shipped

- Surface fix: `scripts/run_morning.sh` now sources shell-style env files, so `export KEY="value"` works.
- Structural fix: `scripts/run_morning.sh` runs the pytest gate with `APIFY_TOKEN` removed, then keeps live env available for collection.

## Action items

- [x] Add a regression test for heartbeat test-env isolation - owner: Codex - type: test
- [x] Add a short heartbeat env contract note to the README - owner: Codex - type: doc

## Lessons

- Tests and live collection need different env scopes.
- Shared env files are fine, but the gate boundary has to be explicit.
- If a token changes test behavior, the test gate is not isolated.
