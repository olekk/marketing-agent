'use client'

import { useState, useEffect } from 'react'

const LOADING_MESSAGES = [
  'Skanowanie struktury domeny...',
  'Analiza widoczności w Google (SERP)...',
  'Wykrywanie luk w strategii konkurencji...',
  'Generowanie profilu psychograficznego klienta...',
  'Obliczanie potencjału rynkowego (TAM)...',
  'Finalizowanie raportu strategicznego...',
]

interface LoadingScreenProps {
  isFinished: boolean // Nowy prop: Czy serwer już odpowiedział?
  onAnimationComplete: () => void // Wywołamy to DOPIERO jak pasek dojdzie do 100%
}

export function LoadingScreen({ isFinished, onAnimationComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    // 1. Logika paska postępu
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        // SCENARIUSZ A: Serwer odpowiedział (isFinished = true)
        if (isFinished) {
          // Jeśli już mamy 100%, czyścimy i kończymy
          if (prev >= 100) {
            clearInterval(progressInterval)
            return 100
          }
          // Bardzo szybkie dobijanie do 100% (np. +5 na klatkę)
          return prev + 5
        }

        // SCENARIUSZ B: Czekamy na serwer (isFinished = false)
        
        // Jeśli jesteśmy na 80%, zatrzymujemy się i czekamy
        if (prev >= 80) {
          return 80
        }

        // Faza 1: 0% -> 20% (Wolno - budowanie napięcia)
        if (prev < 20) {
          return prev + 0.2
        }

        // Faza 2: 20% -> 80% (Szybko - symulacja pracy)
        return prev + 1.5
      })
    }, 50) // Częstsze odświeżanie dla płynności

    // 2. Logika zmiany tekstów
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length)
    }, 1800)

    return () => {
      clearInterval(progressInterval)
      clearInterval(messageInterval)
    }
  }, [isFinished])

  // Obserwator: Wywołaj callback tylko gdy fizycznie dobijemy do 100%
  useEffect(() => {
    if (progress >= 100) {
      // Małe opóźnienie, żeby user nacieszył oko "setką"
      const timeout = setTimeout(() => {
        onAnimationComplete()
      }, 200)
      return () => clearTimeout(timeout)
    }
    return undefined
  }, [progress, onAnimationComplete])

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#030014] text-white overflow-hidden">
      {/* Tło ambientowe */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[128px]"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-[128px]"></div>

      <div className="w-full max-w-lg space-y-10 text-center z-10 p-6">
        {/* Centralny Radar */}
        <div className="relative w-32 h-32 mx-auto">
          <div className="absolute inset-0 border-2 border-violet-500/30 rounded-full animate-ping"></div>
          <div className="absolute inset-0 border-2 border-violet-500 rounded-full shadow-[0_0_15px_rgba(139,92,246,0.5)] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <span className="text-2xl font-mono font-bold text-white">{Math.min(100, Math.round(progress))}%</span>
          </div>
          <div className="absolute inset-0 border-t-2 border-fuchsia-500 rounded-full animate-spin"></div>
        </div>

        {/* Teksty */}
        <div className="space-y-4 min-h-20">
          <h2 className="text-xl font-mono text-violet-200">
            <span className="animate-pulse"> {LOADING_MESSAGES[messageIndex]}</span>
          </h2>
          {/* Kropki */}
          <div className="flex justify-center gap-2">
            <span className="w-2 h-2 bg-violet-500 rounded-full animate-bounce delay-75"></span>
            <span className="w-2 h-2 bg-violet-500 rounded-full animate-bounce delay-150"></span>
            <span className="w-2 h-2 bg-violet-500 rounded-full animate-bounce delay-300"></span>
          </div>
        </div>

        {/* Pasek Postępu */}
        <div className="w-full bg-gray-800/50 border border-white/10 rounded-full h-1 overflow-hidden">
          <div
            className="bg-linear-to-r from-violet-600 to-fuchsia-600 h-full transition-all duration-75 ease-linear shadow-[0_0_10px_#8b5cf6]"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  )
}