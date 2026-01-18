import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DashboardContent } from "@/components/modules/dashboard/DashboardContent";
import { AuditSchema, StrategySchema, RoadmapSchema } from "@/lib/schemas";
import { safeParseJSON } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  params,
}: {
  params: { id: string }; // id bedzie uzywane ponizej do fetchowania konkretnego projektu
}) {
  const project = await prisma.project.findFirst({
    where: { id: params.id },
  });

  if (!project) {
    redirect("/");
  }

  // Użycie generycznego parsera z konkretnym schematem
  const audit = safeParseJSON(AuditSchema, project.auditData);
  const strategy = safeParseJSON(StrategySchema, project.strategyData);
  const roadmap = safeParseJSON(RoadmapSchema, project.roadmapData);

  // Symulacja wyniku
  const score =
    (audit.summary !== "Analiza w toku..." ? 30 : 0) +
    (strategy.uvp !== "Brak zdefiniowanego UVP" ? 40 : 0) +
    (roadmap.keywords.length > 0 ? 25 : 0) +
    Math.floor(Math.random() * 5);

  return (
    <DashboardContent
      project={project}
      audit={audit}
      strategy={strategy}
      roadmap={roadmap}
      score={score}
    />
  );
}
