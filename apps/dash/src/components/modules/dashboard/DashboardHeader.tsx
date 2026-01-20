import { Badge } from '@/components/ui/badge'

interface DashboardHeaderProps {
  domain: string
  reportId: string
  createdAt: Date
}

export const DashboardHeader = ({ domain, reportId, createdAt }: DashboardHeaderProps) => {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#030014]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center font-bold text-lg shadow-[0_0_15px_rgba(124,58,237,0.5)]">
            AI
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wide text-white leading-none">{domain}</h1>
            <p className="text-xs text-gray-500 font-mono mt-1">
              REPORT ID: {reportId.toString().padStart(6, '0')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="md:flex flex-col text-right">
            <span className="text-[10px] uppercase text-gray-500 tracking-wider">
              Ostatnia aktualizacja: &nbsp;
            </span>
            <span className="text-xs font-mono text-gray-300">
            {new Date(createdAt).toLocaleDateString('en-GB', { dateStyle: 'medium' })}            </span>
          </div>
          <Badge variant="success">ONLINE</Badge>
        </div>
      </div>
    </header>
  )
}
