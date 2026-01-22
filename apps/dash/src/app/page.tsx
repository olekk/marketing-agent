'use client'

import { type FormEvent, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toDomainId } from '@/lib/utils'
import { LandingSnackbar } from '@/components/modules/landing/landingSnackbar'
import { LandingHero } from '@/components/modules/landing/landingHero'
import { LandingForm } from '@/components/modules/landing/landingForm'
import { LandingFeatures } from '@/components/modules/landing/landingFeatures'

export default function LandingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [url, setUrl] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSnackbarVisible, setIsSnackbarVisible] = useState(false)

  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (!errorParam) return

    const decoded = decodeURIComponent(errorParam)
    setErrorMessage(decoded)
    router.replace('/', { scroll: false })
  }, [router, searchParams])

  useEffect(() => {
    if (!errorMessage) return
    const timeout = window.setTimeout(() => {
      setIsSnackbarVisible(true)
    }, 10)
    return () => window.clearTimeout(timeout)
  }, [errorMessage])

  const handleCloseSnackbar = () => {
    setIsSnackbarVisible(false)
    window.setTimeout(() => {
      setErrorMessage(null)
    }, 200)
    router.replace('/', { scroll: false })
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!url) return

    router.push(`/dashboard/${toDomainId(url)}`)
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center bg-[#030014] text-white relative overflow-hidden selection:bg-violet-500/30"
    >
      <LandingSnackbar
        isVisible={isSnackbarVisible}
        message={errorMessage}
        onClose={handleCloseSnackbar}
      />

      <div
        className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-700/20 rounded-full blur-[120px] pointer-events-none"
      />
      <div
        className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"
      />

      <div className="max-w-4xl w-full text-center space-y-12 px-4 z-10">
        <LandingHero />
        <LandingForm url={url} onUrlChange={setUrl} onSubmit={handleSubmit} />
        <LandingFeatures />
      </div>
    </main>
  )
}
