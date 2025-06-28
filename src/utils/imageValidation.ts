// src/utils/imageValidation.ts

export function isValidImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:') return false
    if (!/\.(jpg|jpeg|png)$/i.test(parsed.pathname)) return false
    return true
  } catch {
    return false
  }
}

export function isValidImageFile(file: File): boolean {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']
  const maxSize = 1 * 1024 * 1024 // 1MB
  return allowedTypes.includes(file.type) && file.size <= maxSize
}
