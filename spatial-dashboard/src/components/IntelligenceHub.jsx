'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import {
  Activity,
  BarChart3,
  BadgeCheck,
  ChevronRight,
  Clock3,
  Cpu,
  Layers,
  MapPin,
  Shield,
  Sparkles,
  UserCheck,
  Users,
  Zap,
} from 'lucide-react';
import SpatialCanvas from './SpatialCanvas';

function formatPercent(value, fractionDigits = 1) {
  return `${(value * 100).toFixed(fractionDigits)}%`;
}

function formatScore(value, fractionDigits = 2) {
  return value.toFixed(fractionDigits);
}

function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(Math.round(value));
}

function StatCard({ label, value, subtext, icon, accent = 'cyan' }) {
  const accentStyles = {
    cyan: 'from-cyan-500/20 to-cyan-400/10 border-cyan-400/20 text-cyan-300',
    gold: 'from-amber-500/20 to-amber-400/10 border-amber-400/20 text-amber-300',
    green: 'from-emerald-500/20 to-emerald-400/10 border-emerald-400/20 text-emerald-300',
    slate: 'from-slate-500/20 to-slate-400/10 border-slate-400/20 text-slate-200',
  };

  return (
    <div className={`rounded-2xl border bg-gradient-to-br p-4 shadow-xl backdrop-blur-md ${accentStyles[accent]}`} data-reveal>
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-slate-400">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-2 text-2xl font-black tracking-tight text-slate-50">{value}</div>
      {subtext ? <div className="mt-1 text-[11px] leading-5 text-slate-400">{subtext}</div> : null}
    </div>
  );
}

function ProgressBar({ label, value, suffix, accent = 'cyan' }) {
  const barColors = {
    cyan: 'from-cyan-400 to-sky-300',
    gold: 'from-amber-400 to-amber-200',
    green: 'from-emerald-400 to-emerald-200',
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[11px] text-slate-400">
        <span>{label}</span>
        <span className="font-semibold text-slate-200">{suffix}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-900/80">
        <div className={`h-full rounded-full bg-gradient-to-r ${barColors[accent]}`} style={{ width: `${Math.max(4, Math.min(100, value))}%` }} />
      </div>
    </div>
  );
}

export default function IntelligenceHub({ leaderboard = [], insights = {} }) {
  const [pipelineIntensity, setPipelineIntensity] = useState(0.72);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const uiOverlayRef = useRef(null);

  useEffect(() => {
    if (!selectedCandidateId && leaderboard.length > 0) {
      setSelectedCandidateId(leaderboard[0].candidate_id);
    }
  }, [leaderboard, selectedCandidateId]);

  useEffect(() => {
    if (uiOverlayRef.current && !hasAnimated) {
      gsap.fromTo(
        '[data-reveal]',
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.06, ease: 'power3.out' },
      );
      setHasAnimated(true);
    }
  }, [hasAnimated]);

  const selectedCandidate = useMemo(
    () => leaderboard.find((item) => item.candidate_id === selectedCandidateId) ?? leaderboard[0] ?? null,
    [leaderboard, selectedCandidateId],
  );

  const topIndustries = insights.topIndustries?.slice(0, 3) ?? [];
  const topLocations = insights.topLocations?.slice(0, 3) ?? [];
  const topSkills = insights.topSkills?.slice(0, 5) ?? [];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030712] text-slate-100">
      <SpatialCanvas
        candidates={leaderboard}
        selectedCandidateId={selectedCandidate?.candidate_id}
        intensity={pipelineIntensity}
      />

      <div ref={uiOverlayRef} className="relative z-10 flex min-h-screen flex-col gap-5 p-5 lg:p-8">
        <header className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between" data-reveal>
          <div className="rounded-3xl border border-cyan-400/15 bg-slate-950/75 px-5 py-4 shadow-2xl backdrop-blur-xl">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-3 text-cyan-300 shadow-[0_0_40px_rgba(34,211,238,0.14)]">
                <Cpu size={22} />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-black tracking-tight text-white sm:text-2xl">
                    REDROB AI // CANDIDATE INTELLIGENCE
                  </h1>
                  <span className="rounded-full border border-emerald-400/25 bg-emerald-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-300">
                    Real data connected
                  </span>
                </div>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
                  Shortlisted candidates sourced from team_prime.csv and enriched from candidates.jsonl. The dashboard shows the full 100-row output, ranked insights, and a live detail panel for the selected candidate.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:w-[38rem] xl:grid-cols-4">
            <StatCard
              label="Shortlisted"
              value={formatNumber(insights.candidateCount || leaderboard.length)}
              subtext="Rows in the final submission output"
              icon={<Users size={12} />}
              accent="cyan"
            />
            <StatCard
              label="Average Score"
              value={formatScore(insights.averageScore || 0, 2)}
              subtext={`Spread ${formatScore(insights.scoreSpread || 0, 2)} points`}
              icon={<BarChart3 size={12} />}
              accent="gold"
            />
            <StatCard
              label="Open to Work"
              value={formatNumber(insights.openToWorkCount || 0)}
              subtext="Candidates with active availability"
              icon={<Shield size={12} />}
              accent="green"
            />
            <StatCard
              label="Verified"
              value={formatNumber(insights.verifiedCount || 0)}
              subtext="Email and phone verified"
              icon={<BadgeCheck size={12} />}
              accent="slate"
            />
          </div>
        </header>

        <section className="grid min-h-0 gap-5 xl:flex-1 xl:grid-cols-[1.35fr_0.85fr_1fr]">
          <div className="flex min-h-0 flex-col rounded-3xl border border-slate-800/80 bg-slate-950/75 shadow-2xl backdrop-blur-xl" data-reveal>
            <div className="flex items-center justify-between border-b border-slate-800/80 px-5 py-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">
                  <UserCheck size={13} />
                  Submission leaderboard
                </div>
                <div className="mt-1 text-sm text-slate-400">
                  Full ranked shortlist from the production scoring pipeline.
                </div>
              </div>
              <div className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-[11px] text-slate-300">
                Showing {leaderboard.length} of {leaderboard.length}
              </div>
            </div>

            <div className="grid grid-cols-[0.7fr_1.4fr_0.9fr_0.75fr] gap-3 border-b border-slate-800/80 px-5 py-3 text-[10px] uppercase tracking-[0.22em] text-slate-500">
              <div>Rank</div>
              <div>Candidate</div>
              <div>Role / Company</div>
              <div className="text-right">Score</div>
            </div>

            <div className="min-h-0 flex-1 overflow-auto px-3 py-2">
              <div className="space-y-2">
                {leaderboard.map((candidate) => {
                  const isSelected = candidate.candidate_id === selectedCandidate?.candidate_id;
                  const profile = candidate.profile ?? {};
                  return (
                    <button
                      key={candidate.candidate_id}
                      type="button"
                      onClick={() => setSelectedCandidateId(candidate.candidate_id)}
                      className={`grid w-full grid-cols-[0.7fr_1.4fr_0.9fr_0.75fr] items-center gap-3 rounded-2xl border px-4 py-3 text-left transition duration-200 ${
                        isSelected
                          ? 'border-cyan-400/40 bg-cyan-500/10 shadow-[0_0_0_1px_rgba(34,211,238,0.1)]'
                          : 'border-slate-800/80 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/70'
                      }`}
                    >
                      <div className="text-sm font-black text-cyan-300">#{candidate.rank}</div>
                      <div>
                        <div className="font-mono text-sm font-semibold tracking-tight text-slate-100">
                          {candidate.candidate_id}
                        </div>
                        <div className="truncate text-[11px] text-slate-500">
                          {profile.anonymized_name || profile.headline || 'Profile available in source data'}
                        </div>
                      </div>
                      <div className="text-[11px] leading-5 text-slate-300">
                        <div className="truncate font-medium text-slate-200">
                          {profile.current_title || 'Title unavailable'}
                        </div>
                        <div className="truncate text-slate-500">
                          {profile.current_company || 'Company unavailable'}
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2 text-right">
                        <div>
                          <div className="text-sm font-black text-amber-300">{formatScore(candidate.score, 3)}</div>
                          <div className="text-[10px] text-slate-500">/ 100</div>
                        </div>
                        <ChevronRight size={14} className={isSelected ? 'text-cyan-300' : 'text-slate-600'} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex min-h-0 flex-col gap-4 rounded-3xl border border-slate-800/80 bg-slate-950/75 p-5 shadow-2xl backdrop-blur-xl xl:sticky xl:top-5 xl:self-start" data-reveal>
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-amber-300">
                <Sparkles size={13} />
                Portfolio summary
              </div>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-white">
                What the shortlist contains
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                These metrics are computed from the ranked output and linked candidate records, not hardcoded sample values.
              </p>
            </div>

            <div className="space-y-4 rounded-2xl border border-slate-800/80 bg-slate-900/50 p-4">
              <ProgressBar
                label="Score band strength"
                value={insights.scoreBands?.[0]?.count ? (insights.scoreBands[0].count / Math.max(1, leaderboard.length)) * 100 : 0}
                suffix={`${insights.scoreBands?.[0]?.count || 0} candidates at 90+`}
                accent="gold"
              />
              <ProgressBar
                label="Interview completion"
                value={(insights.averageInterviewCompletionRate || 0) * 100}
                suffix={`${formatPercent(insights.averageInterviewCompletionRate || 0)} average`}
                accent="green"
              />
              <ProgressBar
                label="Response time"
                value={100 - Math.min(100, insights.averageResponseTimeHours || 0)}
                suffix={`${formatScore(insights.averageResponseTimeHours || 0, 1)}h average`}
                accent="cyan"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-slate-500">
                  <Activity size={12} className="text-cyan-300" />
                  Top industries
                </div>
                <div className="mt-3 space-y-2 text-sm">
                  {topIndustries.length ? topIndustries.map((item) => (
                    <div key={item.name} className="flex items-center justify-between gap-3 text-slate-300">
                      <span className="truncate">{item.name}</span>
                      <span className="font-semibold text-cyan-300">{item.count}</span>
                    </div>
                  )) : <div className="text-slate-500">No industry data available.</div>}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-slate-500">
                  <MapPin size={12} className="text-amber-300" />
                  Top locations
                </div>
                <div className="mt-3 space-y-2 text-sm">
                  {topLocations.length ? topLocations.map((item) => (
                    <div key={item.name} className="flex items-center justify-between gap-3 text-slate-300">
                      <span className="truncate">{item.name}</span>
                      <span className="font-semibold text-amber-300">{item.count}</span>
                    </div>
                  )) : <div className="text-slate-500">No location data available.</div>}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-4">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-slate-500">
                <Layers size={12} className="text-emerald-300" />
                Leading skills in shortlist
              </div>
              <div className="mt-3 space-y-3">
                {topSkills.length ? topSkills.map((item) => (
                  <div key={item.name} className="flex items-center justify-between gap-3 text-sm text-slate-300">
                    <span className="truncate">{item.name}</span>
                    <span className="rounded-full border border-slate-700 bg-slate-950/70 px-2 py-1 text-[10px] font-semibold text-slate-200">
                      {item.count}
                    </span>
                  </div>
                )) : <div className="text-slate-500">No skill data available.</div>}
              </div>
            </div>
          </div>

          <div className="flex min-h-0 flex-col gap-4 rounded-3xl border border-slate-800/80 bg-slate-950/75 p-5 shadow-2xl backdrop-blur-xl xl:sticky xl:top-5 xl:self-start" data-reveal>
            {selectedCandidate ? (
              <>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.26em] text-slate-500">
                    Selected candidate profile
                  </div>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-white">
                    {selectedCandidate.candidate_id}
                  </h2>
                  <div className="mt-1 text-sm text-cyan-300">
                    {selectedCandidate.profile?.anonymized_name || 'Anonymized profile'}
                  </div>
                  <div className="mt-3 inline-flex rounded-full border border-amber-400/25 bg-amber-500/10 px-3 py-1 text-[11px] font-semibold text-amber-200">
                    Match score: {formatScore(selectedCandidate.score, 3)} / 100
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-4">
                  <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                    Ranked rationale
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    {selectedCandidate.reasoning}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl border border-slate-800/80 bg-slate-900/45 p-4">
                    <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Current role</div>
                    <div className="mt-2 font-semibold text-slate-100">
                      {selectedCandidate.profile?.current_title || 'Unavailable'}
                    </div>
                    <div className="mt-1 text-slate-400">
                      {selectedCandidate.profile?.current_company || 'Unavailable'}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-800/80 bg-slate-900/45 p-4">
                    <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Experience</div>
                    <div className="mt-2 font-semibold text-slate-100">
                      {selectedCandidate.profile?.years_of_experience ?? 'N/A'} years
                    </div>
                    <div className="mt-1 text-slate-400">
                      {selectedCandidate.profile?.current_industry || 'Industry unavailable'}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-4">
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-slate-500">
                    <Clock3 size={12} className="text-cyan-300" />
                    Availability and trust signals
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between text-sm text-slate-300">
                      <span>Notice period</span>
                      <span className="font-semibold text-slate-100">{selectedCandidate.signals?.notice_period_days ?? 'N/A'} days</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-slate-300">
                      <span>Interview completion</span>
                      <span className="font-semibold text-emerald-300">{formatPercent(selectedCandidate.signals?.interview_completion_rate || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-slate-300">
                      <span>Open to work</span>
                      <span className="font-semibold text-slate-100">
                        {selectedCandidate.signals?.open_to_work_flag ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-slate-300">
                      <span>GitHub activity</span>
                      <span className="font-semibold text-slate-100">
                        {selectedCandidate.signals?.github_activity_score ?? 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-4">
                  <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                    Profile summary
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    {selectedCandidate.profile?.summary || 'Profile summary unavailable in the source data.'}
                  </p>
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-500">
                Waiting for the shortlisted candidates to load.
              </div>
            )}
          </div>
        </section>

        <footer className="rounded-2xl border border-slate-800/80 bg-slate-950/55 px-4 py-3 text-[11px] text-slate-500 backdrop-blur-xl" data-reveal>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Zap size={12} className="text-amber-300" />
              <span>
                Real shortlist rendered from team_prime.csv, enriched from candidates.jsonl, and sorted with the same pipeline rules as the submission.
              </span>
            </div>
            <div className="text-slate-400">
              Background intensity control: {Math.round(pipelineIntensity * 100)}%
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}