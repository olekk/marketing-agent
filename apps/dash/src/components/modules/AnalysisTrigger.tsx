'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LoadingScreen } from './LoadingScreen'
import { z } from 'zod'

const errorResponseSchema = z.object({
  message: z.string().optional(),
})

const successResponseSchema = z.object({
  domain: z.string().optional(),
})

export const AnalysisTrigger = ({ domain }: { domain: string }) => {
  const router = useRouter()
  const hasStarted = useRef(false)
  
  // Stan: Czy backend skończył pracę? (To uwolni pasek z 80% do 100%)
  const [isDone, setIsDone] = useState(false)
  
  // Stan: Gdzie mamy przekierować po zakończeniu animacji?
  const [targetUrl, setTargetUrl] = useState<string | null>(null)

  useEffect(() => {
    if (hasStarted.current) return
    hasStarted.current = true

    const startAnalysis = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/project/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ domain }),
        })

        // BŁĄD: Przekierowujemy natychmiast (nie czekamy na animację 100%, bo to błąd)
        if (!res.ok) {
          const raw = await res.json().catch(() => ({}))
          const parsed = errorResponseSchema.safeParse(raw)
          const message =
            parsed.success && parsed.data.message
              ? parsed.data.message
              : `Błąd serwera (${res.status})`
          router.push(`/?error=${encodeURIComponent(message)}`)
          return
        }

        // SUKCES:
        const raw = await res.json().catch(() => ({}))
        const parsed = successResponseSchema.safeParse(raw)
        
        if (parsed.success && parsed.data.domain) {
          // 1. Zapisujemy cel podróży
          setTargetUrl(`/dashboard/${parsed.data.domain}`)
          // 2. Dajemy sygnał LoadingScreenowi: "Dobij do 100%!"
          setIsDone(true)
        } else {
          router.refresh()
        }

      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Nie udało się połączyć z serwerem'
        router.push(`/?error=${encodeURIComponent(message)}`)
      }
    }

    startAnalysis()
  }, [domain, router])

  // Callback: Wykona się dopiero, gdy pasek wizualnie dojdzie do 100%
  const handleAnimationComplete = () => {
    if (targetUrl) {
      router.push(targetUrl)
    }
  }

  return (
    <LoadingScreen 
      isFinished={isDone} 
      onAnimationComplete={handleAnimationComplete} 
    />
  )
}