'use client';

import { useMemo } from 'react';

function pickColor(score) {
  if (score >= 90) {
    return 'rgba(251, 191, 36, 0.95)';
  }

  if (score >= 80) {
    return 'rgba(34, 211, 238, 0.9)';
  }

  return 'rgba(148, 163, 184, 0.7)';
}

export default function DataMatrixField({ candidates = [], selectedCandidateId, intensity = 0.7 }) {
  const nodes = useMemo(() => {
    if (!candidates.length) {
      return [];
    }

    return candidates.map((candidate, index) => {
      const score = Number(candidate.score) || 0;
      const rankRatio = candidates.length > 1 ? index / (candidates.length - 1) : 0;
      const scoreRatio = score / 100;
      const row = Math.floor(index / 10);
      const column = index % 10;

      return {
        id: candidate.candidate_id,
        x: 8 + column * 8.7 + (row % 2 === 0 ? 0.6 : -0.6),
        y: 20 + row * 6.5 + (1 - scoreRatio) * 4.5,
        radius: candidate.candidate_id === selectedCandidateId ? 1.8 : 0.7 + scoreRatio * 0.9,
        color: pickColor(score),
        opacity: 0.35 + scoreRatio * 0.55,
        connection: index > 0 && index % 5 === 0 ? rankRatio : null,
      };
    });
  }, [candidates, selectedCandidateId]);

  const selectedNodeIndex = nodes.findIndex((node) => node.id === selectedCandidateId);

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="matrix-line" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(56, 189, 248, 0.18)" />
          <stop offset="100%" stopColor="rgba(251, 191, 36, 0.18)" />
        </linearGradient>
        <radialGradient id="node-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255, 255, 255, 0.95)" />
          <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
        </radialGradient>
      </defs>

      {nodes.map((node, index) => (
        <g key={node.id} opacity={node.opacity}>
          {index > 0 ? (
            <line
              x1={nodes[index - 1].x}
              y1={nodes[index - 1].y}
              x2={node.x}
              y2={node.y}
              stroke="url(#matrix-line)"
              strokeWidth={0.15 + intensity * 0.1}
              strokeLinecap="round"
            />
          ) : null}
          <circle
            cx={node.x}
            cy={node.y}
            r={node.radius * 1.8}
            fill={node.color}
            opacity={0.12}
          />
          <circle
            cx={node.x}
            cy={node.y}
            r={node.radius}
            fill={node.color}
            style={{ animation: `matrixPulse 7s ease-in-out ${index * 0.06}s infinite` }}
          />
          {node.id === selectedCandidateId ? (
            <circle
              cx={node.x}
              cy={node.y}
              r={node.radius * 3.2}
              fill="url(#node-glow)"
              opacity={0.3}
            />
          ) : null}
        </g>
      ))}

      {selectedNodeIndex >= 0 ? (
        <circle
          cx={nodes[selectedNodeIndex].x}
          cy={nodes[selectedNodeIndex].y}
          r={4.5 + intensity * 2}
          fill="none"
          stroke="rgba(34, 211, 238, 0.35)"
          strokeWidth={0.4}
          strokeDasharray="1 1.3"
          style={{ animation: 'ringDrift 10s linear infinite' }}
        />
      ) : null}
    </svg>
  );
}