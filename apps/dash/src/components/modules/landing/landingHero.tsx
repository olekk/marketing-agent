export const LandingHero = () => {
  return (
    <div className="space-y-6">
      <div
        className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase text-violet-300 backdrop-blur-md shadow-lg"
      >
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        System Online v1.0
      </div>

      <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight">
        Zrozum rynek <br />
        <span className="text-transparent bg-clip-text bg-linear-to-r from-violet-400 via-fuchsia-400 to-white animate-gradient">
          zanim wydasz złotówkę.
        </span>
      </h1>

      <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
        Twój osobisty <span className="text-white font-semibold">AI Marketing Agent</span>.
        Wpisz adres strony, a my prześwietlimy konkurencję i zbudujemy plan działania.
      </p>
    </div>
  )
}
