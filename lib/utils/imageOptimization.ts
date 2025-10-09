/**
 * Image optimization utilities for mobile-first performance
 */

export interface ImageOptimizationOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'webp' | 'jpeg' | 'png'
}

/**
 * Compress and resize an image file for optimal mobile performance
 */
export async function optimizeImage(
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<Blob> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    format = 'webp',
  } = options

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width
        let height = img.height

        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }

        // Create canvas and draw resized image
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }

        // Use better image smoothing
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'

        ctx.drawImage(img, 0, 0, width, height)

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Could not create blob'))
            }
          },
          `image/${format}`,
          quality
        )
      }

      img.onerror = () => {
        reject(new Error('Could not load image'))
      }

      img.src = e.target?.result as string
    }

    reader.onerror = () => {
      reject(new Error('Could not read file'))
    }

    reader.readAsDataURL(file)
  })
}

/**
 * Check if browser supports WebP format
 */
export function supportsWebP(): Promise<boolean> {
  return new Promise((resolve) => {
    const webP = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA='
    const img = new Image()
    img.onload = () => resolve(img.width === 1)
    img.onerror = () => resolve(false)
    img.src = webP
  })
}

/**
 * Get optimal image format based on browser support
 */
export async function getOptimalImageFormat(): Promise<'webp' | 'jpeg'> {
  const webpSupported = await supportsWebP()
  return webpSupported ? 'webp' : 'jpeg'
}

/**
 * Calculate responsive image sizes based on viewport
 */
export function getResponsiveImageSizes(
  originalWidth: number,
  originalHeight: number
): { width: number; height: number }[] {
  const aspectRatio = originalWidth / originalHeight
  const sizes = [
    { width: 320, height: Math.round(320 / aspectRatio) },
    { width: 640, height: Math.round(640 / aspectRatio) },
    { width: 768, height: Math.round(768 / aspectRatio) },
    { width: 1024, height: Math.round(1024 / aspectRatio) },
    { width: 1280, height: Math.round(1280 / aspectRatio) },
    { width: 1920, height: Math.round(1920 / aspectRatio) },
  ]

  return sizes.filter((size) => size.width <= originalWidth)
}

/**
 * Lazy load images with Intersection Observer
 */
export function setupLazyLoading(selector: string = 'img[data-src]') {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          const src = img.dataset.src

          if (src) {
            img.src = src
            img.removeAttribute('data-src')
            observer.unobserve(img)
          }
        }
      })
    })

    document.querySelectorAll(selector).forEach((img) => {
      imageObserver.observe(img)
    })

    return imageObserver
  }

  // Fallback for browsers without Intersection Observer
  document.querySelectorAll(selector).forEach((img) => {
    const element = img as HTMLImageElement
    const src = element.dataset.src
    if (src) {
      element.src = src
      element.removeAttribute('data-src')
    }
  })

  return null
}
