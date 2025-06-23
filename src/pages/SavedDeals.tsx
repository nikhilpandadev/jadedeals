import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, Deal, DealInteraction, trackDealEvent } from '../lib/supabase'
import DealCard from '../components/DealCard'
import { Search, Filter, SortAsc, Loader2, Heart, Trash2 } from 'lucide-react'

const SavedDeals: React.FC = () => {
  const { user, profile } = useAuth()
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(0)
  const [selectedDeals, setSelectedDeals] = useState<string[]>([])

  const ITEMS_PER_PAGE = 12

  const categories = [
    'Electronics', 'Fashion', 'Home & Garden', 'Health & Beauty', 
    'Sports & Outdoors', 'Books & Media', 'Food & Beverages', 
    'Travel', 'Automotive', 'Toys & Games'
  ]

  const fetchSavedDeals = useCallback(async (pageNum: number = 0, reset: boolean = false) => {
    if (!user) return

    try {
      if (pageNum === 0) setLoading(true)
      else setLoadingMore(true)

      let query = supabase
        .from('deal_saves')
        .select(`
          deal_id,
          created_at,
          deals!inner(
            *,
            interactions:deal_interactions(is_helpful, has_used),
            comments:deal_comments(id),
            user_interaction:deal_interactions!left(is_helpful, has_used)
          )
        `)
        .eq('user_id', user.id)
        .eq('deals.user_interaction.user_id', user.id)

      // Apply filters
      if (searchTerm) {
        query = query.or(`deals.title.ilike.%${searchTerm}%,deals.description.ilike.%${searchTerm}%,deals.marketplace.ilike.%${searchTerm}%`)
      }

      if (selectedCategory) {
        query = query.eq('deals.category', selectedCategory)
      }

      // Apply sorting
      if (sortBy === 'created_at') {
        query = query.order('created_at', { ascending: sortOrder === 'asc' })
      } else {
        query = query.order(`deals.${sortBy}`, { ascending: sortOrder === 'asc' })
      }

      // Apply pagination
      const from = pageNum * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1
      query = query.range(from, to)

      const { data, error } = await query

      if (error) throw error

      // Fetch promoter profiles
      const dealIds = data?.map(item => item.deals.promoter_id).filter(Boolean) || []
      const { data: promoterProfiles } = await supabase
        .from('user_profiles')
        .select('id, email')
        .in('id', dealIds)

      const processedDeals = data?.map(item => ({
        ...item.deals,
        helpful_count: item.deals.interactions?.filter(i => i.is_helpful === true).length || 0,
        not_helpful_count: item.deals.interactions?.filter(i => i.is_helpful === false).length || 0,
        user_interaction: item.deals.user_interaction?.[0] || null,
        user_saved: true,
        saved_at: item.created_at,
        promoter: {
          email: promoterProfiles?.find(p => p.id === item.deals.promoter_id)?.email || 'Unknown'
        }
      })) || []

      if (reset || pageNum === 0) {
        setDeals(processedDeals)
      } else {
        setDeals(prev => [...prev, ...processedDeals])
      }

      setHasMore(processedDeals.length === ITEMS_PER_PAGE)
    } catch (error) {
      console.error('Error fetching saved deals:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [user, searchTerm, selectedCategory, sortBy, sortOrder])

  useEffect(() => {
    if (user) {
      setPage(0)
      fetchSavedDeals(0, true)
    }
  }, [fetchSavedDeals, user])

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchSavedDeals(nextPage)
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
      fetchSavedDeals(0, true)
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
      
      console.log('Deal link copied to clipboard')
    } catch (error) {
      console.error('Error sharing deal:', error)
    }
  }

  const handleUnsave = async (dealId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('deal_saves')
        .delete()
        .eq('deal_id', dealId)
        .eq('user_id', user.id)

      if (error) throw error

      // Track unsave event
      await trackDealEvent(dealId, 'save', user.id)
      // Remove from local state
      setDeals(prev => prev.filter(deal => deal.id !== dealId))
      setSelectedDeals(prev => prev.filter(id => id !== dealId))
    } catch (error) {
      console.error('Error unsaving deal:', error)
    }
  }

  const handleBulkUnsave = async () => {
    if (!user || selectedDeals.length === 0) return

    try {
      const { error } = await supabase
        .from('deal_saves')
        .delete()
        .in('deal_id', selectedDeals)
        .eq('user_id', user.id)

      if (error) throw error

      // Remove from local state
      setDeals(prev => prev.filter(deal => !selectedDeals.includes(deal.id)))
      setSelectedDeals([])
    } catch (error) {
      console.error('Error bulk unsaving deals:', error)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(0)
    fetchSavedDeals(0, true)
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

  const toggleDealSelection = (dealId: string) => {
    setSelectedDeals(prev => 
      prev.includes(dealId) 
        ? prev.filter(id => id !== dealId)
        : [...prev, dealId]
    )
  }

  const toggleSelectAll = () => {
    if (selectedDeals.length === deals.length) {
      setSelectedDeals([])
    } else {
      setSelectedDeals(deals.map(deal => deal.id))
    }
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your saved deals...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                <Heart className="h-8 w-8 text-red-500" />
                <span>Saved Deals</span>
              </h1>
              <p className="text-gray-600 mt-2">
                Your collection of favorite deals
              </p>
            </div>
            
            {selectedDeals.length > 0 && (
              <button
                onClick={handleBulkUnsave}
                className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Remove Selected ({selectedDeals.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search your saved deals..."
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
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <SortAsc className="h-4 w-4 mr-2" />
                Sort by
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'created_at', label: 'Date Saved' },
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

            {deals.length > 0 && (
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedDeals.length === deals.length && deals.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700">Select All</span>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Deals Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your saved deals...</p>
            </div>
          </div>
        ) : deals.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No saved deals yet</h3>
            <p className="text-gray-600 text-lg mb-6">
              Start saving deals you love to see them here!
            </p>
            <a
              href="/browse-deals"
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 inline-block"
            >
              Browse Deals
            </a>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {deals.map(deal => (
                <div key={deal.id} className="relative">
                  {/* Selection Checkbox */}
                  <div className="absolute top-4 left-4 z-10">
                    <input
                      type="checkbox"
                      checked={selectedDeals.includes(deal.id)}
                      onChange={() => toggleDealSelection(deal.id)}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 bg-white shadow-sm"
                    />
                  </div>
                  
                  {/* Unsave Button */}
                  <div className="absolute top-4 right-4 z-10">
                    <button
                      onClick={() => handleUnsave(deal.id)}
                      className="p-2 bg-white rounded-full shadow-sm hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="Remove from saved"
                    >
                      <Heart className="h-4 w-4 fill-current text-red-500" />
                    </button>
                  </div>

                  <DealCard
                    deal={deal}
                    onInteraction={handleInteraction}
                    onComment={handleComment}
                    onShare={handleShare}
                  />
                </div>
              ))}
            </div>

            {/* Load More */}
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
              ) : deals.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                  <div className="text-center">
                    <div className="text-4xl mb-4">💎</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      You've seen all your saved deals!
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Discover more amazing deals to add to your collection.
                    </p>
                    <a
                      href="/browse-deals"
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 inline-block"
                    >
                      Browse More Deals
                    </a>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default SavedDeals