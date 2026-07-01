"use client";

import { useMemo, useState } from "react";

const sources = [
  { id: "github", label: "GitHub", color: "#2F6FED", active: true },
  { id: "hacker-news", label: "HN", color: "#F97316", active: true },
  { id: "reddit", label: "Reddit", color: "#D1495B", active: true },
  { id: "huggingface-ai", label: "HF", color: "#E9B949", active: true },
  { id: "simonwillison", label: "RSS", color: "#2A9D8F", active: true },
  { id: "arxiv", label: "arXiv", color: "#7562E0", active: false },
  { id: "x", label: "X", color: "#111827", active: false },
];

const marketMoves = [
  {
    id: "model-releases",
    theme: "model releases",
    entities: ["Hugging Face Trending", "AI Research Writers", "Reddit AI Builders"],
    count: 11,
    strength: 92,
    sources: ["huggingface-ai", "simonwillison", "reddit"],
    why:
      "A model is not just announced. It shows up in model feeds, specialist writing, and builder communities within the same week.",
    receipts: [
      "zai-org/GLM-5.2 reached Hugging Face trending",
      "Claude Sonnet 5 analysis landed in technical RSS",
      "Builders debated autonomous tool use in Claude communities",
    ],
  },
  {
    id: "coding-agents",
    theme: "coding agents",
    entities: ["GitHub Trending", "Hacker News AI Builders", "AI Research Writers"],
    count: 15,
    strength: 87,
    sources: ["github", "hacker-news", "simonwillison"],
    why:
      "The market is moving from chatbot wrappers to agent workbenches that run tools, touch terminals, and need policy gates.",
    receipts: [
      "OpenHands shipped cloud release changes",
      "Show HN posts centered on agent runtimes",
      "Local safety tools appeared around shell-command risk",
    ],
  },
  {
    id: "new-repos",
    theme: "new repos",
    entities: ["GitHub Trending", "Hacker News AI Builders", "AI Research Writers"],
    count: 6,
    strength: 74,
    sources: ["github", "hacker-news"],
    why:
      "New builds are appearing in public before they become vendor categories. That gives the analyst an early read.",
    receipts: [
      "OpenKnowledge framed itself as an AI-first knowledge workspace",
      "AMA2 positioned messaging as agent runtime",
      "Kintsugi focused on local safety nets for agent work",
    ],
  },
  {
    id: "computer-use",
    theme: "computer use",
    entities: ["Hacker News AI Builders", "Reddit AI Builders"],
    count: 2,
    strength: 59,
    sources: ["hacker-news", "reddit"],
    why:
      "Computer-use claims are crossing from demos into developer workflows. The risk shifts from prompt quality to execution control.",
    receipts: [
      "Policy gates now run before coding-agent tool calls",
      "Claude community posts emphasize browsers, terminals, and autonomy",
    ],
  },
];

const sourceLabels = Object.fromEntries(sources.map((source) => [source.id, source.label]));
const sourceColors = Object.fromEntries(sources.map((source) => [source.id, source.color]));

const constellation = [
  { move: "model-releases", source: "huggingface-ai", x: 73, y: 18 },
  { move: "model-releases", source: "simonwillison", x: 62, y: 31 },
  { move: "model-releases", source: "reddit", x: 81, y: 42 },
  { move: "coding-agents", source: "github", x: 30, y: 24 },
  { move: "coding-agents", source: "hacker-news", x: 43, y: 38 },
  { move: "coding-agents", source: "simonwillison", x: 54, y: 22 },
  { move: "new-repos", source: "github", x: 19, y: 64 },
  { move: "new-repos", source: "hacker-news", x: 38, y: 72 },
  { move: "computer-use", source: "hacker-news", x: 58, y: 74 },
  { move: "computer-use", source: "reddit", x: 72, y: 67 },
];

export default function Page() {
  const [enabled, setEnabled] = useState(() =>
    Object.fromEntries(sources.map((source) => [source.id, source.active])),
  );
  const [selectedId, setSelectedId] = useState("model-releases");

  const visibleMoves = useMemo(
    () => marketMoves.filter((move) => move.sources.some((source) => enabled[source])),
    [enabled],
  );
  const selectedMove = visibleMoves.find((move) => move.id === selectedId) || visibleMoves[0];
  const visibleSourceCount = sources.filter((source) => enabled[source.id]).length;
  const visibleSignalCount = visibleMoves.reduce((sum, move) => sum + move.count, 0);

  function toggleSource(id) {
    setEnabled((current) => ({ ...current, [id]: !current[id] }));
  }

  return (
    <main>
      <section className="workspace" aria-label="Competitive analysis workspace">
        <aside className="leftRail">
          <div className="brandBlock">
            <span className="brandMark" aria-hidden="true">CA</span>
            <div>
              <p className="eyebrow">AI market radar</p>
              <h1>Competitive Analysis</h1>
            </div>
          </div>

          <div className="operatorNote">
            <p>
              Track new AI builds, repos, model releases, capabilities, and builder chatter.
              The output is a weekly analyst brief, not a feed dump.
            </p>
          </div>

          <div className="railGroup" aria-label="Source filters">
            <div className="railHeader">
              <span>Sources</span>
              <span>{visibleSourceCount}/7 live</span>
            </div>
            <div className="sourceList">
              {sources.map((source) => (
                <button
                  key={source.id}
                  type="button"
                  className={`sourceToggle ${enabled[source.id] ? "isOn" : ""}`}
                  onClick={() => toggleSource(source.id)}
                  aria-pressed={enabled[source.id]}
                >
                  <span className="sourceDot" style={{ background: source.color }} />
                  <span>{source.label}</span>
                  <span className="switchTrack" aria-hidden="true">
                    <span className="switchKnob" />
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="runBox">
            <span className="runLabel">Run command</span>
            <code>
              uv run kipi-competitive-intel collect-weekly --query "AI agent eval harness MCP Claude Code"
            </code>
          </div>
        </aside>

        <section className="mainBoard">
          <header className="topBar">
            <div>
              <p className="eyebrow">Week 2026-W27</p>
              <h2>Market moves, clustered from public signals</h2>
            </div>
            <div className="statusStrip" aria-label="Run status">
              <span><strong>45</strong> records scanned</span>
              <span><strong>{visibleMoves.length}</strong> moves</span>
              <span><strong>{visibleSignalCount}</strong> signals</span>
            </div>
          </header>

          <div className="boardGrid">
            <section className="signalMap" aria-label="Signal constellation">
              <div className="mapHeader">
                <div>
                  <p className="eyebrow">Dot connector</p>
                  <h3>Signal constellation</h3>
                </div>
                <span className="mapLegend">source-weighted evidence</span>
              </div>
              <div className="constellation" role="img" aria-label="Market moves connected to source evidence">
                <svg className="connectionLayer" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                  {visibleMoves.map((move) => {
                    const points = constellation.filter((point) => point.move === move.id && enabled[point.source]);
                    if (points.length < 2) return null;
                    return points.slice(1).map((point, index) => {
                      const first = points[0];
                      return (
                        <line
                          key={`${move.id}-${point.source}`}
                          x1={first.x}
                          y1={first.y}
                          x2={point.x}
                          y2={point.y}
                          className={`mapLine ${selectedMove?.id === move.id ? "isSelected" : ""}`}
                          style={{ transitionDelay: `${index * 40}ms` }}
                        />
                      );
                    });
                  })}
                </svg>
                {constellation.map((point) => {
                  const move = marketMoves.find((item) => item.id === point.move);
                  const isVisible = enabled[point.source] && visibleMoves.some((item) => item.id === point.move);
                  return (
                    <button
                      key={`${point.move}-${point.source}`}
                      type="button"
                      className={`mapNode ${isVisible ? "isVisible" : ""} ${selectedMove?.id === point.move ? "isSelected" : ""}`}
                      style={{
                        left: `${point.x}%`,
                        top: `${point.y}%`,
                        "--node": sourceColors[point.source],
                      }}
                      onClick={() => setSelectedId(point.move)}
                      aria-label={`${sourceLabels[point.source]} evidence for ${move.theme}`}
                    >
                      <span>{sourceLabels[point.source]}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="movePanel" aria-label="Selected market move">
              {selectedMove ? (
                <>
                  <div className="moveTop">
                    <p className="eyebrow">Selected move</p>
                    <span className="score">{selectedMove.strength}</span>
                  </div>
                  <h3>{selectedMove.theme}</h3>
                  <p className="why">{selectedMove.why}</p>
                  <div className="entityRow">
                    {selectedMove.entities.map((entity) => (
                      <span key={entity}>{entity}</span>
                    ))}
                  </div>
                  <div className="receiptList">
                    {selectedMove.receipts.map((receipt) => (
                      <div className="receipt" key={receipt}>
                        <span className="receiptBar" />
                        <p>{receipt}</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="emptyState">
                  <h3>No moves in view</h3>
                  <p>Turn a source back on to rebuild the board.</p>
                </div>
              )}
            </section>
          </div>

          <section className="moveTable" aria-label="Market move table">
            <div className="tableHeader">
              <span>Theme</span>
              <span>Entities</span>
              <span>Evidence</span>
              <span>Score</span>
            </div>
            {visibleMoves.map((move) => (
              <button
                key={move.id}
                type="button"
                className={`tableRow ${selectedMove?.id === move.id ? "isSelected" : ""}`}
                onClick={() => setSelectedId(move.id)}
              >
                <span>{move.theme}</span>
                <span>{move.entities.length}</span>
                <span>{move.count}</span>
                <span>{move.strength}</span>
              </button>
            ))}
          </section>
        </section>

        <aside className="rightRail">
          <section className="briefPanel" aria-label="Newsletter preview">
            <p className="eyebrow">Weekly brief</p>
            <h2>What changed in AI this week</h2>
            <p>
              Model releases became the strongest move. Coding agents stayed broad.
              New repos show the category edges before vendors name them.
            </p>
            <div className="briefStack">
              <span>Top source: Hugging Face</span>
              <span>Strongest cluster: model releases</span>
              <span>Watch next: computer use policy gates</span>
            </div>
          </section>

          <section className="pipelinePanel" aria-label="Workflow pipeline">
            <p className="eyebrow">Workflow</p>
            <ol>
              <li><span>Collect</span><p>Public repos, forums, RSS, models, papers, and X.</p></li>
              <li><span>Normalize</span><p>One record schema with source, entity, text, URL, and engagement.</p></li>
              <li><span>Cluster</span><p>Theme rules, source weights, caps, and entity diversity.</p></li>
              <li><span>Brief</span><p>Markdown and JSON output ready for a weekly send.</p></li>
            </ol>
          </section>
        </aside>
      </section>
    </main>
  );
}
