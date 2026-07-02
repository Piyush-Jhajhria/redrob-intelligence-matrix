import fs from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import readline from 'node:readline';
import path from 'node:path';

const WORKSPACE_ROOT = path.resolve(process.cwd(), '..');
const TEAM_PRIME_PATH = path.join(WORKSPACE_ROOT, 'team_prime.csv');
const CANDIDATES_PATH = path.join(WORKSPACE_ROOT, 'candidates.jsonl');

function parseCsvLine(line) {
  const cells = [];
  let current = '';
  let insideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];

    if (character === '"') {
      const nextCharacter = line[index + 1];
      if (insideQuotes && nextCharacter === '"') {
        current += '"';
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
      continue;
    }

    if (character === ',' && !insideQuotes) {
      cells.push(current);
      current = '';
      continue;
    }

    current += character;
  }

  cells.push(current);
  return cells;
}

function countBy(items, selector) {
  const counts = new Map();

  for (const item of items) {
    const value = selector(item);
    if (!value) {
      continue;
    }

    counts.set(value, (counts.get(value) || 0) + 1);
  }

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name));
}

function average(values) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function median(values) {
  if (!values.length) {
    return 0;
  }

  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }

  return sorted[middle];
}

async function loadLeaderboardRows() {
  const fileContents = await fs.readFile(TEAM_PRIME_PATH, 'utf8');
  const lines = fileContents.split(/\r?\n/).filter((line) => line.trim().length > 0);
  const [, ...dataLines] = lines;

  return dataLines.map((line) => {
    const [candidateId, rankValue, scoreValue, reasoning] = parseCsvLine(line);

    return {
      candidate_id: candidateId,
      rank: Number.parseInt(rankValue, 10),
      score: Number.parseFloat(scoreValue),
      reasoning,
    };
  });
}

async function loadCandidateProfiles(candidateIds) {
  const targetIds = new Set(candidateIds);
  const candidates = new Map();
  const fileStream = createReadStream(CANDIDATES_PATH, { encoding: 'utf8' });
  const lineReader = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of lineReader) {
    if (!line.trim()) {
      continue;
    }

    const record = JSON.parse(line);
    if (!targetIds.has(record.candidate_id)) {
      continue;
    }

    candidates.set(record.candidate_id, record);
    if (candidates.size === targetIds.size) {
      break;
    }
  }

  return candidates;
}

function deriveInsights(leaderboard) {
  const scores = leaderboard.map((item) => item.score);
  const yearsOfExperience = leaderboard
    .map((item) => item.profile?.years_of_experience)
    .filter((value) => Number.isFinite(value));
  const interviewCompletionRates = leaderboard
    .map((item) => item.signals?.interview_completion_rate)
    .filter((value) => Number.isFinite(value));
  const responseTimes = leaderboard
    .map((item) => item.signals?.avg_response_time_hours)
    .filter((value) => Number.isFinite(value));
  const openToWorkCount = leaderboard.filter((item) => item.signals?.open_to_work_flag).length;
  const verifiedCount = leaderboard.filter(
    (item) => item.signals?.verified_email && item.signals?.verified_phone,
  ).length;
  const topSkillNames = leaderboard.flatMap((item) => item.skills.map((skill) => skill.name)).filter(Boolean);

  return {
    candidateCount: leaderboard.length,
    topScore: leaderboard[0]?.score ?? 0,
    medianScore: median(scores),
    averageScore: average(scores),
    scoreSpread: (leaderboard[0]?.score ?? 0) - (leaderboard.at(-1)?.score ?? 0),
    averageExperience: average(yearsOfExperience),
    medianExperience: median(yearsOfExperience),
    openToWorkCount,
    verifiedCount,
    averageInterviewCompletionRate: average(interviewCompletionRates),
    averageResponseTimeHours: average(responseTimes),
    scoreBands: [
      { label: '90+', count: leaderboard.filter((item) => item.score >= 90).length },
      { label: '80-89.9', count: leaderboard.filter((item) => item.score >= 80 && item.score < 90).length },
      { label: '70-79.9', count: leaderboard.filter((item) => item.score >= 70 && item.score < 80).length },
    ],
    topIndustries: countBy(leaderboard, (item) => item.profile?.current_industry),
    topLocations: countBy(leaderboard, (item) => item.profile?.location),
    topSkills: countBy(topSkillNames, (skillName) => skillName),
  };
}

export async function loadDashboardData() {
  const rows = await loadLeaderboardRows();
  const profiles = await loadCandidateProfiles(rows.map((row) => row.candidate_id));

  const leaderboard = rows.map((row) => {
    const candidateRecord = profiles.get(row.candidate_id) ?? {};
    const profile = candidateRecord.profile ?? null;
    const signals = candidateRecord.redrob_signals ?? null;
    const skills = candidateRecord.skills ?? [];

    return {
      ...row,
      profile,
      signals,
      skills,
    };
  });

  return {
    leaderboard,
    insights: deriveInsights(leaderboard),
  };
}