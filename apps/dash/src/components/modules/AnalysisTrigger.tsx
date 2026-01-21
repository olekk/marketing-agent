'use client'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { LoadingScreen } from './LoadingScreen'

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

        if (res.ok) {
          const data = await res.json()
          // Przekieruj na dashboard z czystą domeną z serwera
          if (data.domain) {
            router.push(`/dashboard/${data.domain}`)
          } else {
            // Fallback - odśwież obecną stronę
            router.refresh()
          }
        }
      } catch (error) {
        console.error('Błąd komunikacji z serwerem:', error)
      }
    }

    startAnalysis()
  }, [domain, router])

  return <LoadingScreen onFinished={() => {}} />
}