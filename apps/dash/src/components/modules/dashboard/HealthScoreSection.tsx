import { Card, CardContent } from '@/components/ui/card'

interface HealthScoreSectionProps {
  score: number
  uvp: string | null
}

export const HealthScoreSection = ({ score, uvp }: HealthScoreSectionProps) => {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Karta Wyniku */}
      <Card className="flex flex-col justify-center group">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-transparent opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none"></div>
        <CardContent className="flex items-center justify-between pt-6">
          <div>
            <p className="text-sm text-gray-400 uppercase tracking-widest mb-1">Health Score</p>
            <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
              {score}%
            </h2>
          </div>
          <div className="w-16 h-16 rounded-full border-4 border-white/10 flex items-center justify-center relative">
            <div
              className="absolute inset-0 border-4 border-violet-500 rounded-full border-t-transparent animate-spin-slow"
              style={{ animationDuration: '3s' }}
            ></div>
            <span className="text-xl">📈</span>
          </div>
        </CardContent>
      </Card>

      {/* Karta UVP */}
      <Card className="md:col-span-2 bg-gradient-to-br from-violet-900/40 to-indigo-900/40 border-violet-500/20">
        <div className="absolute top-0 right-0 p-4 opacity-20 text-6xl pointer-events-none">💎</div>
        <CardContent className="flex flex-col justify-center h-full pt-6">
          <p className="text-xs text-violet-300 uppercase tracking-widest mb-2 font-bold">
            Unikalna Wartość (UVP)
          </p>
          <p className="text-lg md:text-xl text-white font-medium leading-relaxed italic">
          &quot;{uvp || 'Analiza w toku...'}&quot;
          </p>
        </CardContent>
      </Card>
    </section>
  )
}
