import { prisma } from '@/lib/prisma'
import { DashboardContent } from '@/components/modules/dashboard/DashboardContent'
import { AuditSchema, StrategySchema, RoadmapSchema } from '@/lib/schemas'
import { safeParseJSON } from '@/lib/utils'
import { AnalysisTrigger } from '@/components/modules/AnalysisTrigger'

export const dynamic = 'force-dynamic'

export default async function DashboardPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params
  const project = await prisma.project.findUnique({
    where: { domain: domain },
  })

  if (!project) {
    return <AnalysisTrigger domain={domain} />
  }

  const audit = safeParseJSON(AuditSchema, project.auditData)
  const strategy = safeParseJSON(StrategySchema, project.strategyData)
  const roadmap = safeParseJSON(RoadmapSchema, project.roadmapData)

  const score =
    (audit.summary !== 'Analiza w toku...' ? 30 : 0) +
    (strategy.uvp !== 'Brak zdefiniowanego UVP' ? 40 : 0) +
    (roadmap.keywords.length > 0 ? 25 : 0) +
    Math.floor(Math.random() * 5)

  return (
    <DashboardContent
      project={project}
      audit={audit}
      strategy={strategy}
      roadmap={roadmap}
      score={score}
    />
  )
}
