#!/bin/bash
# Morning heartbeat for Competitive Analysis.
# Same discipline as the daily podcast: run locally, write dated artifacts, keep a
# heartbeat JSON, and leave a log that says exactly what happened.
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
export PATH="$HOME/.local/bin:/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:$PATH"

TODAY="${RUN_DATE:-$(date +%F)}"
OUTPUT_DIR="${COMPETITIVE_ANALYSIS_OUTPUT_DIR:-$REPO_ROOT/output}"
LOG_DIR="$OUTPUT_DIR/heartbeat/logs"
HEARTBEAT="$OUTPUT_DIR/heartbeat/latest.json"
LOG="$LOG_DIR/run-$TODAY.log"
WATCHLIST="${COMPETITIVE_ANALYSIS_WATCHLIST:-$REPO_ROOT/examples/competitive-intel/ai-builds-watchlist.yaml}"
SOURCES_CONFIG="${COMPETITIVE_ANALYSIS_SOURCES_CONFIG:-$REPO_ROOT/examples/competitive-intel/ai-live-sources.json}"
LEDGER="${COMPETITIVE_ANALYSIS_COVERAGE_LEDGER:-$OUTPUT_DIR/competitive-intel/coverage.jsonl}"
QUERY="${COMPETITIVE_ANALYSIS_QUERY:-AI agent eval harness MCP Claude Code}"
PER_SOURCE_LIMIT="${COMPETITIVE_ANALYSIS_PER_SOURCE_LIMIT:-5}"
RAW_RECORDS="${COMPETITIVE_ANALYSIS_RAW_RECORDS:-}"

mkdir -p "$LOG_DIR" "$(dirname "$HEARTBEAT")"

log() { echo "[$(date '+%H:%M:%S')] $*" | tee -a "$LOG"; }

write_heartbeat() {
  local status="$1"
  local message="$2"
  local report="$OUTPUT_DIR/competitive-intel/$TODAY.report.json"
  local podcast="$OUTPUT_DIR/competitive-intel/$TODAY.podcast.txt"
  python3 - "$HEARTBEAT" "$status" "$message" "$TODAY" "$report" "$podcast" "$LOG" <<'PY'
import json
import sys
from datetime import datetime, timezone
path, status, message, date, report_path, podcast_path, log_path = sys.argv[1:]
payload = {
    "status": status,
    "message": message,
    "date": date,
    "updated_at": datetime.now(timezone.utc).isoformat(),
    "report": report_path,
    "podcast_digest": podcast_path,
    "log": log_path,
}
try:
    with open(report_path, encoding="utf-8") as fh:
        report = json.load(fh)
    payload["records_seen"] = report.get("records_seen", 0)
    payload["market_moves"] = len(report.get("market_moves", []))
except Exception:
    payload["records_seen"] = 0
    payload["market_moves"] = 0
with open(path, "w", encoding="utf-8") as fh:
    json.dump(payload, fh, indent=2)
PY
}

load_env_file() {
  local file="$1"
  [ -f "$file" ] || return 0
  set -a
  # Local env files are operator-controlled and may use shell quoting or export.
  # Source them so shared podcast config works without a second parser.
  # shellcheck disable=SC1090
  . "$file"
  set +a
}

cd "$REPO_ROOT" || exit 1
load_env_file "$HOME/.config/ai-news-podcast/env"
load_env_file "$HOME/.config/competitive-analysis/env"

log "=== competitive-analysis morning heartbeat $TODAY ==="
log "running test gate"
if ! env -u APIFY_TOKEN uv run python -m pytest -q >> "$LOG" 2>&1; then
  write_heartbeat "failed" "test gate failed"
  log "FAIL: test gate failed"
  exit 1
fi

if [ -n "$RAW_RECORDS" ]; then
  log "building from raw records: $RAW_RECORDS"
  if ! PYTHONPATH=src uv run kipi-competitive-intel weekly \
    --watchlist "$WATCHLIST" \
    --raw-records "$RAW_RECORDS" \
    --output-dir "$OUTPUT_DIR" \
    --run-date "$TODAY" \
    --podcast-digest \
    --coverage-ledger "$LEDGER" >> "$LOG" 2>&1; then
    write_heartbeat "failed" "weekly workflow failed"
    log "FAIL: weekly workflow failed"
    exit 1
  fi
else
  log "collecting live sources"
  if ! PYTHONPATH=src uv run kipi-competitive-intel collect-weekly \
    --watchlist "$WATCHLIST" \
    --sources-config "$SOURCES_CONFIG" \
    --output-dir "$OUTPUT_DIR" \
    --run-date "$TODAY" \
    --query "$QUERY" \
    --per-source-limit "$PER_SOURCE_LIMIT" \
    --podcast-digest \
    --coverage-ledger "$LEDGER" >> "$LOG" 2>&1; then
    write_heartbeat "failed" "collect-weekly workflow failed"
    log "FAIL: collect-weekly workflow failed"
    exit 1
  fi
fi

write_heartbeat "ok" "morning update complete"
log "heartbeat: $HEARTBEAT"
log "=== done ==="
