import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface RoadmapSectionProps {
  roadmap: any
}

export const RoadmapSection = ({ roadmap }: RoadmapSectionProps) => {
  return (
    <div className="space-y-6">
      <h3 className="flex items-center gap-2 text-lg font-bold text-gray-200 border-b border-white/10 pb-2">
        <span className="text-fuchsia-500">⦿</span> PLAN BITWY
      </h3>

      {/* Słowa kluczowe */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Słowa Kluczowe</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {roadmap?.keywords?.slice(0, 10).map((kw: string, i: number) => (
              <Badge key={i} variant="neon">
                #{kw}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Content Pillars */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
          Tematy Treści
        </h4>
        {roadmap?.contentPillars?.map((topic: string, i: number) => (
          <div
            key={i}
            className="flex items-center gap-3 bg-[#0a0a0b] border border-white/5 p-3 rounded-lg hover:border-white/20 transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-xs font-mono text-gray-500 border border-white/10">
              {i + 1}
            </div>
            <span className="text-sm text-gray-300">{topic}</span>
          </div>
        ))}
      </div>

      {/* KPI */}
      <Card className="bg-gradient-to-r from-gray-900 to-gray-800 border-white/10">
        <CardContent className="pt-6">
          <CardTitle className="mb-2 text-gray-400">Główny Cel (KPI)</CardTitle>
          <p className="text-white font-medium text-lg">
            {roadmap?.kpi?.primary || 'Brak zdefiniowanego celu'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
