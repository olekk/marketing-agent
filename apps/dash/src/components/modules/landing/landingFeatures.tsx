const features = [
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
]

export const LandingFeatures = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-white/5">
      {features.map((item) => (
        <div
          key={item.title}
          className="bg-white/5 border border-white/5 p-6 rounded-2xl hover:bg-white/10 transition duration-300 text-left"
        >
          <div className="text-2xl mb-3">{item.icon}</div>
          <h3 className="font-bold text-white mb-1">{item.title}</h3>
          <p className="text-sm text-gray-400">{item.desc}</p>
        </div>
      ))}
    </div>
  )
}
