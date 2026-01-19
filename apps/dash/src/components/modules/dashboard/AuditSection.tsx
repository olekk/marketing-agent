import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { type AuditData } from '@/lib/schemas'

interface AuditSectionProps {
  audit: AuditData
}

export const AuditSection = ({ audit }: AuditSectionProps) => {
  return (
    <div className="space-y-6">
      <h3 className="flex items-center gap-2 text-lg font-bold text-gray-200 border-b border-white/10 pb-2">
        <span className="text-red-500">⦿</span> DIAGNOZA
      </h3>

      {/* Podsumowanie */}
      <Card className="bg-[#0a0a0b] hover:border-red-500/30">
        <CardContent className="pt-6">
          <p className="text-sm text-gray-400 leading-relaxed">
            {audit?.summary || 'Brak danych audytu.'}
          </p>
        </CardContent>
      </Card>

      {/* SWOT */}
      <div className="grid grid-cols-1 gap-4">
        {/* Mocne strony */}
        <Card className="bg-green-900/10 border-green-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-green-400 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Mocne Strony
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {audit?.swot?.strengths?.map((s: string, i: number) => (
                <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                  <span className="text-green-500">✓</span> {s}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Słabe strony */}
        <Card className="bg-red-900/10 border-red-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-red-400 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span> Słabe Strony
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {audit?.swot?.weaknesses?.map((s: string, i: number) => (
                <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                  <span className="text-red-500">⚠</span> {s}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
