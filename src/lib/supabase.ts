import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type UserType = 'regular' | 'promoter'

export interface UserProfile {
  id: string
  email: string
  user_type: UserType
  first_name: string
  last_name: string
  username?: string // NEW
  age_group: string
  city: string
  country: string
  zip_code: string
  income_group: string
  preferred_categories: string[]
  shopping_frequency: string
  price_sensitivity: 'Budget' | 'Mid-range' | 'Premium'
  bio?: string
  website?: string
  social_links?: {
    twitter?: string
    instagram?: string
    youtube?: string
    tiktok?: string
  }
  created_at: string
  updated_at: string
}

export interface Deal {
  id: string
  title: string
  description: string
  coupon_code?: string
  retail_price: number
  current_price: number
  discount_percentage: number
  category: string
  marketplace: string
  promoter_id: string
  promoter_username?: string // NEW
  affiliate_link: string
  expiry_date: string
  image_url?: string
  view_count?: number
  click_count?: number
  save_count?: number
  helpful_count?: number
  not_helpful_count?: number
  comment_count?: number
  share_count?: number
  usage_count?: number
  created_at: string
  updated_at: string
  promoter?: UserProfile
  interactions?: DealInteraction[]
  comments?: DealComment[]
  user_interaction?: DealInteraction
  user_saved?: boolean
}

export interface DealInteraction {
  id: string
  deal_id: string
  user_id: string
  is_helpful?: boolean
  has_used: boolean
  created_at: string
  updated_at: string
}

export interface DealComment {
  id: string
  deal_id: string
  user_id: string
  comment: string
  created_at: string
  updated_at: string
  user?: UserProfile
}

export interface DealShare {
  id: string
  deal_id: string
  user_id: string
  platform: string
  created_at: string
}

export interface DealSave {
  id: string
  deal_id: string
  user_id: string
  created_at: string
}

export interface DealAnalytics {
  id: string
  deal_id: string
  user_id?: string
  session_id?: string
  event_type: 'view' | 'click' | 'share' | 'save' // Added 'save' event type
  created_at: string
  user_agent?: string
  ip_address?: string
}

export interface PromoterStats {
  total_deals: number
  previous_week_deals: boolean
  deals_last_7_days: number
  total_clicks: number
  total_views: number
  total_saves: number
  total_shares: number
  conversion_rate: number
  change_vs_previous_week: {
    deals: number
    clicks: number
    views: number
    saves: number
    shares: number
  }
}

// Helper function to track deal analytics
export const trackDealEvent = async (
  dealId: string,
  eventType: 'view' | 'click' | 'share' | 'save',
  userId?: string
) => {
  try {
    const sessionId = !userId ? getSessionId() : null
    if (eventType === 'view') {
      // Only count one view per user/session per deal per 24h
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      let filter: any = { deal_id: dealId, event_type: 'view' }
      if (userId) filter.user_id = userId
      else filter.session_id = sessionId
      
      let query = supabase
        .from('deal_analytics')
        .select('id')
        .eq('deal_id', dealId)
        .eq('event_type', 'view')
        .gte('created_at', since)
        .limit(1)
      if (userId) {
        query = query.eq('user_id', userId)
      } else {
        query = query.eq('session_id', sessionId)
      }
      const { data: existing, error: fetchError } = await query
      if (fetchError) {
        console.error('Error checking for existing view event:', fetchError)
        return
      }
      
      if (existing && existing.length > 0) {
        // Already counted a view in the last 24h
        return
      }
    }
    const { error } = await supabase.from('deal_analytics').insert({
      deal_id: dealId,
      user_id: userId || null,
      session_id: sessionId,
      event_type: eventType,
      user_agent: navigator.userAgent
    })
    if (error) {
      console.error('Error tracking deal event:', error)
    }
  } catch (error) {
    console.error('Error tracking deal event:', error)
  }
}

// Helper function to generate session ID for anonymous users
export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Helper function to get or create session ID
export const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('jadedeals_session_id')
  if (!sessionId) {
    sessionId = generateSessionId()
    sessionStorage.setItem('jadedeals_session_id', sessionId)
  }
  return sessionId
}