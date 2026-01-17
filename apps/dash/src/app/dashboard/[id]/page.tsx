import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { DashboardContent } from '@/components/modules/dashboard/DashboardContent'

// Wymuszamy, żeby strona zawsze pobierała świeże dane
export const dynamic = 'force-dynamic'

export default async function DashboardPage({ params }: { params: { id: string } }) {
  // 1. DATA FETCHING
  // Pobieramy najnowszy projekt.
  const project = await prisma.project.findFirst({
    orderBy: { createdAt: 'desc' },
  })

  // 2. LOGIKA PRZEKIEROWANIA (Fallback)
  // Jeśli baza jest pusta, wyrzucamy użytkownika na stronę główną (Landing Page)
  if (!project) {
    redirect('/')
  }

  // 3. DATA PARSING
  const parseData = (jsonString: string | null) => {
    if (!jsonString) return null
    try {
      return JSON.parse(jsonString)
    } catch (e) {
      return null
    }
  }

  const audit = parseData(project.auditData)
  const strategy = parseData(project.strategyData)
  const roadmap = parseData(project.roadmapData)

  // Symulacja wyniku (Health Score)
  const score =
    (audit ? 30 : 0) + (strategy ? 40 : 0) + (roadmap ? 25 : 0) + Math.floor(Math.random() * 5)

  // 4. RENDER UI
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
