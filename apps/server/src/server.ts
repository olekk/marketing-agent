import express, { Request, Response } from 'express'
import cors from 'cors'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import { runOrchestrator } from './orchestrator'

const execAsync = promisify(exec)
const WORKSPACE_ROOT = path.resolve(__dirname, '../..')

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Główny endpoint do analizy
app.post('/api/project/analyze', async (req: Request, res: Response) => {
  try {
    const { domain } = req.body

    if (!domain || typeof domain !== 'string') {
      return res.status(400).json({
        error: 'Domena jest wymagana',
        message: 'Proszę podać prawidłowy URL w polu "domain"',
      })
    }

    console.log(`📨 Otrzymano zapytanie o analizę: ${domain}`)

    // Uruchom orkiestratora
    const result = await runOrchestrator(domain)

    // Synchronizuj bazę danych między serwerem a dashboardem
    console.log('🔄 Synchronizacja bazy danych...')
    try {
      await execAsync('npm run db:sync', {
        cwd: WORKSPACE_ROOT, // Uruchom z głównego katalogu workspace
      })
      console.log('✅ Baza zsynchronizowana')
    } catch (syncError) {
      console.error('⚠️ Błąd synchronizacji bazy:', syncError)
      // Nie rzucamy błędu - analiza się powiodła, synchronizacja to bonus
    }

    res.json({
      success: true,
      message: 'Analiza zakończona pomyślnie',
      projectId: result.projectId,
      domain: result.domain,
    })
  } catch (error) {
    console.error('❌ Błąd podczas analizy:', error)
    res.status(500).json({
      error: 'Błąd serwera',
      message: error instanceof Error ? error.message : 'Nieznany błąd',
    })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 Serwer nasłuchuje na porcie ${PORT}`)
  console.log(`📍 Health check: http://localhost:${PORT}/health`)
  console.log(`📍 API endpoint: http://localhost:${PORT}/api/project/analyze`)
})
