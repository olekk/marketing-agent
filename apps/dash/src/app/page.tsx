'use client'

import { useState, useEffect, Suspense, FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { LandingFeatures } from '@/components/modules/landing/landingFeatures'
import { LandingForm } from '@/components/modules/landing/landingForm'
import { LandingHero } from '@/components/modules/landing/landingHero'
import { LandingSnackbar } from '@/components/modules/landing/landingSnackbar'
import { toDomainId } from '@/lib/utils'

function UrlErrorWatcher({ onErrorDetected }: { onErrorDetected: (msg: string) => void }) {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const errorMsg = searchParams.get('error')
    if (errorMsg) {
      onErrorDetected(errorMsg)
      router.replace('/', { scroll: false })
    }
  }, [searchParams, router, onErrorDetected])

  return null
}

export default function LandingPage() {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [isSnackbarVisible, setIsSnackbarVisible] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!url) return
    router.push(`/dashboard/${toDomainId(url)}`)
  }

  const handleShowError = (msg: string) => {
    setErrorMessage(msg)
    setIsSnackbarVisible(true)
  }

  const handleCloseSnackbar = () => {
    setIsSnackbarVisible(false)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#030014] text-white relative overflow-hidden selection:bg-violet-500/30">
      <Suspense fallback={null}>
        <UrlErrorWatcher onErrorDetected={handleShowError} />
      </Suspense>

      <LandingSnackbar
        isVisible={isSnackbarVisible}
        message={errorMessage}
        onClose={handleCloseSnackbar}
      />

      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-700/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl w-full text-center space-y-12 px-4 z-10">
        <LandingHero />
        <LandingForm url={url} onUrlChange={setUrl} onSubmit={handleSubmit} />
        <LandingFeatures />
      </div>
    </main>
  )
}
