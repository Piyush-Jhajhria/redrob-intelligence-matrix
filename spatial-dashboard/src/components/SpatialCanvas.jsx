'use client';

import DataMatrixField from './DataMatrixField';

export default function SpatialCanvas({ candidates = [], selectedCandidateId, intensity = 0.7 }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[#030712]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.12),transparent_26%),radial-gradient(circle_at_center,rgba(15,23,42,0.72),transparent_58%)]" />
      <div className="dashboard-grid absolute inset-0 opacity-35" />

      <div
        className="absolute -left-28 top-20 h-96 w-96 rounded-full bg-cyan-500/15 blur-3xl animate-[drift_18s_ease-in-out_infinite]"
        style={{ opacity: 0.18 + intensity * 0.35 }}
      />
      <div
        className="absolute right-[-10rem] top-[-8rem] h-[28rem] w-[28rem] rounded-full bg-amber-400/10 blur-3xl animate-[driftReverse_22s_ease-in-out_infinite]"
        style={{ opacity: 0.12 + intensity * 0.24 }}
      />
      <div
        className="absolute bottom-[-12rem] left-1/3 h-[24rem] w-[24rem] rounded-full bg-emerald-400/10 blur-3xl animate-[drift_26s_ease-in-out_infinite]"
        style={{ opacity: 0.08 + intensity * 0.16 }}
      />

      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#030712] via-[#030712]/75 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#030712] via-[#030712]/70 to-transparent" />

      <div className="absolute inset-0 opacity-80 mix-blend-screen">
        <DataMatrixField
          candidates={candidates}
          selectedCandidateId={selectedCandidateId}
          intensity={intensity}
        />
      </div>
    </div>
  );
}