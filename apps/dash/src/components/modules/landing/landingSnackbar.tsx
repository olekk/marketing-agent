type LandingSnackbarProps = {
  message: string | null
  isVisible: boolean
  onClose: () => void
}

export const LandingSnackbar = ({
  message,
  isVisible,
  onClose,
}: LandingSnackbarProps) => {
  if (!message) return null

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-500/90 text-white rounded-xl backdrop-blur px-4 py-3 shadow-lg flex items-center gap-3 w-[min(92vw,520px)] transition-all duration-300 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
      role="status"
      aria-live="polite"
    >
      <span className="text-sm leading-relaxed flex-1">{message}</span>
      <button
        type="button"
        onClick={onClose}
        className="text-white/80 hover:text-white transition-colors rounded-md p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        aria-label="Zamknij komunikat błędu"
      >
        x
      </button>
    </div>
  )
}
