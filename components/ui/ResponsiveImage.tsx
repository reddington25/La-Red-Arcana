'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface ResponsiveImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  priority?: boolean
  className?: string
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
}

export function ResponsiveImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className = '',
  objectFit = 'cover',
}: ResponsiveImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && !error && (
        <div className="absolute inset-0 bg-gray-800 animate-pulse" />
      )}
      
      {error ? (
        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
          <span className="text-gray-500 text-sm">Error al cargar imagen</span>
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          className={`transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          style={{ objectFit }}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false)
            setError(true)
          }}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      )}
    </div>
  )
}

interface LazyImageProps {
  src: string
  alt: string
  className?: string
  aspectRatio?: string
}

export function LazyImage({
  src,
  alt,
  className = '',
  aspectRatio = '16/9',
}: LazyImageProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            observer.disconnect()
          }
        })
      },
      { rootMargin: '50px' }
    )

    const element = document.getElementById(`lazy-${src}`)
    if (element) {
      observer.observe(element)
    }

    return () => observer.disconnect()
  }, [src])

  return (
    <div
      id={`lazy-${src}`}
      className={`relative overflow-hidden ${className}`}
      style={{ aspectRatio }}
    >
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-800 animate-pulse" />
      )}
      
      {isVisible && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setIsLoaded(true)}
        />
      )}
    </div>
  )
}
