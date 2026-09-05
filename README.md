# competitive-analysis

Competitive analysis workflow for AI market intelligence.

It collects public AI signals, normalizes them, detects repeated themes across
sources, and writes a weekly newsletter plus JSON artifacts.

The same run can also write a NotebookLM-ready podcast source brief. That lets a
daily audio workflow use market-move analysis instead of reading a flat story
list.

## Run

```bash
PYTHONPATH=src uv run kipi-competitive-intel collect-weekly \
  --watchlist examples/competitive-intel/ai-builds-watchlist.yaml \
  --sources-config examples/competitive-intel/ai-live-sources.json \
  --output-dir output \
  --query "AI agent eval harness MCP Claude Code" \
  --per-source-limit 5 \
  --podcast-digest \
  --coverage-ledger output/competitive-intel/coverage.jsonl
```

Outputs land in:

```text
output/competitive-intel/
```

Key files:

- `YYYY-MM-DD.md` - weekly analyst brief
- `YYYY-MM-DD.report.json` - structured market moves
- `YYYY-MM-DD.podcast.txt` - NotebookLM source brief for a short audio episode
- `coverage.jsonl` - repeat-blocking ledger for already-covered records

## Sources

- GitHub repo search
- Hacker News
- Reddit, via the Arctic Shift archive mirror
- RSS feeds
- Hugging Face trending models
- arXiv
- X via Apify when `APIFY_TOKEN` is present

Reddit needs no token and no login. It reads **Arctic Shift**, a free archive
mirror, with PullPush as a fallback. The source type is still called
`reddit_rss` in `sources.json` so existing configs keep working, but nothing here
reads an RSS feed any more: `www.reddit.com` throttles those hard enough that 3s
pacing returned 429 on 11 of 12 requests.

A refused read RAISES rather than returning an empty list, and that is
deliberate. An empty list is what a quiet subreddit looks like, so returning it
for a failure makes a dead mirror and a boring week the same value. One dead
subreddit is skipped and named; every subreddit failing stops the run rather
than writing a clean-looking harvest with nothing in it.

## Verify

```bash
PYTHONPATH=src uv run python -m pytest -q tests/test_competitive_intel.py
```

## Site

```bash
cd webapp
npm install
npm run dev
```

The site opens at `http://localhost:3000` by default. It shows the analyst
workspace: source filters, market-move clusters, evidence receipts, and the
weekly brief preview. Use `Create source` in the Daily podcast panel to generate
a NotebookLM-ready source brief from the visible market moves.

## Morning heartbeat

```bash
bash scripts/install_morning_heartbeat.sh
```

That installs a local LaunchAgent for 7:45am. It runs `scripts/run_morning.sh`,
writes fresh Competitive Analysis artifacts, writes `output/heartbeat/latest.json`,
and keeps logs under `output/heartbeat/logs/`.

The runner loads the podcast env file and the competitive-analysis env file.
The test gate runs with live source tokens removed, then the collection step uses
the live env. Tests stay fixture-only. Collection stays real.

---

## Built by Assaf

I spent 12 years in threat intelligence watching teams find the same failure and fix it four times. The learning never stuck. I build tools that make it stick.

This is the free version. The paid kits live at [claudedaddy.io](https://claudedaddy.io).

**Want this wired into your team's repo, or a heavier spec-and-review pipeline?** That's the consulting. [Book a call.](https://calendar.app.google/cMFvhvDsfi9iyWYy9)
