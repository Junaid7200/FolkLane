import { useEffect, useState } from 'react'
import ImagePlaceholder from './ImagePlaceholder'

type SmartImageProps = {
  src?: string
  alt: string
  wrapperClassName?: string
  imgClassName?: string
  placeholderClassName?: string
  placeholderText?: string
  loading?: 'eager' | 'lazy'
  onError?: () => void
}

export default function SmartImage({
  src,
  alt,
  wrapperClassName = 'w-full h-full',
  imgClassName = 'w-full h-full object-cover',
  placeholderClassName = 'w-full h-full',
  placeholderText = 'FolkLane',
  loading = 'lazy',
  onError,
}: SmartImageProps) {
  const hasSource = Boolean(src && src !== '/placeholder.jpg')
  const [isLoaded, setIsLoaded] = useState(false)
  const [isError, setIsError] = useState(!hasSource)

  useEffect(() => {
    setIsLoaded(false)
    setIsError(!hasSource)
  }, [src, hasSource])

  const showPlaceholder = !isLoaded || isError || !hasSource

  return (
    <div className={`relative ${wrapperClassName}`}>
      {showPlaceholder ? (
        <ImagePlaceholder className={placeholderClassName} text={placeholderText} />
      ) : null}
      {hasSource && !isError ? (
        <img
          src={src}
          alt={alt}
          loading={loading}
          className={`${imgClassName} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            setIsError(true)
            onError?.()
          }}
        />
      ) : null}
    </div>
  )
}
