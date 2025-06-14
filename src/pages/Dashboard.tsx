import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, Deal, DealInteraction, trackDealEvent } from '../lib/supabase'
import DealCard from '../components/DealCard'
import { Search, Filter, SortAsc, Loader2, Heart } from 'lucide-react'

const Dashboard: React.FC = () => {
  const { user, profile } = useAuth()
  const [deals, setDeals] = useState<Deal[]>([])
  const [savedDeals, setSavedDeals] = useState<Deal[]>([])
  const [activeTab, setActiveTab] = useState<'all' | 'saved'>('all')
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(0)

  const ITEMS_PER_PAGE = 12

  const categories = [
    'Electronics', 'Fashion', 'Home & Garden', 'Health & Beauty', 
    'Sports & Outdoors', 'Books & Media', 'Food & Beverages', 
    'Travel', 'Automotive', 'Toys & Games'
  ]

  const fetchDeals = useCallback(async (pageNum: number = 0, reset: boolean = false) => {
    try {
      if (pageNum === 0) setLoading(true)
      else setLoadingMore(true)

      // First, try to get unexpired deals
      let unexpiredQuery = supabase
        .from('deals')
        .select(`
          *,
          interactions:deal_interactions(is_helpful, has_used),
          comments:deal_comments(id),
          user_interaction:deal_interactions!left(is_helpful, has_used),
          user_saved:deal_saves!left(id)
        `)
        .gt('expiry_date', new Date().toISOString()) // Only unexpired deals

      // Filter user interactions for the current user
      if (user?.id) {
        unexpiredQuery = unexpiredQuery.eq('user_interaction.user_id', user.id)
        unexpiredQuery = unexpiredQuery.eq('user_saved.user_id', user.id)
      }

      // Apply filters to unexpired deals
      if (searchTerm) {
        unexpiredQuery = unexpiredQuery.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,marketplace.ilike.%${searchTerm}%`)
      }

      if (selectedCategory) {
        unexpiredQuery = unexpiredQuery.eq('category', selectedCategory)
      }

      // Apply sorting
      unexpiredQuery = unexpiredQuery.order(sortBy, { ascending: sortOrder === 'asc' })

      // Apply pagination
      const from = pageNum * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1
      unexpiredQuery = unexpiredQuery.range(from, to)

      const { data: unexpiredDeals, error: unexpiredError } = await unexpiredQuery

      if (unexpiredError) throw unexpiredError

      let dealsToUse = unexpiredDeals || []

      // If we don't have enough unexpired deals, fetch some expired ones to fill the gap
      if (dealsToUse.length < ITEMS_PER_PAGE) {
        let expiredQuery = supabase
          .from('deals')
          .select(`
            *,
            interactions:deal_interactions(is_helpful, has_used),
            comments:deal_comments(id),
            user_interaction:deal_interactions!left(is_helpful, has_used),
            user_saved:deal_saves!left(id)
          `)
          .lt('expiry_date', new Date().toISOString()) // Only expired deals

        // Filter user interactions for the current user
        if (user?.id) {
          expiredQuery = expiredQuery.eq('user_interaction.user_id', user.id)
          expiredQuery = expiredQuery.eq('user_saved.user_id', user.id)
        }

        // Apply filters to expired deals
        if (searchTerm) {
          expiredQuery = expiredQuery.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,marketplace.ilike.%${searchTerm}%`)
        }

        if (selectedCategory) {
          expiredQuery = expiredQuery.eq('category', selectedCategory)
        }

        // Apply sorting
        expiredQuery = expiredQuery.order(sortBy, { ascending: sortOrder === 'asc' })

        // Get only the remaining slots needed
        const remainingSlots = ITEMS_PER_PAGE - dealsToUse.length
        expiredQuery = expiredQuery.range(0, remainingSlots - 1)

        const { data: expiredDeals, error: expiredError } = await expiredQuery

        if (expiredError) throw expiredError

        // Combine unexpired and expired deals, with unexpired first
        dealsToUse = [...dealsToUse, ...(expiredDeals || [])]
      }

      // Fetch promoter profiles separately
      const dealIds = dealsToUse?.map(deal => deal.promoter_id).filter(Boolean) || []
      const { data: promoterProfiles } = await supabase
        .from('user_profiles')
        .select('id, email')
        .in('id', dealIds)

      // Process the data to add computed fields and track views
      const processedDeals = dealsToUse?.map(deal => {
        // Track view event for each deal
        trackDealEvent(deal.id, 'view', user?.id)
        
        return {
          ...deal,
          helpful_count: deal.interactions?.filter(i => i.is_helpful === true).length || 0,
          not_helpful_count: deal.interactions?.filter(i => i.is_helpful === false).length || 0,
          user_interaction: deal.user_interaction?.[0] || null,
          user_saved: deal.user_saved?.length > 0,
          promoter: {
            email: promoterProfiles?.find(p => p.id === deal.promoter_id)?.email || 'Unknown'
          }
        }
      }) || []

      if (reset || pageNum === 0) {
        setDeals(processedDeals)
      } else {
        setDeals(prev => [...prev, ...processedDeals])
      }

      setHasMore(processedDeals.length === ITEMS_PER_PAGE)
    } catch (error) {
      console.error('Error fetching deals:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [user?.id, searchTerm, selectedCategory, sortBy, sortOrder])

  const fetchSavedDeals = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      
      const { data: savedDealsData, error } = await supabase
        .from('deal_saves')
        .select(`
          deal_id,
          deals!inner(
            *,
            interactions:deal_interactions(is_helpful, has_used),
            comments:deal_comments(id),
            user_interaction:deal_interactions!left(is_helpful, has_used)
          )
        `)
        .eq('user_id', user.id)
        .eq('deals.user_interaction.user_id', user.id)

      if (error) throw error

      // Fetch promoter profiles
      const dealIds = savedDealsData?.map(item => item.deals.promoter_id).filter(Boolean) || []
      const { data: promoterProfiles } = await supabase
        .from('user_profiles')
        .select('id, email')
        .in('id', dealIds)

      const processedSavedDeals = savedDealsData?.map(item => ({
        ...item.deals,
        helpful_count: item.deals.interactions?.filter(i => i.is_helpful === true).length || 0,
        not_helpful_count: item.deals.interactions?.filter(i => i.is_helpful === false).length || 0,
        user_interaction: item.deals.user_interaction?.[0] || null,
        user_saved: true,
        promoter: {
          email: promoterProfiles?.find(p => p.id === item.deals.promoter_id)?.email || 'Unknown'
        }
      })) || []

      setSavedDeals(processedSavedDeals)
    } catch (error) {
      console.error('Error fetching saved deals:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      if (activeTab === 'all') {
        setPage(0)
        fetchDeals(0, true)
      } else {
        fetchSavedDeals()
      }
    }
  }, [fetchDeals, fetchSavedDeals, user, activeTab])

  const handleLoadMore = () => {
    if (!loadingMore && hasMore && activeTab === 'all') {
      const nextPage = page + 1
      setPage(nextPage)
      fetchDeals(nextPage)
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

      // Refresh the deals
      if (activeTab === 'all') {
        fetchDeals(0, true)
      } else {
        fetchSavedDeals()
      }
    } catch (error) {
      console.error('Error updating interaction:', error)
    }
  }

  const handleComment = (dealId: string) => {
    // TODO: Implement comment modal/functionality
    console.log('Comment on deal:', dealId)
  }

  const handleShare = async (dealId: string) => {
    if (!user) return

    try {
      // Record the share
      await supabase
        .from('deal_shares')
        .insert({
          deal_id: dealId,
          user_id: user.id,
          platform: 'web'
        })

      // Track share event
      await trackDealEvent(dealId, 'share', user.id)

      // Copy deal link to clipboard
      const dealUrl = `${window.location.origin}/deal/${dealId}`
      await navigator.clipboard.writeText(dealUrl)
      
      // TODO: Show success toast
      console.log('Deal link copied to clipboard')
    } catch (error) {
      console.error('Error sharing deal:', error)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (activeTab === 'all') {
      setPage(0)
      fetchDeals(0, true)
    }
  }

  const handleFilterChange = (category: string) => {
    setSelectedCategory(category === selectedCategory ? '' : category)
    setPage(0)
  }

  const handleSortChange = (newSortBy: string) => {
    if (newSortBy === sortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(newSortBy)
      setSortOrder('desc')
    }
    setPage(0)
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const currentDeals = activeTab === 'all' ? deals : savedDeals

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.email?.split('@')[0]}!
          </h1>
          <p className="text-gray-600 mt-2">
            Discover amazing deals tailored for you
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('all')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'all'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All Deals
              </button>
              <button
                onClick={() => setActiveTab('saved')}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === 'saved'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Heart className="h-4 w-4" />
                <span>Saved Deals</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Search and Filters - Only show for "All Deals" tab */}
        {activeTab === 'all' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <form onSubmit={handleSearch} className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search deals by title, description, or marketplace..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </form>

            {/* Category Filters */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Categories
              </h3>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => handleFilterChange(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <SortAsc className="h-4 w-4 mr-2" />
                Sort by
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'created_at', label: 'Newest' },
                  { key: 'expiry_date', label: 'Expiring Soon' },
                  { key: 'discount_percentage', label: 'Discount %' },
                  { key: 'current_price', label: 'Price' }
                ].map(option => (
                  <button
                    key={option.key}
                    onClick={() => handleSortChange(option.key)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center space-x-1 ${
                      sortBy === option.key
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span>{option.label}</span>
                    {sortBy === option.key && (
                      <span className="text-xs">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Deals Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading deals...</p>
            </div>
          </div>
        ) : currentDeals.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              {activeTab === 'saved' 
                ? 'No saved deals yet. Start saving deals you love!' 
                : 'No deals found matching your criteria.'
              }
            </p>
            {activeTab === 'all' && (
              <p className="text-gray-500 mt-2">Try adjusting your search or filters.</p>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {currentDeals.map(deal => (
                <DealCard
                  key={deal.id}
                  deal={deal}
                  onInteraction={handleInteraction}
                  onComment={handleComment}
                  onShare={handleShare}
                />
              ))}
            </div>

            {/* Load More / End Indicator - Only for "All Deals" tab */}
            {activeTab === 'all' && (
              <div className="text-center">
                {hasMore ? (
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Loading...</span>
                      </>
                    ) : (
                      <span>Load More Deals</span>
                    )}
                  </button>
                ) : (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                    <div className="text-center">
                      <div className="text-4xl mb-4">🎉</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        You've seen all available deals!
                      </h3>
                      <p className="text-gray-600">
                        Check back later for new deals or adjust your filters to see different results.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Dashboard