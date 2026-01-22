'use client'
import { useEffect, useRef } from 'react'
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

  useEffect(() => {
    // Zabezpieczenie przed wielokrotnym wywołaniem (React Strict Mode w dev)
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

        const raw = await res.json().catch(() => ({}))
        const parsed = successResponseSchema.safeParse(raw)
        // Przekieruj na dashboard z czystą domeną z serwera
        if (parsed.success && parsed.data.domain) {
          router.push(`/dashboard/${parsed.data.domain}`)
        } else {
          // Fallback - odśwież obecną stronę
          router.refresh()
        }
      } catch (error) {
        console.error('Błąd komunikacji z serwerem:', error)
        const message =
          error instanceof Error
            ? error.message
            : 'Nie udało się połączyć z serwerem'
        router.push(`/?error=${encodeURIComponent(message)}`)
      }
    }

    startAnalysis()
  }, [domain, router])

  return <LoadingScreen onFinished={() => {}} />
}