import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { 
  ExternalLink, 
  Clock, 
  Tag, 
  Store, 
  User, 
  ThumbsUp, 
  ThumbsDown, 
  MessageCircle, 
  Share2,
  Copy,
  Check,
  ArrowLeft,
  Sparkles,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, Deal, DealInteraction, trackDealEvent } from '../lib/supabase'
import DealCard from '../components/DealCard'
import DealComments from '../components/DealComments'
import ShareModal from '../components/ShareModal'

const DealDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [deal, setDeal] = useState<Deal | null>(null)
  const [similarDeals, setSimilarDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedCode, setCopiedCode] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [helpfulState, setHelpfulState] = useState<boolean | null>(null)
  const [hasUsedDeal, setHasUsedDeal] = useState(false)
  const [localCounts, setLocalCounts] = useState({
    helpful: 0,
    notHelpful: 0,
    comments: 0,
    shares: 0
  })

  // UUID validation regex
  const isValidUUID = (uuid: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(uuid)
  }

  useEffect(() => {
    if (id) {
      // Validate UUID format
      if (!isValidUUID(id)) {
        console.error('Invalid UUID format:', id)
        navigate('/browse-deals')
        return
      }
      
      fetchDealDetails()
      fetchSimilarDeals()
    }
  }, [id, navigate])

  const fetchDealDetails = async () => {
    try {
      let query = supabase
        .from('deals')
        .select(`
          *,
          interactions:deal_interactions(is_helpful, has_used),
          comments:deal_comments(
            id,
            comment,
            created_at,
            user_id
          )
        `)
        .eq('id', id)

      // Only add user_interaction filter if user is logged in
      if (user?.id) {
        query = query.select(`
          *,
          interactions:deal_interactions(is_helpful, has_used),
          comments:deal_comments(
            id,
            comment,
            created_at,
            user_id
          ),
          user_interaction:deal_interactions!left(is_helpful, has_used)
        `).eq('user_interaction.user_id', user.id)
      }

      const { data, error } = await query.single()

      if (error) throw error

      // Track view event
      await trackDealEvent(id!, 'view', user?.id)

      // Fetch promoter profile
      const { data: promoterProfile } = await supabase
        .from('user_profiles')
        .select('email')
        .eq('id', data.promoter_id)
        .single()

      // Fetch user profiles for comments separately
      const commentUserIds = data.comments?.map(comment => comment.user_id).filter(Boolean) || []
      const { data: commentUsers } = await supabase
        .from('user_profiles')
        .select('id, email')
        .in('id', commentUserIds)

      // Merge user data with comments
      const commentsWithUsers = data.comments?.map(comment => ({
        ...comment,
        user: {
          email: commentUsers?.find(u => u.id === comment.user_id)?.email || 'Unknown'
        }
      })) || []

      const processedDeal = {
        ...data,
        helpful_count: data.interactions?.filter(i => i.is_helpful === true).length || 0,
        not_helpful_count: data.interactions?.filter(i => i.is_helpful === false).length || 0,
        user_interaction: user?.id ? (data.user_interaction?.[0] || null) : null,
        comments: commentsWithUsers,
        promoter: {
          email: promoterProfile?.email || 'Unknown'
        }
      }

      setDeal(processedDeal)
      setHelpfulState(processedDeal.user_interaction?.is_helpful ?? null)
      setHasUsedDeal(processedDeal.user_interaction?.has_used || false)
      setLocalCounts({
        helpful: processedDeal.helpful_count,
        notHelpful: processedDeal.not_helpful_count,
        comments: processedDeal.comment_count || 0,
        shares: processedDeal.share_count || 0
      })
    } catch (error) {
      console.error('Error fetching deal details:', error)
    }
  }

  const fetchSimilarDeals = async () => {
    try {
      // Validate id before using in query
      if (!id || !isValidUUID(id)) {
        throw new Error('Invalid deal ID')
      }

      // First, try to get unexpired deals
      const { data: unexpiredDeals, error: unexpiredError } = await supabase
        .from('deals')
        .select(`
          *,
          interactions:deal_interactions(is_helpful, has_used)
        `)
        .neq('id', id)
        .gt('expiry_date', new Date().toISOString()) // Only unexpired deals
        .limit(6)
        .order('created_at', { ascending: false })

      if (unexpiredError) throw unexpiredError

      let dealsToUse = unexpiredDeals || []

      // If we don't have enough unexpired deals (less than 6), fetch some expired ones to fill the gap
      if (dealsToUse.length < 6) {
        const { data: expiredDeals, error: expiredError } = await supabase
          .from('deals')
          .select(`
            *,
            interactions:deal_interactions(is_helpful, has_used)
          `)
          .neq('id', id)
          .lt('expiry_date', new Date().toISOString()) // Only expired deals
          .limit(6 - dealsToUse.length) // Fill the remaining slots
          .order('created_at', { ascending: false })

        if (expiredError) throw expiredError

        // Combine unexpired and expired deals, with unexpired first
        dealsToUse = [...dealsToUse, ...(expiredDeals || [])]
      }

      // Fetch promoter profiles
      const dealIds = dealsToUse?.map(deal => deal.promoter_id).filter(Boolean) || []
      const { data: promoterProfiles } = await supabase
        .from('user_profiles')
        .select('id, email')
        .in('id', dealIds)

      const processedDeals = dealsToUse?.map(deal => ({
        ...deal,
        helpful_count: deal.interactions?.filter(i => i.is_helpful === true).length || 0,
        not_helpful_count: deal.interactions?.filter(i => i.is_helpful === false).length || 0,
        promoter: {
          email: promoterProfiles?.find(p => p.id === deal.promoter_id)?.email || 'Unknown'
        }
      })) || []

      setSimilarDeals(processedDeals)
    } catch (error) {
      console.error('Error fetching similar deals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInteraction = async (dealId: string, interaction: Partial<DealInteraction>) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('deal_interactions')
        .upsert({
          deal_id: dealId,
          user_id: user.id,
          ...interaction
        })

      if (error) throw error

      // Update local state
      if (interaction.is_helpful !== undefined) {
        setHelpfulState(interaction.is_helpful)
        setLocalCounts(prev => {
          let newHelpful = prev.helpful
          let newNotHelpful = prev.notHelpful
          
          // Remove previous vote
          if (helpfulState === true) newHelpful--
          if (helpfulState === false) newNotHelpful--
          
          // Add new vote
          if (interaction.is_helpful === true) newHelpful++
          if (interaction.is_helpful === false) newNotHelpful++
          
          return {
            ...prev,
            helpful: Math.max(0, newHelpful),
            notHelpful: Math.max(0, newNotHelpful)
          }
        })
      }

      if (interaction.has_used !== undefined) {
        setHasUsedDeal(interaction.has_used)
      }
    } catch (error) {
      console.error('Error updating interaction:', error)
    }
  }

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

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    } catch (error) {
      console.error('Failed to copy code:', error)
    }
  }

  const handleSignInPrompt = () => {
    navigate('/login', { state: { from: { pathname: `/deal/${id}` } } })
  }

  const handleAffiliateClick = () => {
    if (deal) {
      // Track click event for both logged-in and anonymous users
      trackDealEvent(deal.id, 'click', user?.id)
      window.open(deal.affiliate_link, '_blank', 'noopener,noreferrer')
    }
  }

  const handleShareClick = async () => {
    setShowShareModal(true)
    // Track share event for both logged-in and anonymous users
    if (deal) {
      await trackDealEvent(deal.id, 'share', user?.id)
    }
  }

  const handleCommentClick = () => {
    setShowComments(!showComments)
  }

  const handleCommentCountChange = (count: number) => {
    setLocalCounts(prev => ({ ...prev, comments: count }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading deal details...</p>
        </div>
      </div>
    )
  }

  if (!deal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Deal Not Found</h1>
          <p className="text-gray-600 mb-6">The deal you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/browse-deals"
            className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
          >
            Browse Other Deals
          </Link>
        </div>
      </div>
    )
  }

  const timeRemaining = getTimeRemaining(deal.expiry_date)
  const isExpired = timeRemaining === 'Expired'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          to="/browse-deals"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-emerald-600 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Deals</span>
        </Link>

        {/* Main Deal Details */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="p-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{deal.title}</h1>
                <p className="text-lg text-gray-600 leading-relaxed mb-6">{deal.description}</p>
              </div>
              <div className={`${getDiscountColor(deal.discount_percentage)} text-white px-4 py-2 rounded-full text-lg font-bold ml-6 flex-shrink-0`}>
                {deal.discount_percentage}% OFF
              </div>
            </div>

            {/* Price Section */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-4xl font-bold text-emerald-600">
                    ${deal.current_price.toFixed(2)}
                  </span>
                  <span className="text-2xl text-gray-500 line-through">
                    ${deal.retail_price.toFixed(2)}
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium">
                    Save ${(deal.retail_price - deal.current_price).toFixed(2)}
                  </span>
                </div>
                <div className={`text-right ${isExpired ? 'text-red-600' : 'text-gray-600'}`}>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span className="font-medium">{timeRemaining}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Coupon Code */}
            {deal.coupon_code && (
              <div className="bg-yellow-50 border-2 border-dashed border-yellow-300 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Coupon Code</h3>
                    <p className="text-gray-600">Use this code at checkout to get the discount</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <code className="bg-white px-4 py-2 rounded-lg border text-lg font-mono font-bold">
                      {deal.coupon_code}
                    </code>
                    <button
                      onClick={() => handleCopyCode(deal.coupon_code!)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      {copiedCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      <span>{copiedCode ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Deal Meta Information */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              <div className="flex items-center space-x-3">
                <Tag className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Category</div>
                  <div className="font-medium">{deal.category}</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Store className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Marketplace</div>
                  <div className="font-medium">{deal.marketplace}</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Promoter</div>
                  <div className="font-medium">{deal.promoter?.email?.split('@')[0] || 'Unknown'}</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Sparkles className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Posted</div>
                  <div className="font-medium">{new Date(deal.created_at).toLocaleDateString()}</div>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleAffiliateClick}
              disabled={isExpired}
              className={`w-full py-4 px-6 rounded-xl font-bold text-xl transition-all duration-200 flex items-center justify-center space-x-3 mb-6 ${
                isExpired 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-xl transform hover:-translate-y-1'
              }`}
            >
              <span>{isExpired ? 'Deal Expired' : 'Get This Deal Now'}</span>
              {!isExpired && <ExternalLink className="h-6 w-6" />}
            </button>

            {/* Community Interaction */}
            {user && (
              <div className="pt-6 border-t border-gray-200">
                {/* Used Deal Checkbox */}
                <div className="mb-6">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasUsedDeal}
                      onChange={() => handleInteraction(deal.id, { has_used: !hasUsedDeal })}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-5 h-5"
                    />
                    <span className="text-lg text-gray-700">I used this deal</span>
                    {hasUsedDeal && <Check className="h-5 w-5 text-emerald-600" />}
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleInteraction(deal.id, { is_helpful: helpfulState === true ? null : true })}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
                          helpfulState === true
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
                        }`}
                      >
                        <ThumbsUp className="h-5 w-5" />
                        <span>{localCounts.helpful}</span>
                      </button>
                      <button
                        onClick={() => handleInteraction(deal.id, { is_helpful: helpfulState === false ? null : false })}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
                          helpfulState === false
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                        }`}
                      >
                        <ThumbsDown className="h-5 w-5" />
                        <span>{localCounts.notHelpful}</span>
                      </button>
                    </div>
                    <button
                      onClick={handleCommentClick}
                      className="flex items-center space-x-2 text-gray-600 hover:text-emerald-600 transition-colors"
                    >
                      <MessageCircle className="h-5 w-5" />
                      <span>{localCounts.comments} Comments</span>
                    </button>
                  </div>
                  <button
                    onClick={handleShareClick}
                    className="flex items-center space-x-2 text-gray-600 hover:text-emerald-600 transition-colors"
                  >
                    <Share2 className="h-5 w-5" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mb-8">
            <DealComments 
              dealId={deal.id} 
              initialComments={deal.comments}
              onCommentCountChange={handleCommentCountChange}
            />
          </div>
        )}

        {/* Similar Deals Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Similar Deals</h2>
            {!user && (
              <div className="text-sm text-gray-500 flex items-center space-x-2">
                <Lock className="h-4 w-4" />
                <span>Sign in to see full details</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {similarDeals.map((similarDeal) => (
              <DealCard 
                key={similarDeal.id} 
                deal={similarDeal}
                onInteraction={handleInteraction}
                onComment={() => navigate(`/deal/${similarDeal.id}`)}
                showFullCard={!!user}
              />
            ))}
          </div>
        </div>

        {/* Join Community CTA for Non-Users */}
        {!user && (
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-8 border border-emerald-200">
            <div className="text-center max-w-2xl mx-auto">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Unlock More Exclusive Deals
              </h3>
              <p className="text-lg text-gray-600 mb-8">
                You just experienced one amazing deal! Join our community to access thousands more exclusive offers, save favorites, and connect with other smart shoppers.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link
                  to="/signup"
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <span>Join the Community</span>
                  <ExternalLink className="h-5 w-5" />
                </Link>
                <Link
                  to="/login"
                  className="border-2 border-emerald-500 text-emerald-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-emerald-50 transition-all duration-200"
                >
                  Sign In
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">50K+</div>
                  <div className="text-sm text-gray-500">Members</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">10K+</div>
                  <div className="text-sm text-gray-500">Deals</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">$2M+</div>
                  <div className="text-sm text-gray-500">Saved</div>
                </div>
              </div>
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
    </div>
  )
}

export default DealDetails