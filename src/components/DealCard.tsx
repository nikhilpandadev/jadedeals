import React, { useState } from 'react'
import { 
  ThumbsUp, 
  ThumbsDown, 
  MessageCircle, 
  Share2, 
  ExternalLink,
  Clock,
  Tag,
  Store,
  User,
  Check,
  Heart
} from 'lucide-react'
import { Deal, DealInteraction, trackDealEvent } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import ShareModal from './ShareModal'

interface DealCardProps {
  deal: Deal
  onInteraction?: (dealId: string, interaction: Partial<DealInteraction>) => void
  onComment?: (dealId: string) => void
  onShare?: (dealId: string) => void
  showFullCard?: boolean
  showPromoter?: boolean // NEW: show promoter info as link
  showSavedStatus?: boolean // NEW: show saved status
}

const DealCard: React.FC<DealCardProps> = ({ 
  deal, 
  onInteraction,
  onComment,
  onShare,
  showFullCard = true,
  showPromoter = true, // NEW: default true
  showSavedStatus = true // NEW: default false
}) => {
  const { user } = useAuth()
  const [hasUsedDeal, setHasUsedDeal] = useState(deal.user_interaction?.has_used || false)
  const [isSaved, setIsSaved] = useState(deal.user_saved || false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [helpfulState, setHelpfulState] = useState<boolean | null>(deal.user_interaction?.is_helpful ?? null)
  const [localCounts, setLocalCounts] = useState({
    helpful: deal.helpful_count || 0,
    notHelpful: deal.not_helpful_count || 0,
    saves: deal.save_count || 0,
    shares: deal.share_count || 0,
    comments: deal.comment_count || 0,
    views: deal.view_count || 0,
    clicks: deal.click_count || 0
  })

  const getDiscountColor = (percentage: number) => {
    if (percentage >= 50) return 'bg-red-500'
    if (percentage >= 30) return 'bg-orange-500'
    if (percentage >= 20) return 'bg-yellow-500'
    if (percentage >= 10) return 'bg-green-500'
    return 'bg-blue-500'
  }

  const getTimeRemaining = (expiryDate: string) => {
    const now = new Date()
    const expiry = new Date(expiryDate)
    const diffMs = expiry.getTime() - now.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    
    if (diffHours < 0) return 'Expired'
    if (diffHours < 24) return `${diffHours}h left`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ${diffHours % 24}h left`
  }

  const handleHelpfulClick = async (isHelpful: boolean) => {
    if (!user) return

    try {
      // Determine the new state
      let newHelpfulState: boolean | null = helpfulState
      if (helpfulState === isHelpful) {
        newHelpfulState = null // Unvote if clicking the same button
      } else {
        newHelpfulState = isHelpful
      }

      // Update local state for immediate feedback
      setHelpfulState(newHelpfulState)
      setLocalCounts(prev => {
        let newHelpful = prev.helpful
        let newNotHelpful = prev.notHelpful
        // Remove previous vote
        if (helpfulState === true) newHelpful--
        if (helpfulState === false) newNotHelpful--
        // Add new vote
        if (newHelpfulState === true) newHelpful++
        if (newHelpfulState === false) newNotHelpful++
        return {
          ...prev,
          helpful: Math.max(0, newHelpful),
          notHelpful: Math.max(0, newNotHelpful)
        }
      })

      // Update database
      const { error } = await supabase
        .from('deal_interactions')
        .upsert([
          {
            deal_id: deal.id,
            user_id: user.id,
            is_helpful: newHelpfulState,
            has_used: hasUsedDeal
          }
        ], { onConflict: 'deal_id,user_id' })

      if (error) {
        console.error('Error updating helpful vote:', error)
        // Revert local state on error
        setHelpfulState(helpfulState)
        setLocalCounts(prev => ({
          ...prev,
          helpful: deal.helpful_count || 0,
          notHelpful: deal.not_helpful_count || 0
        }))
      }
    } catch (error) {
      console.error('Error in handleHelpfulClick:', error)
    }
  }

  const handleUsedDealChange = async () => {
    if (!user) return
    
    try {
      const newUsedState = !hasUsedDeal
      setHasUsedDeal(newUsedState)
      
      // Update database
      const { error } = await supabase
        .from('deal_interactions')
        .upsert({
          deal_id: deal.id,
          user_id: user.id,
          is_helpful: helpfulState,
          has_used: newUsedState
        })

      if (error) {
        console.error('Error updating used deal:', error)
        // Revert local state on error
        setHasUsedDeal(hasUsedDeal)
      }
    } catch (error) {
      console.error('Error in handleUsedDealChange:', error)
    }
  }

  const handleSaveToggle = async () => {
    if (!user) return
    setSaveLoading(true)
    try {
      if (isSaved) {
        // Remove save
        const { error } = await supabase
          .from('deal_saves')
          .delete()
          .eq('deal_id', deal.id)
          .eq('user_id', user.id)
        if (error) throw error
        setLocalCounts(prev => ({ ...prev, saves: Math.max(0, prev.saves - 1) }))
        setIsSaved(false)
        // No event tracking on unsave
      } else {
        // Add save
        const { error } = await supabase
          .from('deal_saves')
          .upsert([
            {
              deal_id: deal.id,
              user_id: user.id
            }
          ], { onConflict: 'deal_id,user_id' })
        if (error) throw error
        setLocalCounts(prev => ({ ...prev, saves: prev.saves + 1 }))
        setIsSaved(true)
        // Track save event
        await trackDealEvent(deal.id, 'save', user.id)
      }
    } catch (error) {
      console.error('Error toggling save:', error)
    } finally {
      setSaveLoading(false)
    }
  }

  // Tighter validation for affiliate and image URLs
  const isValidExternalUrl = (url: string, allowedProtocols = ['https:', 'http:'], allowedExtensions?: string[]): boolean => {
    try {
      const parsed = new URL(url)
      if (!allowedProtocols.includes(parsed.protocol)) return false
      // Block javascript:, data:, file:, etc.
      if (/^(javascript|data|file|vbscript):/i.test(parsed.protocol)) return false
      // Optionally check for allowed file extensions
      if (allowedExtensions && allowedExtensions.length > 0) {
        const ext = parsed.pathname.split('.').pop()?.toLowerCase()
        if (!ext || !allowedExtensions.includes(ext)) return false
      }
      return true
    } catch {
      return false
    }
  }

  const isValidAffiliateLink = (url: string): boolean =>
    isValidExternalUrl(url, ['https:', 'http:'])

  const handleAffiliateClick = async () => {
    try {
      if (!isValidAffiliateLink(deal.affiliate_link)) {
        alert('Invalid or unsafe affiliate link.');
        return;
      }
      await trackDealEvent(deal.id, 'click', user?.id)
      setLocalCounts(prev => ({ ...prev, clicks: prev.clicks + 1 }))
      window.open(deal.affiliate_link, '_blank', 'noopener,noreferrer')
    } catch (error) {
      console.error('Error tracking click:', error)
      window.open(deal.affiliate_link, '_blank', 'noopener,noreferrer')
    }
  }

  const handleShareClick = async () => {
    setShowShareModal(true)
    try {
      if (user) {
        await supabase
          .from('deal_shares')
          .insert({
            deal_id: deal.id,
            user_id: user.id,
            platform: 'web'
          })
      }
      // Track share event for both logged-in and anonymous users
      await trackDealEvent(deal.id, 'share', user?.id)
      setLocalCounts(prev => ({ ...prev, shares: prev.shares + 1 }))
    } catch (error) {
      console.error('Error tracking share:', error)
    }
  }

  const handleCommentClick = () => {
    if (onComment) {
      onComment(deal.id)
    } else {
      // Navigate to deal details page
      window.location.href = `/deal/${deal.id}`
    }
  }

  const timeRemaining = getTimeRemaining(deal.expiry_date)
  const isExpired = timeRemaining === 'Expired'

  // Track view when component mounts
  React.useEffect(() => {
    const trackView = async () => {
      try {
        await trackDealEvent(deal.id, 'view', user?.id)
        setLocalCounts(prev => ({ ...prev, views: prev.views + 1 }))
      } catch (error) {
        console.error('Error tracking view:', error)
      }
    }
    trackView()
    // Only run on mount or when deal/user changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deal.id, user?.id])

  return (
    <>
      <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 ${isExpired ? 'opacity-60' : ''}`}>
        {/* Deal Image */}
        {deal.image_url && (
          <div className="aspect-video w-full overflow-hidden">
            <img
              src={deal.image_url}
              alt={deal.title}
              referrerPolicy="no-referrer"
              loading="lazy"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {deal.title}
              </h3>
              <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                {deal.description}
              </p>
            </div>
            <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
              <div className={`${getDiscountColor(deal.discount_percentage)} text-white px-3 py-1 rounded-full text-sm font-bold`}>
                {deal.discount_percentage}% OFF
              </div>
              {user && (
                <button
                  onClick={handleSaveToggle}
                  disabled={saveLoading}
                  className={`p-2 rounded-full transition-colors ${
                    isSaved 
                      ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-red-500'
                  }`}
                >
                  {(showSavedStatus && (
                    isSaved ? <Heart className="h-4 w-4 fill-current" /> : <Heart className="h-4 w-4" />
                  ))}
                </button>
              )}
            </div>
          </div>

          {/* Price Section */}
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-2xl font-bold text-emerald-600">
              ${deal.current_price.toFixed(2)}
            </span>
            <span className="text-lg text-gray-500 line-through">
              ${deal.retail_price.toFixed(2)}
            </span>
            <span className="text-sm text-gray-600">
              Save ${(deal.retail_price - deal.current_price).toFixed(2)}
            </span>
          </div>

          {/* Coupon Code */}
          {deal.coupon_code && (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Coupon Code:</span>
                <div className="flex items-center space-x-2">
                  <code className="bg-white px-2 py-1 rounded border text-sm font-mono">
                    {deal.coupon_code}
                  </code>
                  <button
                    onClick={() => navigator.clipboard.writeText(deal.coupon_code!)}
                    className="text-emerald-600 hover:text-emerald-700 text-sm"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Meta Information */}
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div className="flex items-center space-x-2 text-gray-600">
              <Tag className="h-4 w-4" />
              <span>{deal.category}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Store className="h-4 w-4" />
              <span>{deal.marketplace}</span>
            </div>
            {showPromoter && (
              <div className="flex items-center space-x-2 text-gray-600">
                <User className="h-4 w-4" />
                {deal.promoter_username && deal.promoter_username.length > 0 ? (
                  <a
                    href={`/promoter/${deal.promoter_username}`}
                    className="text-emerald-600 hover:underline"
                  >
                    {deal.promoter_username || 'Promoter'}
                  </a>
                ) : (
                  <span>{'Promoter'}</span>
                )}
              </div>
            )}
            <div className={`flex items-center space-x-2 ${isExpired ? 'text-red-600' : 'text-gray-600'}`}>
              <Clock className="h-4 w-4" />
              <span>{timeRemaining}</span>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleAffiliateClick}
            disabled={isExpired}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
              isExpired 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-lg transform hover:-translate-y-0.5'
            }`}
          >
            <span>{isExpired ? 'Deal Expired' : 'Get This Deal'}</span>
            {!isExpired && <ExternalLink className="h-4 w-4" />}
          </button>
        </div>

        {/* Interaction Section */}
        {showFullCard && (
          <div className="border-t border-gray-100 px-6 py-4">
            {/* User Interaction Checkbox */}
            {user && (
              <div className="mb-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasUsedDeal}
                    onChange={handleUsedDealChange}
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700">I used this deal</span>
                  {hasUsedDeal && <Check className="h-4 w-4 text-emerald-600" />}
                </label>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Helpful/Not Helpful */}
                {user ? (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleHelpfulClick(true)}
                      className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-colors ${
                        helpfulState === true
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span>{localCounts.helpful}</span>
                    </button>
                    <button
                      onClick={() => handleHelpfulClick(false)}
                      className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-colors ${
                        helpfulState === false
                          ? 'bg-red-100 text-red-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <ThumbsDown className="h-4 w-4" />
                      <span>{localCounts.notHelpful}</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 px-3 py-1 rounded-full text-sm text-gray-400">
                      <ThumbsUp className="h-4 w-4" />
                      <span>{localCounts.helpful}</span>
                    </div>
                    <div className="flex items-center space-x-1 px-3 py-1 rounded-full text-sm text-gray-400">
                      <ThumbsDown className="h-4 w-4" />
                      <span>{localCounts.notHelpful}</span>
                    </div>
                  </div>
                )}

                {/* Comments */}
                <button
                  onClick={handleCommentClick}
                  className="flex items-center space-x-1 text-gray-600 hover:text-emerald-600 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span className="text-sm">{localCounts.comments}</span>
                </button>

                {/* Saves */}
                <div className="flex items-center space-x-1 text-gray-600">
                  <Heart className="h-4 w-4" />
                  <span className="text-sm">{localCounts.saves}</span>
                </div>
              </div>

              {/* Share */}
              <button
                onClick={handleShareClick}
                className="flex items-center space-x-1 text-gray-600 hover:text-emerald-600 transition-colors"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        dealId={deal.id}
        dealTitle={deal.title}
      />
    </>
  )
}

export default DealCard