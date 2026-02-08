export type SeasonStats = {
  season: string;
  seasonShort: string; // "24/25", "23/24"
  club: string;
  clubKey: string; // clave para el filtro por equipo (debe coincidir con TeamFilter)
  league: string;
  matches: number;
  goals: number;
  assists: number;
  minutes: number;
  yellowCards: number;
  redCards: number;
  hatTricks: number;
  dobletes: number;
  titles: number;
};

export type PlayerInfo = {
  name: string;
  number: number;
  position: string;
  birthDate: string;
  birthPlace: string;
  height: string;
  nationality: string;
  currentClub: string;
  currentLeague: string;
  contractUntil: string;
};

export const playerInfo: PlayerInfo = {
  name: "Jaime",
  number: 10,
  position: "Extremo Izquierdo / Delantero",
  birthDate: "—",
  birthPlace: "Brasil",
  height: "1.69 m",
  nationality: "Peruana",
  currentClub: "Cojos Fc",
  currentLeague: "—",
  contractUntil: "2027",
};

// Calcula hat-tricks y dobletes coherentes con goles y partidos
// Doblete = 2+ goles/partido; Hat-trick = 3+ goles (incluido en dobletes)
const TARGET_HAT_TRICKS = 60;

function getValidRange(goals: number, matches: number): { minH: number; maxH: number } {
  const excess = goals - matches;
  if (excess <= 0) return { minH: 0, maxH: 0 };
  const maxH = Math.min(matches, Math.floor(goals / 3));
  for (let h = 0; h <= maxH; h++) {
    const minD = Math.max(h, excess - h);
    const maxD = Math.min(matches, Math.floor((goals - h) / 2));
    if (minD <= maxD) return { minH: h, maxH: maxH };
  }
  return { minH: 0, maxH: 0 };
}

function calcHatTricksAndDobletes(
  goals: number,
  matches: number,
  targetH: number
): { hatTricks: number; dobletes: number } {
  const excess = goals - matches;
  if (excess <= 0) return { hatTricks: 0, dobletes: 0 };
  const { minH, maxH } = getValidRange(goals, matches);
  const h = Math.max(minH, Math.min(maxH, targetH));
  const minD = Math.max(h, excess - h);
  const d = minD;
  return { hatTricks: h, dobletes: d };
}

const rawSeasonStats: Omit<SeasonStats, "hatTricks" | "dobletes">[] = [
  { season: "2025/26", seasonShort: "25/26", club: "Cojos Fc", clubKey: "Cojos Fc", league: "Liga Local", matches: 23, goals: 55, assists: 12, minutes: 2070, yellowCards: 2, redCards: 0, titles: 1 },
  { season: "2024/25", seasonShort: "24/25", club: "Cojos Fc", clubKey: "Cojos Fc", league: "Liga Local", matches: 24, goals: 40, assists: 12, minutes: 1980, yellowCards: 2, redCards: 0, titles: 1 },
  { season: "2023/24", seasonShort: "23/24", club: "Chamos Fc", clubKey: "Chamos Fc", league: "Liga Local", matches: 28, goals: 35, assists: 15, minutes: 2320, yellowCards: 3, redCards: 0, titles: 2 },
  { season: "2022/23", seasonShort: "22/23", club: "Panas Fc", clubKey: "Panas Fc", league: "Liga Local", matches: 26, goals: 30, assists: 11, minutes: 2100, yellowCards: 4, redCards: 0, titles: 0 },
  { season: "2021/22", seasonShort: "21/22", club: "Barrio Fc", clubKey: "Barrio Fc", league: "Liga Local", matches: 60, goals: 100, assists: 9, minutes: 2450, yellowCards: 5, redCards: 1, titles: 0 },
  { season: "2020/21", seasonShort: "20/21", club: "Juvenil", clubKey: "Juvenil Fc", league: "Liga Juvenil", matches: 22, goals: 25, assists: 18, minutes: 1760, yellowCards: 1, redCards: 0, titles: 1 },
  { season: "2019/20", seasonShort: "19/20", club: "Juvenil", clubKey: "Juvenil Fc", league: "Liga Juvenil", matches: 120, goals: 220, assists: 50, minutes: 1760, yellowCards: 1, redCards: 0, titles: 1 },
];

// Distribuye TARGET_HAT_TRICKS proporcionalmente por goles entre temporadas
const totalGoals = rawSeasonStats.reduce((acc, s) => acc + s.goals, 0);
const hatTrickTargets = rawSeasonStats.map((s) => {
  const { minH, maxH } = getValidRange(s.goals, s.matches);
  const proportional = Math.round((s.goals / totalGoals) * TARGET_HAT_TRICKS);
  return Math.max(minH, Math.min(maxH, proportional));
});
let htSum = hatTrickTargets.reduce((a, b) => a + b, 0);
// Ajusta fino para llegar a TARGET_HAT_TRICKS
while (htSum < TARGET_HAT_TRICKS) {
  const i = hatTrickTargets.findIndex((t, idx) => t < getValidRange(rawSeasonStats[idx].goals, rawSeasonStats[idx].matches).maxH);
  if (i < 0) break;
  hatTrickTargets[i]++;
  htSum++;
}
while (htSum > TARGET_HAT_TRICKS) {
  const i = hatTrickTargets.findIndex((t, idx) => t > getValidRange(rawSeasonStats[idx].goals, rawSeasonStats[idx].matches).minH);
  if (i < 0) break;
  hatTrickTargets[i]--;
  htSum--;
}

export const seasonStats: SeasonStats[] = rawSeasonStats.map((s, i) => {
  const { hatTricks, dobletes } = calcHatTricksAndDobletes(s.goals, s.matches, hatTrickTargets[i]);
  return { ...s, hatTricks, dobletes };
});

export type TeamFilter = "TOTAL" | "Cojos Fc" | "Chamos Fc" | "Panas Fc" | "Barrio Fc" | "Juvenil Fc";

export const teamFilters: { key: TeamFilter; label: string }[] = [
  { key: "TOTAL", label: "TOTAL" },
  { key: "Cojos Fc", label: "Cojos Fc" },
  { key: "Chamos Fc", label: "Chamos Fc" },
  { key: "Panas Fc", label: "Panas Fc" },
  { key: "Barrio Fc", label: "Barrio Fc" },
  { key: "Juvenil Fc", label: "Juvenil Fc" },
];

export function getFilteredStats(
  teamKey: TeamFilter,
  seasonShort: string | null
): SeasonStats[] {
  let list = teamKey === "TOTAL" ? seasonStats : seasonStats.filter((s) => s.clubKey === teamKey);
  if (seasonShort) list = list.filter((s) => s.seasonShort === seasonShort);
  return list;
}

export function getTotalsFromStats(stats: SeasonStats[]) {
  if (stats.length === 0)
    return { matches: 0, goals: 0, assists: 0, minutes: 0, hatTricks: 0, dobletes: 0, titles: 0 };
  return {
    matches: stats.reduce((acc, s) => acc + s.matches, 0),
    goals: stats.reduce((acc, s) => acc + s.goals, 0),
    assists: stats.reduce((acc, s) => acc + s.assists, 0),
    minutes: stats.reduce((acc, s) => acc + s.minutes, 0),
    hatTricks: stats.reduce((acc, s) => acc + s.hatTricks, 0),
    dobletes: stats.reduce((acc, s) => acc + s.dobletes, 0),
    titles: stats.reduce((acc, s) => acc + s.titles, 0),
  };
}

export const careerTotals = getTotalsFromStats(seasonStats);

export const seasonsShort = Array.from(new Set(seasonStats.map((s) => s.seasonShort))).sort().reverse();
