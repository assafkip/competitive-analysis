# competitive-analysis

Competitive analysis workflow for AI market intelligence.

It collects public AI signals, normalizes them, detects repeated themes across
sources, and writes a weekly newsletter plus JSON artifacts.

## Run

```bash
PYTHONPATH=src uv run kipi-competitive-intel collect-weekly \
  --watchlist examples/competitive-intel/ai-builds-watchlist.yaml \
  --sources-config examples/competitive-intel/ai-live-sources.json \
  --output-dir output \
  --query "AI agent eval harness MCP Claude Code" \
  --per-source-limit 5
```

Outputs land in:

```text
output/competitive-intel/
```

## Sources

- GitHub repo search
- Hacker News
- Reddit RSS
- RSS feeds
- Hugging Face trending models
- arXiv
- X via Apify when `APIFY_TOKEN` is present

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
weekly brief preview.
