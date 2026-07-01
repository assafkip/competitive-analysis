from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]


def test_morning_heartbeat_test_gate_removes_live_source_tokens():
    script = (REPO_ROOT / "scripts" / "run_morning.sh").read_text(encoding="utf-8")

    assert "env -u APIFY_TOKEN uv run python -m pytest -q" in script
    assert "load_env_file \"$HOME/.config/ai-news-podcast/env\"" in script
    assert "load_env_file \"$HOME/.config/competitive-analysis/env\"" in script
