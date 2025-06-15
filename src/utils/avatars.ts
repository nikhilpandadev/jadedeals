// Avatar generation utility for consistent illustrated character avatars
export interface AvatarConfig {
  backgroundColor: string
  skinTone: string
  hairColor: string
  hairStyle: string
  eyeColor: string
  accessory?: string
  clothing: string
}

// Predefined avatar options for variety
const avatarOptions = {
  backgrounds: [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ],
  skinTones: [
    '#FDBCB4', '#EEA990', '#D08B5B', '#AE5D29', '#8D5524',
    '#F1C27D', '#E0AC69', '#C68642', '#A0522D', '#8B4513'
  ],
  hairColors: [
    '#8B4513', '#D2691E', '#DAA520', '#B8860B', '#000000',
    '#654321', '#FF4500', '#DC143C', '#4B0082', '#2F4F4F'
  ],
  hairStyles: [
    'short', 'medium', 'long', 'curly', 'wavy', 'straight', 'buzz', 'bald'
  ],
  eyeColors: [
    '#8B4513', '#228B22', '#4169E1', '#2F4F4F', '#800080',
    '#FF6347', '#32CD32', '#1E90FF', '#8A2BE2', '#DC143C'
  ],
  accessories: [
    'glasses', 'sunglasses', 'hat', 'earrings', 'none'
  ],
  clothing: [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ]
}

// Generate consistent avatar config based on email/ID
export const generateAvatarConfig = (seed: string): AvatarConfig => {
  // Simple hash function for consistent randomness
  const hash = (str: string): number => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  const seedHash = hash(seed)
  
  return {
    backgroundColor: avatarOptions.backgrounds[seedHash % avatarOptions.backgrounds.length],
    skinTone: avatarOptions.skinTones[(seedHash + 1) % avatarOptions.skinTones.length],
    hairColor: avatarOptions.hairColors[(seedHash + 2) % avatarOptions.hairColors.length],
    hairStyle: avatarOptions.hairStyles[(seedHash + 3) % avatarOptions.hairStyles.length],
    eyeColor: avatarOptions.eyeColors[(seedHash + 4) % avatarOptions.eyeColors.length],
    accessory: avatarOptions.accessories[(seedHash + 5) % avatarOptions.accessories.length],
    clothing: avatarOptions.clothing[(seedHash + 6) % avatarOptions.clothing.length]
  }
}

// Generate SVG avatar based on config
export const generateAvatarSVG = (config: AvatarConfig): string => {
  const { backgroundColor, skinTone, hairColor, hairStyle, eyeColor, accessory, clothing } = config

  // Hair path based on style
  const getHairPath = (style: string): string => {
    switch (style) {
      case 'short':
        return 'M30 25 Q20 15, 30 10 Q40 5, 50 10 Q60 15, 50 25 Q45 20, 40 22 Q35 20, 30 25'
      case 'medium':
        return 'M25 30 Q15 10, 30 5 Q40 0, 50 5 Q65 10, 55 30 Q50 25, 45 28 Q40 25, 35 28 Q30 25, 25 30'
      case 'long':
        return 'M20 40 Q10 5, 30 0 Q40 -2, 50 0 Q70 5, 60 40 Q55 35, 50 38 Q45 35, 40 38 Q35 35, 30 38 Q25 35, 20 40'
      case 'curly':
        return 'M28 28 Q18 12, 32 8 Q38 4, 48 8 Q62 12, 52 28 Q48 22, 44 25 Q40 22, 36 25 Q32 22, 28 28 M25 20 Q20 15, 25 18 M55 20 Q60 15, 55 18'
      case 'wavy':
        return 'M26 30 Q16 12, 32 6 Q40 2, 48 6 Q64 12, 54 30 Q50 24, 46 27 Q42 24, 38 27 Q34 24, 30 27 Q26 24, 26 30'
      case 'buzz':
        return 'M32 22 Q22 18, 32 15 Q40 12, 48 15 Q58 18, 48 22 Q44 20, 40 21 Q36 20, 32 22'
      case 'bald':
        return ''
      default:
        return 'M30 25 Q20 15, 30 10 Q40 5, 50 10 Q60 15, 50 25 Q45 20, 40 22 Q35 20, 30 25'
    }
  }

  // Accessory elements
  const getAccessory = (type: string): string => {
    switch (type) {
      case 'glasses':
        return `
          <g stroke="#333" stroke-width="1.5" fill="none">
            <circle cx="35" cy="42" r="6"/>
            <circle cx="45" cy="42" r="6"/>
            <path d="M41 42 L39 42"/>
            <path d="M29 40 Q25 38, 22 40"/>
            <path d="M51 40 Q55 38, 58 40"/>
          </g>
        `
      case 'sunglasses':
        return `
          <g stroke="#333" stroke-width="1.5" fill="#333">
            <circle cx="35" cy="42" r="6"/>
            <circle cx="45" cy="42" r="6"/>
            <path d="M41 42 L39 42" stroke="#333" fill="none"/>
            <path d="M29 40 Q25 38, 22 40" stroke="#333" fill="none"/>
            <path d="M51 40 Q55 38, 58 40" stroke="#333" fill="none"/>
          </g>
        `
      case 'hat':
        return `
          <g fill="#8B4513">
            <ellipse cx="40" cy="18" rx="18" ry="4"/>
            <path d="M25 18 Q25 8, 40 8 Q55 8, 55 18 Q55 15, 40 15 Q25 15, 25 18"/>
          </g>
        `
      case 'earrings':
        return `
          <g fill="#FFD700">
            <circle cx="28" cy="48" r="2"/>
            <circle cx="52" cy="48" r="2"/>
          </g>
        `
      default:
        return ''
    }
  }

  return `
    <svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      <!-- Background -->
      <circle cx="40" cy="40" r="40" fill="${backgroundColor}"/>
      
      <!-- Hair -->
      <path d="${getHairPath(hairStyle)}" fill="${hairColor}"/>
      
      <!-- Head -->
      <circle cx="40" cy="45" r="18" fill="${skinTone}"/>
      
      <!-- Eyes -->
      <circle cx="35" cy="42" r="2" fill="${eyeColor}"/>
      <circle cx="45" cy="42" r="2" fill="${eyeColor}"/>
      <circle cx="35" cy="42" r="0.8" fill="#000"/>
      <circle cx="45" cy="42" r="0.8" fill="#000"/>
      
      <!-- Nose -->
      <path d="M40 46 Q39 48, 40 49 Q41 48, 40 46" fill="${skinTone}" stroke="${skinTone}" stroke-width="0.5"/>
      
      <!-- Mouth -->
      <path d="M37 52 Q40 54, 43 52" stroke="#8B4513" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      
      <!-- Clothing -->
      <path d="M22 75 Q22 65, 30 62 Q40 60, 50 62 Q58 65, 58 75 L58 80 L22 80 Z" fill="${clothing}"/>
      
      <!-- Accessories -->
      ${getAccessory(accessory || 'none')}
    </svg>
  `
}

// Generate avatar URL (data URI)
export const generateAvatarUrl = (seed: string): string => {
  const config = generateAvatarConfig(seed)
  const svg = generateAvatarSVG(config)
  return `data:image/svg+xml;base64,${btoa(svg)}`
}

// Default avatar for fallback
export const getDefaultAvatar = (): string => {
  return generateAvatarUrl('default-user')
}

// Get avatar for user (with fallback)
export const getUserAvatar = (email?: string, userId?: string): string => {
  const seed = email || userId || 'default-user'
  return generateAvatarUrl(seed)
}