export default function Marquee() {
  const text = '✨ New Collections Coming Soon • Premium Pakistani Fashion • Shop Authentic Brands ✨'

  return (
    <div className="bg-slate-900 text-slate-100 py-3 overflow-hidden group">
      <div className="animate-marquee group-hover:pause whitespace-nowrap">
        <span className="text-lg font-medium mx-8">{text}</span>
        <span className="text-lg font-medium mx-8">{text}</span>
        <span className="text-lg font-medium mx-8">{text}</span>
        <span className="text-lg font-medium mx-8">{text}</span>
      </div>
    </div>
  )
}
