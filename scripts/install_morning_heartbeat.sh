#!/bin/bash
# Install the local LaunchAgent that refreshes Competitive Analysis every morning.
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LABEL="com.assaf.competitive-analysis.morning"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
LOG_DIR="$REPO_ROOT/output/heartbeat/launchd"
UID_VALUE="$(id -u)"

mkdir -p "$(dirname "$PLIST")" "$LOG_DIR"

python3 - "$PLIST" "$LABEL" "$REPO_ROOT" "$LOG_DIR" <<'PY'
import plistlib
import sys
plist, label, repo, log_dir = sys.argv[1:]
payload = {
    "Label": label,
    "ProgramArguments": ["/bin/bash", f"{repo}/scripts/run_morning.sh"],
    "WorkingDirectory": repo,
    "StartCalendarInterval": {"Hour": 7, "Minute": 45},
    "StandardOutPath": f"{log_dir}/out.log",
    "StandardErrorPath": f"{log_dir}/err.log",
}
with open(plist, "wb") as fh:
    plistlib.dump(payload, fh)
PY

chmod 644 "$PLIST"
launchctl bootout "gui/$UID_VALUE" "$PLIST" >/dev/null 2>&1 || true
launchctl bootstrap "gui/$UID_VALUE" "$PLIST"
launchctl enable "gui/$UID_VALUE/$LABEL"
echo "$PLIST"
