type ImagePlaceholderProps = {
  className?: string
  text?: string
}

export default function ImagePlaceholder({ className = '', text = 'FolkLane' }: ImagePlaceholderProps) {
  return (
    <div className={`flex items-center justify-center bg-gradient-to-br from-slate-50 via-stone-50 to-stone-100 ${className}`}>
      <svg
        className="w-1/3 h-1/3 opacity-25"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"
          fill="currentColor"
          className="text-slate-400"
        />
      </svg>
      <span className="absolute text-slate-500 font-semibold text-xs opacity-45">{text}</span>
    </div>
  )
}
