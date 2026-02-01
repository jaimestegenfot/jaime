"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  playerInfo,
  teamFilters,
  seasonsShort,
  seasonStats,
  getFilteredStats,
  getTotalsFromStats,
  type TeamFilter,
} from "@/data/player";
import { translations } from "@/i18n/translations";

const menuItemIds = [
  { id: "inicio", key: "home" as const },
  { id: "estadisticas", key: "stats" as const },
  { id: "equipos", key: "teams" as const },
  { id: "foto-equipo", key: "teamPhoto" as const },
  { id: "trayectoria", key: "career" as const },
  { id: "datos", key: "playerData" as const },
  { id: "contacto", key: "contact" as const },
] as const;

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [filterTeam, setFilterTeam] = useState<TeamFilter>("TOTAL");
  const [filterSeason, setFilterSeason] = useState<string | null>(null);
  const [lang, setLang] = useState<"ESP" | "ENG" | "CAT">("ESP");
  const [photoError, setPhotoError] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuOpen && menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  const stats = getFilteredStats(filterTeam, filterSeason);
  const totals = getTotalsFromStats(stats);
  const t = translations[lang];
  const decimalSep = lang === "ENG" ? "." : ",";
  const avgGoals = totals.matches > 0 ? (totals.goals / totals.matches).toFixed(2).replace(".", decimalSep) : (lang === "ENG" ? "0.00" : "0,00");
  const avgAssists = totals.matches > 0 ? (totals.assists / totals.matches).toFixed(2).replace(".", decimalSep) : (lang === "ENG" ? "0.00" : "0,00");

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0f0a14]">
      {/* Fondo: foto de portada + overlay rosa/morado para legibilidad */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/portada.jpeg')" }}
      />
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(88, 28, 135, 0.88) 0%, rgba(15, 10, 20, 0.92) 50%, rgba(236, 72, 153, 0.2) 100%)`,
        }}
      />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(236,72,153,0.2),transparent)]" />

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Header: MENU + título + filtros equipo + idioma */}
        <header className="flex flex-wrap items-start justify-between gap-4 px-4 pt-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4" ref={menuRef}>
            <div className="relative inline-block w-fit">
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 text-left text-sm font-medium uppercase tracking-widest text-white/80 hover:text-white"
                aria-expanded={menuOpen}
                aria-haspopup="true"
              >
                {t.header.menu}
                <span className={`inline-block transition-transform ${menuOpen ? "rotate-180" : ""}`}>▼</span>
              </button>
              {/* Menú desplegable */}
              {menuOpen && (
                <div className="absolute left-0 top-full z-50 mt-2 min-w-[220px] rounded-xl border border-white/10 bg-[#1a0f24] py-2 shadow-xl backdrop-blur-xl">
                  {menuItemIds.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-3 text-sm font-medium text-white/90 transition-colors hover:bg-[#ec4899]/20 hover:text-[#ec4899]"
                    >
                      {t.menu[item.key]}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Foto del jugador: por defecto usa portada; añade public/foto-perfil.jpg y cambia el src para una foto propia */}
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 border-[#ec4899]/50 bg-white/10 ring-2 ring-white/10 sm:h-28 sm:w-28">
                {!photoError ? (
                  <Image
                    src="/perfil.jpeg"
                    alt={playerInfo.name}
                    fill
                    className="object-cover"
                    sizes="112px"
                    onError={() => setPhotoError(true)}
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-3xl font-bold text-[#ec4899] sm:text-4xl">
                    {playerInfo.number}
                  </span>
                )}
              </div>
              <h1 id="inicio" className="scroll-mt-24 text-4xl font-bold tracking-tight text-[#ec4899] sm:text-5xl md:text-6xl">
                {playerInfo.name.toUpperCase()} STATS
              </h1>
            </div>
          </div>

          <div className="min-w-0 w-full overflow-x-auto overflow-y-hidden scroll-smooth">
            <div className="flex min-w-max flex-col items-end gap-3">
              <div className="flex flex-nowrap gap-1 rounded-full bg-white/10 px-1 py-1">
                {teamFilters.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setFilterTeam(t.key)}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors sm:px-4 sm:text-sm ${
                      filterTeam === t.key
                        ? "bg-[#ec4899] text-white"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="flex flex-nowrap gap-2 text-xs font-medium uppercase tracking-wider text-white/60">
                {(["CAT", "ENG", "ESP"] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLang(l)}
                    className={`shrink-0 ${lang === l ? "text-[#ec4899]" : "hover:text-white/80"}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:flex-row lg:gap-12 lg:px-8 lg:py-12">
          {/* Columna izquierda: TOTAL / TEMP + temporadas */}
          <aside id="estadisticas" className="scroll-mt-24 flex shrink-0 flex-col gap-6 lg:w-48">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold uppercase tracking-wider text-white/90">
                {t.sidebar.total}
              </span>
              <span className="text-sm font-semibold uppercase tracking-wider text-white/70">
                {t.sidebar.season}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setFilterSeason(null)}
                className={`h-10 min-w-[4rem] rounded-full px-4 text-sm font-semibold transition-colors ${
                  filterSeason === null
                    ? "bg-[#ec4899] text-white ring-2 ring-[#ec4899] ring-offset-2 ring-offset-[#0f0a14]"
                    : "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
                }`}
              >
                {t.sidebar.all}
              </button>
              {seasonsShort.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFilterSeason(s)}
                  className={`h-10 min-w-[4rem] rounded-full px-4 text-sm font-semibold transition-colors ${
                    filterSeason === s
                      ? "bg-[#ec4899] text-white ring-2 ring-[#ec4899] ring-offset-2 ring-offset-[#0f0a14]"
                      : "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </aside>

          {/* Bloques de estadísticas grandes (estilo messi.com) */}
          <section className="flex flex-1 flex-col gap-6 lg:gap-8">
            {/* GOLES */}
            <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-5 backdrop-blur-sm">
              <div className="flex flex-wrap items-baseline justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-[#f472b6]">
                    {t.stats.goals}
                  </p>
                  <p className="mt-1 text-4xl font-bold tabular-nums text-white sm:text-5xl">
                    {totals.goals}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
                    {t.stats.average}
                  </p>
                  <p className="text-2xl font-bold tabular-nums text-white sm:text-3xl">
                    {avgGoals}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-6 border-t border-white/10 pt-4">
                <span className="text-sm font-medium text-white/80">
                  {totals.hatTricks} {t.stats.hatTrick}
                </span>
                <span className="text-sm font-medium text-white/80">
                  {totals.dobletes} {t.stats.braces}
                </span>
              </div>
            </div>

            {/* ASISTENCIAS */}
            <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-5 backdrop-blur-sm">
              <div className="flex flex-wrap items-baseline justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-[#f472b6]">
                    {t.stats.assists}
                  </p>
                  <p className="mt-1 text-4xl font-bold tabular-nums text-white sm:text-5xl">
                    {totals.assists}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
                    {t.stats.average}
                  </p>
                  <p className="text-2xl font-bold tabular-nums text-white sm:text-3xl">
                    {avgAssists}
                  </p>
                </div>
              </div>
            </div>

            {/* PARTIDOS */}
            <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-5 backdrop-blur-sm">
              <p className="text-sm font-semibold uppercase tracking-wider text-[#f472b6]">
                {t.stats.matches}
              </p>
              <p className="mt-1 text-4xl font-bold tabular-nums text-white sm:text-5xl">
                {totals.matches}
              </p>
            </div>

            {/* TÍTULOS */}
            <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-5 backdrop-blur-sm">
              <p className="text-sm font-semibold uppercase tracking-wider text-[#f472b6]">
                {t.stats.titles}
              </p>
              <p className="mt-1 text-4xl font-bold tabular-nums text-white sm:text-5xl">
                {totals.titles}
              </p>
            </div>
          </section>
        </main>

        {/* Sección Equipos */}
        <section id="equipos" className="scroll-mt-24 border-t border-white/10 px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-2xl font-bold text-[#ec4899]">{t.sections.teams}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from(new Set(seasonStats.map((s) => s.club))).map((club) => {
              const clubStats = seasonStats.filter((s) => s.club === club);
              const clubTotals = getTotalsFromStats(clubStats);
              return (
                <div
                  key={club}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
                >
                  <h3 className="text-lg font-semibold text-white">{club}</h3>
                  <p className="mt-1 text-sm text-white/60">{clubStats[0]?.league}</p>
                  <div className="mt-4 flex gap-4 text-sm">
                    <span className="text-white/80">{clubTotals.matches} PJ</span>
                    <span className="text-[#f472b6]">{clubTotals.goals} {t.teamsCard.goals}</span>
                    <span className="text-white/80">{clubTotals.assists} {t.teamsCard.assists}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Sección Foto de equipo */}
        <section id="foto-equipo" className="scroll-mt-24 border-t border-white/10 px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-2xl font-bold text-[#ec4899]">{t.sections.teamPhoto}</h2>
          <div className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
            <Image
              src="/portada.jpeg"
              alt={t.alt.teamPhoto}
              width={1200}
              height={800}
              className="h-auto w-full object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
              priority={false}
            />
          </div>
        </section>

        {/* Sección Trayectoria (tabla por temporada) */}
        <section id="trayectoria" className="scroll-mt-24 border-t border-white/10 px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-2xl font-bold text-[#ec4899]">{t.sections.career}</h2>
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="px-4 py-3 font-semibold text-white/90">{t.table.season}</th>
                  <th className="px-4 py-3 font-semibold text-white/90">{t.table.team}</th>
                  <th className="px-4 py-3 font-semibold text-white/90">{t.table.competition}</th>
                  <th className="px-4 py-3 text-right font-semibold text-white/90">{t.table.played}</th>
                  <th className="px-4 py-3 text-right font-semibold text-white/90">{t.table.goals}</th>
                  <th className="px-4 py-3 text-right font-semibold text-white/90">{t.table.assists}</th>
                  <th className="px-4 py-3 text-right font-semibold text-white/90">{t.table.titles}</th>
                </tr>
              </thead>
              <tbody>
                {seasonStats.map((row, i) => (
                  <tr key={`${row.season}-${row.club}`} className={`border-b border-white/5 ${i % 2 === 0 ? "bg-white/5" : ""}`}>
                    <td className="px-4 py-3 font-medium text-white">{row.season}</td>
                    <td className="px-4 py-3 text-white/80">{row.club}</td>
                    <td className="px-4 py-3 text-white/60">{row.league}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-white">{row.matches}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-[#f472b6]">{row.goals}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-white/80">{row.assists}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-white/80">{row.titles}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Sección Datos del jugador */}
        <section id="datos" className="scroll-mt-24 border-t border-white/10 px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-2xl font-bold text-[#ec4899]">{t.sections.playerData}</h2>
          <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex justify-between border-b border-white/10 py-3 sm:flex-col sm:gap-1">
              <span className="text-sm text-white/60">{t.playerData.position}</span>
              <span className="font-medium text-white">{playerInfo.position}</span>
            </div>
            <div className="flex justify-between border-b border-white/10 py-3 sm:flex-col sm:gap-1">
              <span className="text-sm text-white/60">{t.playerData.jerseyNumber}</span>
              <span className="font-medium text-white">{playerInfo.number}</span>
            </div>
            <div className="flex justify-between border-b border-white/10 py-3 sm:flex-col sm:gap-1">
              <span className="text-sm text-white/60">{t.playerData.birthDate}</span>
              <span className="font-medium text-white">{playerInfo.birthDate}</span>
            </div>
            <div className="flex justify-between border-b border-white/10 py-3 sm:flex-col sm:gap-1">
              <span className="text-sm text-white/60">{t.playerData.birthPlace}</span>
              <span className="font-medium text-white">{playerInfo.birthPlace}</span>
            </div>
            <div className="flex justify-between border-b border-white/10 py-3 sm:flex-col sm:gap-1">
              <span className="text-sm text-white/60">{t.playerData.height}</span>
              <span className="font-medium text-white">{playerInfo.height}</span>
            </div>
            <div className="flex justify-between border-b border-white/10 py-3 sm:flex-col sm:gap-1">
              <span className="text-sm text-white/60">{t.playerData.nationality}</span>
              <span className="font-medium text-white">{playerInfo.nationality}</span>
            </div>
            <div className="flex justify-between border-b border-white/10 py-3 sm:flex-col sm:gap-1">
              <span className="text-sm text-white/60">{t.playerData.currentClub}</span>
              <span className="font-medium text-white">{playerInfo.currentClub}</span>
            </div>
            <div className="flex justify-between border-b border-white/10 py-3 sm:flex-col sm:gap-1">
              <span className="text-sm text-white/60">{t.playerData.contractUntil}</span>
              <span className="font-medium text-white">{playerInfo.contractUntil}</span>
            </div>
          </div>
        </section>

        {/* Sección Contacto */}
        <section id="contacto" className="scroll-mt-24 border-t border-white/10 px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-2xl font-bold text-[#ec4899]">{t.sections.contact}</h2>
          <div className="flex flex-wrap gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <a href="#" className="rounded-full bg-[#ec4899]/20 px-5 py-2.5 text-sm font-medium text-[#ec4899] transition-colors hover:bg-[#ec4899]/30">
              Instagram
            </a>
            <a href="#" className="rounded-full bg-[#ec4899]/20 px-5 py-2.5 text-sm font-medium text-[#ec4899] transition-colors hover:bg-[#ec4899]/30">
              Twitter / X
            </a>
            <a href="#" className="rounded-full bg-[#ec4899]/20 px-5 py-2.5 text-sm font-medium text-[#ec4899] transition-colors hover:bg-[#ec4899]/30">
              TikTok
            </a>
          </div>
        </section>

        <footer className="py-6 text-center text-xs font-medium uppercase tracking-wider text-white/50">
          {playerInfo.name} · {t.footer.jersey} {playerInfo.number}
        </footer>
      </div>
    </div>
  );
}
