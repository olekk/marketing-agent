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

  const [isDone, setIsDone] = useState(false)

  const [targetUrl, setTargetUrl] = useState<string | null>(null)

  useEffect(() => {
    if (hasStarted.current) return
    hasStarted.current = true

    const startAnalysis = async () => {
      try {
        const API_URL = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3000'

        const res = await fetch(`${API_URL}/api/project/analyze`, {
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

        if (parsed.success && parsed.data.domain) {
          setTargetUrl(`/dashboard/${parsed.data.domain}`)
          setIsDone(true)
        } else {
          router.refresh()
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Nie udało się połączyć z serwerem'
        router.push(`/?error=${encodeURIComponent(message)}`)
      }
    }

    startAnalysis()
  }, [domain, router])

  const handleAnimationComplete = () => {
    if (targetUrl) {
      router.push(targetUrl)
    }
  }

  return <LoadingScreen isFinished={isDone} onAnimationComplete={handleAnimationComplete} />
}
