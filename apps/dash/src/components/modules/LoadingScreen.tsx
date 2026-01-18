'use client'

import { useState, useEffect } from 'react'

const LOADING_MESSAGES = [
  'Inicjalizacja łącza neuronowego...',
  'Skanowanie struktury domeny...',
  'Analiza widoczności w Google (SERP)...',
  'Wykrywanie luk w strategii konkurencji...',
  'Generowanie profilu psychograficznego klienta...',
  'Obliczanie potencjału rynkowego (TAM)...',
  'Finalizowanie raportu strategicznego...',
]

interface LoadingScreenProps {
  onFinished: () => void // Funkcja, którą wywołamy, gdy pasek dojdzie do końca
}

export function LoadingScreen({ onFinished }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    // 1. Logika paska postępu
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        // Zwalniamy przy końcu (symulacja trudnych obliczeń)
        const jump = Math.max(0.5, (95 - prev) / 15)
        const newValue = prev + jump

        // Jeśli dobiło do setki (lub prawie), wywołaj callback
        if (newValue >= 99) {
          // Małe opóźnienie, żeby user zobaczył 100%
          setTimeout(onFinished, 500)
          return 100
        }
        return newValue
      })
    }, 100)

    // 2. Logika zmiany tekstów
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length)
    }, 1800)

    return () => {
      clearInterval(progressInterval)
      clearInterval(messageInterval)
    }
  }, [onFinished])

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
            <span className="text-2xl font-mono font-bold text-white">{Math.round(progress)}%</span>
          </div>
          <div className="absolute inset-0 border-t-2 border-fuchsia-500 rounded-full animate-spin"></div>
        </div>

        {/* Teksty */}
        <div className="space-y-4 min-h-[5rem]">
          <h2 className="text-xl font-mono text-violet-200">
            <span className="animate-pulse"> {LOADING_MESSAGES[messageIndex]}</span>
          </h2>
          <div className="flex justify-center gap-2">
            <span className="w-2 h-2 bg-violet-500 rounded-full animate-bounce delay-75"></span>
            <span className="w-2 h-2 bg-violet-500 rounded-full animate-bounce delay-150"></span>
            <span className="w-2 h-2 bg-violet-500 rounded-full animate-bounce delay-300"></span>
          </div>
        </div>

        {/* Pasek Postępu */}
        <div className="w-full bg-gray-800/50 border border-white/10 rounded-full h-1 overflow-hidden">
          <div
            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 h-full transition-all duration-300 ease-out shadow-[0_0_10px_#8b5cf6]"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  )
}
