import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface StrategySectionProps {
  strategy: any
}

export const StrategySection = ({ strategy }: StrategySectionProps) => {
  return (
    <div className="space-y-6">
      <h3 className="flex items-center gap-2 text-lg font-bold text-gray-200 border-b border-white/10 pb-2">
        <span className="text-blue-500">⦿</span> STRATEGIA
      </h3>

      {/* Archetyp */}
      <Card className="bg-blue-600/10 border-blue-500/20">
        <CardContent className="flex items-center justify-between pt-6">
          <div>
            <span className="text-xs text-blue-300 uppercase block mb-1 font-bold tracking-widest">
              Archetyp Marki
            </span>
            <span className="text-xl font-bold text-white">
              {strategy?.brandArchetype || 'Brak danych'}
            </span>
          </div>
          <div className="text-3xl">🎭</div>
        </CardContent>
      </Card>

      {/* Persony */}
      <div className="space-y-4">
        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">
          Docelowi Klienci
        </p>
        {strategy?.personas?.map((persona: any, i: number) => (
          <Card key={i} className="bg-[#0a0a0b] hover:bg-white/5">
            <CardContent className="pt-4 pb-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-violet-300">{persona.name}</h4>
                <Badge variant="outline">Persona #{i + 1}</Badge>
              </div>
              <div className="space-y-2 mt-3">
                <p className="text-xs text-gray-400">
                  <strong className="text-gray-500 block mb-0.5">CEL:</strong>
                  {persona.goals?.[0] || 'Nieznany'}
                </p>
                <p className="text-xs text-gray-400">
                  <strong className="text-gray-500 block mb-0.5">BÓL:</strong>
                  {persona.painPoints?.[0] || 'Nieznany'}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
