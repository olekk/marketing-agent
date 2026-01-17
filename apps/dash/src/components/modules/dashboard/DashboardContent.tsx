import React from 'react'
import { DashboardHeader } from './DashboardHeader'
import { HealthScoreSection } from './HealthScoreSection'
import { AuditSection } from './AuditSection'
import { StrategySection } from './StrategySection'
import { RoadmapSection } from './RoadmapSection'

interface DashboardContentProps {
  project: any
  audit: any
  strategy: any
  roadmap: any
  score: number
}

export const DashboardContent = ({
  project,
  audit,
  strategy,
  roadmap,
  score,
}: DashboardContentProps) => {
  return (
    <main className="min-h-screen bg-[#030014] text-white font-sans selection:bg-violet-500/30 pb-20 overflow-x-hidden">
      {/* TŁO AMBIENTOWE */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-fuchsia-600/10 rounded-full blur-[120px]"></div>
      </div>

      <DashboardHeader
        domain={project.domain}
        reportId={project.id}
        createdAt={project.createdAt}
      />

      {/* GŁÓWNY GRID */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 space-y-8">
        <HealthScoreSection score={score} uvp={strategy?.uvp} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <AuditSection audit={audit} />
          <StrategySection strategy={strategy} />
          <RoadmapSection roadmap={roadmap} />
        </div>
      </div>
    </main>
  )
}
