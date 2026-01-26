type SectionHeadingProps = {
  title: string
  subtitle?: string
}

export default function SectionHeading({ title, subtitle }: SectionHeadingProps) {
  return (
    <div className="text-center mb-12">
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3">
        {title}
      </h2>
      {subtitle && (
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  )
}
