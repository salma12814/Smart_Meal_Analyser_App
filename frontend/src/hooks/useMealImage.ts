import { useEffect, useState } from 'react'
import { getMealImage } from '../lib/mealImageCache'

export function useFilePreview(file: File | null) {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!file) {
      setUrl(null)
      return
    }
    const nextUrl = URL.createObjectURL(file)
    setUrl(nextUrl)
    return () => URL.revokeObjectURL(nextUrl)
  }, [file])
  return url
}

export function useMealImage(mealId: string | undefined, fallback?: Blob) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  useEffect(() => {
    let active = true
    let objectUrl: string | null = null
    setImageUrl(null)
    if (!mealId) return
    void getMealImage(mealId).then((blob) => {
      const image = blob ?? fallback
      if (active && image) {
        objectUrl = URL.createObjectURL(image)
        setImageUrl(objectUrl)
      }
    }).catch(() => {
      if (active && fallback) {
        objectUrl = URL.createObjectURL(fallback)
        setImageUrl(objectUrl)
      }
    })
    return () => {
      active = false
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [mealId, fallback])
  return imageUrl
}
