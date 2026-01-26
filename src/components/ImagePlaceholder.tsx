type ImagePlaceholderProps = {
  className?: string
  text?: string
}

export default function ImagePlaceholder({ className = '', text = 'FolkLane' }: ImagePlaceholderProps) {
  return (
    <div className={`flex items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100 ${className}`}>
      <svg
        className="w-1/3 h-1/3 opacity-30"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"
          fill="currentColor"
          className="text-amber-400"
        />
      </svg>
      <span className="absolute text-amber-600 font-bold text-sm opacity-50">{text}</span>
    </div>
  )
}
