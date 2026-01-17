import { prisma } from "@/lib/prisma";
import React from "react";

// Wymuszamy, żeby strona zawsze pobierała świeże dane
export const dynamic = "force-dynamic";

export default async function DashboardPage({
  params,
}: {
  params: { id: string };
}) {
  // 1. Pobieranie danych (zawsze bierzemy najnowszy, ignorując ID na potrzeby MVP)
  const project = await prisma.project.findFirst({
    orderBy: { createdAt: "desc" },
  });

  // ---------------------------------------------------------
  // UI: STAN PUSTY (Brak danych w bazie)
  // ---------------------------------------------------------
  if (!project) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#030014] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-violet-900/20 via-[#030014] to-[#030014]"></div>
        <div className="relative z-10 bg-white/5 border border-white/10 p-8 rounded-2xl text-center max-w-md backdrop-blur-md shadow-2xl">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-red-400 mb-2">
            Baza danych jest pusta
          </h1>
          <p className="text-gray-400 mb-6">
            Agent nie znalazł żadnych raportów. Uruchom serwer i przeprowadź
            pierwszą analizę.
          </p>
          <div className="bg-black/50 p-4 rounded-lg font-mono text-sm text-left text-gray-300 border border-white/5">
            $ cd apps/server
            <br />$ npm run dev
          </div>
        </div>
      </main>
    );
  }

  // ---------------------------------------------------------
  // PARSOWANIE DANYCH (JSON -> Obiekt)
  // ---------------------------------------------------------
  const parseData = (jsonString: string | null) => {
    if (!jsonString) return null;
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      return null;
    }
  };

  const audit = parseData(project.auditData);
  const strategy = parseData(project.strategyData);
  const roadmap = parseData(project.roadmapData);

  // Symulowany "Marketing Health Score" (na bazie ilości danych)
  const score =
    (audit ? 30 : 0) +
    (strategy ? 40 : 0) +
    (roadmap ? 25 : 0) +
    Math.floor(Math.random() * 5); // Mały element losowy dla realizmu

  // ---------------------------------------------------------
  // UI: GŁÓWNY DASHBOARD
  // ---------------------------------------------------------
  return (
    <main className="min-h-screen bg-[#030014] text-white font-sans selection:bg-violet-500/30 pb-20 overflow-x-hidden">
      {/* TŁO AMBIENTOWE */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-fuchsia-600/10 rounded-full blur-[120px]"></div>
      </div>

      {/* HEADER (Sticky Glass) */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#030014]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center font-bold text-lg shadow-[0_0_15px_rgba(124,58,237,0.5)]">
              AI
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-wide text-white leading-none">
                {project.domain}
              </h1>
              <p className="text-xs text-gray-500 font-mono mt-1">
                REPORT ID: {project.id.toString().padStart(6, "0")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-[10px] uppercase text-gray-500 tracking-wider">
                Ostatnia aktualizacja
              </span>
              <span className="text-xs font-mono text-gray-300">
                {new Date(project.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold tracking-wide shadow-[0_0_10px_rgba(34,197,94,0.1)]">
              ONLINE
            </div>
          </div>
        </div>
      </header>

      {/* GŁÓWNY GRID */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* 1. SEKCJA SCORE (HERO) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Karta Wyniku */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center justify-between relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-transparent opacity-0 group-hover:opacity-100 transition duration-500"></div>
            <div>
              <p className="text-sm text-gray-400 uppercase tracking-widest mb-1">
                Health Score
              </p>
              <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
                {score}%
              </h2>
            </div>
            <div className="w-16 h-16 rounded-full border-4 border-white/10 flex items-center justify-center relative">
              <div
                className="absolute inset-0 border-4 border-violet-500 rounded-full border-t-transparent animate-spin-slow"
                style={{ animationDuration: "3s" }}
              ></div>
              <span className="text-xl">📈</span>
            </div>
          </div>

          {/* Karta UVP */}
          <div className="md:col-span-2 bg-gradient-to-br from-violet-900/50 to-indigo-900/50 border border-white/10 rounded-2xl p-6 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20 text-6xl">
              💎
            </div>
            <p className="text-xs text-violet-300 uppercase tracking-widest mb-2 font-bold">
              Unikalna Wartość (UVP)
            </p>
            <p className="text-lg md:text-xl text-white font-medium leading-relaxed italic">
              "{strategy?.uvp || "Analiza w toku..."}"
            </p>
          </div>
        </section>

        {/* 2. TRZY FILARY (Audit, Strategy, Roadmap) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* KOLUMNA 1: DIAGNOZA (AUDIT) */}
          <div className="space-y-6">
            <h3 className="flex items-center gap-2 text-lg font-bold text-gray-200 border-b border-white/10 pb-2">
              <span className="text-red-500">⦿</span> DIAGNOZA
            </h3>

            {/* Podsumowanie */}
            <div className="bg-[#0a0a0b] border border-white/10 p-5 rounded-xl hover:border-red-500/30 transition duration-300">
              <p className="text-sm text-gray-400 leading-relaxed">
                {audit?.summary || "Brak danych audytu."}
              </p>
            </div>

            {/* SWOT Matrix */}
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-green-900/10 border border-green-500/20 p-4 rounded-xl">
                <h4 className="text-xs font-bold text-green-400 uppercase mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>{" "}
                  Mocne Strony
                </h4>
                <ul className="space-y-2">
                  {audit?.swot?.strengths?.map((s: string, i: number) => (
                    <li
                      key={i}
                      className="text-xs text-gray-300 flex items-start gap-2"
                    >
                      <span>✓</span> {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-red-900/10 border border-red-500/20 p-4 rounded-xl">
                <h4 className="text-xs font-bold text-red-400 uppercase mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>{" "}
                  Słabe Strony
                </h4>
                <ul className="space-y-2">
                  {audit?.swot?.weaknesses?.map((s: string, i: number) => (
                    <li
                      key={i}
                      className="text-xs text-gray-300 flex items-start gap-2"
                    >
                      <span>⚠</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* KOLUMNA 2: TOŻSAMOŚĆ (STRATEGY) */}
          <div className="space-y-6">
            <h3 className="flex items-center gap-2 text-lg font-bold text-gray-200 border-b border-white/10 pb-2">
              <span className="text-blue-500">⦿</span> STRATEGIA
            </h3>

            {/* Archetyp */}
            <div className="bg-blue-600/10 border border-blue-500/20 p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs text-blue-300 uppercase block mb-1">
                  Archetyp Marki
                </span>
                <span className="text-xl font-bold text-white">
                  {strategy?.brandArchetype || "Brak danych"}
                </span>
              </div>
              <div className="text-3xl">🎭</div>
            </div>

            {/* Persony (Karty) */}
            <div className="space-y-4">
              <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">
                Docelowi Klienci
              </p>
              {strategy?.personas?.map((persona: any, i: number) => (
                <div
                  key={i}
                  className="bg-[#0a0a0b] border border-white/10 p-4 rounded-xl relative group hover:bg-white/5 transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-violet-300">
                      {persona.name}
                    </h4>
                    <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-gray-400">
                      Persona #{i + 1}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-gray-400">
                      <span className="text-gray-600">Cel:</span>{" "}
                      {persona.goals?.[0] || "Nieznany"}
                    </p>
                    <p className="text-xs text-gray-400">
                      <span className="text-gray-600">Ból:</span>{" "}
                      {persona.painPoints?.[0] || "Nieznany"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* KOLUMNA 3: EGZEKUCJA (ROADMAP) */}
          <div className="space-y-6">
            <h3 className="flex items-center gap-2 text-lg font-bold text-gray-200 border-b border-white/10 pb-2">
              <span className="text-fuchsia-500">⦿</span> PLAN BITWY
            </h3>

            {/* Słowa kluczowe (Tags) */}
            <div className="bg-white/5 border border-white/10 p-5 rounded-xl">
              <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">
                Słowa Kluczowe
              </h4>
              <div className="flex flex-wrap gap-2">
                {roadmap?.keywords
                  ?.slice(0, 10)
                  .map((kw: string, i: number) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-300 text-xs rounded hover:bg-fuchsia-500/20 transition cursor-default"
                    >
                      #{kw}
                    </span>
                  ))}
              </div>
            </div>

            {/* Content Pillars */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase">
                Tematy Treści
              </h4>
              {roadmap?.contentPillars?.map((topic: string, i: number) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-[#0a0a0b] border border-white/5 p-3 rounded-lg"
                >
                  <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-xs font-mono text-gray-500 border border-white/10">
                    {i + 1}
                  </div>
                  <span className="text-sm text-gray-300">{topic}</span>
                </div>
              ))}
            </div>

            {/* KPI */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 border border-white/10 p-5 rounded-xl">
              <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">
                Główny Cel (KPI)
              </h4>
              <p className="text-white font-medium">
                {roadmap?.kpi?.primary || "Brak zdefiniowanego celu"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
