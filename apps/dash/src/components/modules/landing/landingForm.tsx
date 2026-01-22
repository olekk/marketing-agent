import { type FormEvent, type ChangeEvent } from 'react'

type LandingFormProps = {
  url: string
  onUrlChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export const LandingForm = ({ url, onUrlChange, onSubmit }: LandingFormProps) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onUrlChange(event.target.value)
  }

  return (
    <form onSubmit={onSubmit} className="relative max-w-xl mx-auto group w-full">
      <div
        className="absolute -inset-1 bg-linear-to-r from-violet-600 to-fuchsia-600 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-500"
      />

      <div
        className="relative flex flex-col md:flex-row items-stretch md:items-center bg-[#0a0a0b] border border-white/10 rounded-xl p-2 shadow-2xl gap-2 md:gap-0"
      >
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
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        <input
          type="text"
          placeholder="twoja-firma.pl"
          value={url}
          onChange={handleChange}
          className="flex-1 bg-transparent text-white p-3 md:p-4 text-base md:text-lg focus:outline-none placeholder-gray-600 w-full text-center md:text-left"
          required
        />

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
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-3 text-center px-4">
        * Wpisz domenę (np. twoja-firma.pl) - protokół zostanie wykryty automatycznie.
      </p>
    </form>
  )
}
