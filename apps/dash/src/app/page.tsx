'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LoadingScreen } from '@/components/modules/LoadingScreen'

export default function LandingPage() {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Funkcja naprawiająca URL (dodaje https://)
  const ensureHttps = (inputUrl: string) => {
    let cleanUrl = inputUrl.trim()
    if (!cleanUrl.match(/^https?:\/\//)) {
      cleanUrl = `https://${cleanUrl}`
    }
    return cleanUrl
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return

    // 1. Napraw adres wizualnie i logicznie
    const validUrl = ensureHttps(url)
    setUrl(validUrl)

    // 2. Odpal loading (Przełączamy widok na komponent LoadingScreen)
    setIsLoading(true)
  }

  // Callback: Co robimy, gdy loading dojdzie do 100%
  const handleLoadingFinished = () => {
    // Tutaj normalnie byłby wynik z backendu, na razie przekierowujemy na demo
    router.push('/dashboard/loading')
  }

  // --- WIDOK ---

  // Jeśli trwa ładowanie, pokazujemy tylko komponent LoadingScreen
  if (isLoading) {
    return <LoadingScreen onFinished={handleLoadingFinished} />
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#030014] text-white relative overflow-hidden selection:bg-violet-500/30">
      {/* Tło (Background Effects) */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-700/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-4xl w-full text-center space-y-12 px-4 z-10">
        {/* HERO Section */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase text-violet-300 backdrop-blur-md shadow-lg">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            System Online v1.0
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight">
            Zrozum rynek <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-white animate-gradient">
              zanim wydasz złotówkę.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Twój osobisty <span className="text-white font-semibold">AI Marketing Agent</span>.
            Wpisz adres strony, a my prześwietlimy konkurencję i zbudujemy plan działania.
          </p>
        </div>

        {/* INPUT FORM */}
        {/* INPUT FORM (Mobile First) */}
        <form onSubmit={handleSubmit} className="relative max-w-xl mx-auto group w-full">
          {/* Poświata */}
          <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>

          <div className="relative flex flex-col md:flex-row items-stretch md:items-center bg-[#0a0a0b] border border-white/10 rounded-xl p-2 shadow-2xl gap-2 md:gap-0">
            {/* Ikona (Tylko na desktop, na mobile ukrywamy dla oszczędności miejsca lub zostawiamy) */}
            <div className="hidden md:block pl-4 text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>

            {/* Input */}
            <input
              type="text"
              placeholder="twoja-firma.pl"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 bg-transparent text-white p-3 md:p-4 text-base md:text-lg focus:outline-none placeholder-gray-600 w-full text-center md:text-left"
              required
            />

            {/* Przycisk */}
            <button
              type="submit"
              className="bg-white text-black hover:bg-violet-50 font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer w-full md:w-auto"
            >
              Analizuj
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-3 text-center px-4">
            * Automatycznie dodamy https:// jeśli zapomnisz.
          </p>
        </form>

        {/* FEATURE CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-white/5">
          {[
            {
              title: 'Deep Audit',
              desc: 'Techniczna analiza strony',
              icon: '🔍',
            },
            {
              title: 'Spy Competitors',
              desc: 'Podgląd strategii rywali',
              icon: '🕵️‍♂️',
            },
            { title: 'Action Plan', desc: 'Gotowa lista zadań', icon: '🚀' },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white/5 border border-white/5 p-6 rounded-2xl hover:bg-white/10 transition duration-300 text-left"
            >
              <div className="text-2xl mb-3">{item.icon}</div>
              <h3 className="font-bold text-white mb-1">{item.title}</h3>
              <p className="text-sm text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
