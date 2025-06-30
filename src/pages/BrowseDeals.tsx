import React, { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { supabase, Deal } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import DealCard from '../components/DealCard'
import { ArrowRight, Lock, X, AlertCircle } from 'lucide-react'

const BrowseDeals: React.FC = () => {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  // const [tab, setTab] = useState<'all' | 'promoters'>('all')

  // Configuration for free deals limit
  const FREE_DEALS_LIMIT = 10

  // Get filters from URL params
  const searchTerm = searchParams.get('search') || ''
  const categoryFromUrl = searchParams.get('category') || ''
  const timeFilter = searchParams.get('time') || ''

  // Shopper-side sorting state
  const [sortBy, setSortBy] = useState<'created_at' | 'expiry_date' | 'discount'>('created_at')

  // Paging state
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // Redirect promoters away from this page
  useEffect(() => {
    if (profile?.user_type === 'promoter') {
      navigate('/promoter-dashboard', { replace: true })
      return
    }
  }, [profile, navigate])

  useEffect(() => {
    // Only fetch deals if user is not a promoter
    if (profile?.user_type !== 'promoter') {
      fetchDeals()
    }
    // eslint-disable-next-line
  }, [searchTerm, categoryFromUrl, timeFilter, profile, page, pageSize])

  // Add sorting effect for deals
  useEffect(() => {
    if (deals.length > 0) {
      let sorted = [...deals]
      if (sortBy === 'created_at') {
        sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      } else if (sortBy === 'expiry_date') {
        sorted.sort((a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime())
      } else if (sortBy === 'discount') {
        sorted.sort((a, b) => (b.discount_percentage || 0) - (a.discount_percentage || 0))
      }
      setDeals(sorted)
    }
    // eslint-disable-next-line
  }, [sortBy])

  const fetchDeals = async () => {
    try {
      setLoading(true)
      // Calculate time filter date
      let timeFilterDate = null
      if (timeFilter) {
        const now = new Date()
        switch (timeFilter) {
          case '24h':
            timeFilterDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
            break
          case '72h':
            timeFilterDate = new Date(now.getTime() - 72 * 60 * 60 * 1000)
            break
          case '7d':
            timeFilterDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            break
        }
      }

      // Calculate range for pagination
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      // First, try to get unexpired deals
      let unexpiredQuery = supabase
        .from('deals')
        .select(`
          *,
          interactions:deal_interactions(is_helpful, has_used),
          comments:deal_comments(id),
          user_interaction:deal_interactions!left(is_helpful, has_used),
          user_saved:deal_saves!left(id)
        `, { count: 'exact' })
        .gt('expiry_date', new Date().toISOString()) // Only unexpired deals

      // Filter user interactions for the current user
      if (user?.id) {
        unexpiredQuery = unexpiredQuery.eq('user_interaction.user_id', user.id)
        unexpiredQuery = unexpiredQuery.eq('user_saved.user_id', user.id)
      }

      // Apply search filter
      if (searchTerm) {
        unexpiredQuery = unexpiredQuery.textSearch(
          'search_vector',
          searchTerm,
          { type: 'websearch' }
        )
      }

      // Apply category filter
      if (categoryFromUrl) {
        unexpiredQuery = unexpiredQuery.eq('category', categoryFromUrl)
      }

      // Apply time filter
      if (timeFilterDate) {
        unexpiredQuery = unexpiredQuery.gte('created_at', timeFilterDate.toISOString())
      }

      unexpiredQuery = unexpiredQuery.order('created_at', { ascending: false }).range(from, to)

      const { data: unexpiredDeals, error: unexpiredError, count: unexpiredCount } = await unexpiredQuery

      if (unexpiredError) {
        console.error('Error fetching unexpired deals:', unexpiredError)
        throw unexpiredError
      }

      let dealsToUse = unexpiredDeals || []
      let totalCount = unexpiredCount || 0

      // If we don't have enough unexpired deals (less than pageSize), fetch some expired ones to fill the gap
      if (dealsToUse.length < pageSize) {
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

        // Apply same filters
        if (searchTerm) {
          expiredQuery = expiredQuery.textSearch(
            'search_vector',
            searchTerm,
            { type: 'websearch' }
          )
        }

        if (categoryFromUrl) {
          expiredQuery = expiredQuery.eq('category', categoryFromUrl)
        }

        if (timeFilterDate) {
          expiredQuery = expiredQuery.gte('created_at', timeFilterDate.toISOString())
        }

        expiredQuery = expiredQuery.order('created_at', { ascending: false }).range(0, pageSize - dealsToUse.length - 1)

        const { data: expiredDeals, error: expiredError } = await expiredQuery

        if (expiredError) {
          console.error('Error fetching expired deals:', expiredError)
          // Don't throw here, just continue with unexpired deals
        } else {
          // Combine unexpired and expired deals, with unexpired first
          dealsToUse = [...dealsToUse, ...(expiredDeals || [])]
        }
      }
      
      const processedDeals = dealsToUse?.map(deal => ({
        ...deal,
        helpful_count: deal.interactions?.filter((i: any) => i.is_helpful === true).length || 0,
        not_helpful_count: deal.interactions?.filter((i: any) => i.is_helpful === false).length || 0,
        user_interaction: deal.user_interaction?.[0] || null,
        user_saved: deal.user_saved?.length > 0,
        save_count: deal.user_saved?.length || 0,
      })) || []

      setDeals(processedDeals)
      // Save totalCount for pagination controls
      setTotalDeals(totalCount)
    } catch (error) {
      console.error('Error fetching deals:', error)
      setDeals([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  // Track total deals for pagination
  const [totalDeals, setTotalDeals] = useState(0)

  const handleInteraction = async (dealId: string, interaction: Partial<any>) => {
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

      // Refresh deals to get updated counts
      await fetchDeals()
    } catch (error) {
      console.error('Error updating interaction:', error)
    }
  }

  const handleComment = (dealId: string) => {
    navigate(`/deal/${dealId}`)
  }

  const handleShare = async (dealId: string) => {
    if (!user) return

    try {
      await supabase
        .from('deal_shares')
        .insert({
          deal_id: dealId,
          user_id: user.id,
          platform: 'web'
        })

      // Refresh deals to get updated counts
      await fetchDeals()
    } catch (error) {
      console.error('Error sharing deal:', error)
    }
  }

  const clearFilters = () => {
    setSearchParams({})
  }

  const hasActiveFilters = searchTerm || categoryFromUrl || timeFilter

  // Show access denied for promoters
  if (profile?.user_type === 'promoter') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <AlertCircle className="h-16 w-16 text-orange-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Restricted</h1>
          <p className="text-gray-600 mb-6 leading-relaxed">
            As a promoter, you have access to your own dashboard to manage your deals. 
            Browsing other promoters' deals is restricted to maintain platform integrity.
          </p>
          <div className="space-y-3">
            <Link
              to="/promoter-dashboard"
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 block"
            >
              Go to My Dashboard
            </Link>
            <Link
              to="/promoter-resources"
              className="border-2 border-emerald-500 text-emerald-600 px-6 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition-all duration-200 block"
            >
              Promoter Resources
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Determine which deals to show based on authentication
  const visibleDeals = user ? deals : deals.slice(0, FREE_DEALS_LIMIT)
  const hasMoreDeals = totalDeals > FREE_DEALS_LIMIT

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading amazing deals...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {hasActiveFilters ? 'Search Results' : 'Amazing Deals Await'}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {hasActiveFilters 
              ? `Found ${deals.length} deals matching your criteria`
              : 'Discover exclusive offers and limited-time deals from trusted promoters'
            }
          </p>
          
          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {searchTerm && (
                <div className="inline-flex items-center bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm">
                  <span>Search: "{searchTerm}"</span>
                </div>
              )}
              {categoryFromUrl && (
                <div className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  <span>Category: {categoryFromUrl}</span>
                </div>
              )}
              {timeFilter && (
                <div className="inline-flex items-center bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                  <span>Time: {timeFilter === '24h' ? 'Last 24 hours' : timeFilter === '72h' ? 'Last 72 hours' : 'Last 7 days'}</span>
                </div>
              )}
              <button
                onClick={clearFilters}
                className="inline-flex items-center bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm hover:bg-gray-200 transition-colors"
              >
                <X className="h-3 w-3 mr-1" />
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* No Deals Message */}
        {deals.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No deals found
              </h3>
              <p className="text-gray-600 mb-6">
                {hasActiveFilters 
                  ? 'No deals match your current search criteria. Try adjusting your filters or search terms.'
                  : 'No deals are currently available. Check back later for new offers.'
                }
              </p>
              {hasActiveFilters ? (
                <div className="space-y-3">
                  <button
                    onClick={clearFilters}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 block w-full"
                  >
                    Clear Filters & Browse All
                  </button>
                  <Link
                    to="/categories"
                    className="border-2 border-emerald-500 text-emerald-600 px-6 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition-all duration-200 block"
                  >
                    Explore Categories
                  </Link>
                </div>
              ) : (
                <Link
                  to="/categories"
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 inline-block"
                >
                  Explore Categories
                </Link>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Sorting Controls */}
            {!!user && (
              <div className="flex justify-end mb-4">
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                <option value="created_at">Newest First</option>
                <option value="expiry_date">Expiring Soon</option>
                <option value="discount">Biggest Discount</option>
              </select>
            </div>
    )}

            {/* Paging Controls */}
            {deals.length > 0 && (
          <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Page Size:</span>
              <select
                value={pageSize}
                onChange={e => { setPageSize(Number(e.target.value)); setPage(1) }}
                className="px-2 py-1 border border-gray-300 rounded"
              >
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-700 disabled:opacity-50"
              >
                Prev
              </button>
              <span className="text-sm text-gray-600">Page {page} of {Math.ceil(totalDeals / pageSize) || 1}</span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page * pageSize >= totalDeals}
                className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}

            {/* Deals Grid */}
            <div className="flex flex-col mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleDeals.map((deal) => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    onInteraction={handleInteraction}
                    onComment={handleComment}
                    onShare={handleShare}
                    showFullCard={!!user}
                  />
                ))}
              </div>
            </div>

            {/* Call to Action for Non-Users */}
            {!user && (
              <div className="mt-12 text-center">
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-8 border border-emerald-200">
                  {hasMoreDeals && (
                    <div className="mb-6">
                      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {deals.length - FREE_DEALS_LIMIT}+ More Exclusive Deals Available
                      </h3>
                      <p className="text-gray-600 mb-6">
                        You've seen {FREE_DEALS_LIMIT} deals! Join our community to discover unlimited exclusive offers and connect with trusted promoters.
                      </p>
                    </div>
                  )}
                  
                  {!hasMoreDeals && (
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        Join JadeDeals Community
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Sign up to unlock full deal interactions, save favorites, and connect with our community of smart shoppers
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                      to="/signup"
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <span>Join Now - It's Free</span>
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                    <Link
                      to="/login"
                      className="border-2 border-emerald-500 text-emerald-600 px-8 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition-all duration-200"
                    >
                      Sign In
                    </Link>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-emerald-600">50K+</div>
                        <div className="text-xs text-gray-500">Members</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-emerald-600">10K+</div>
                        <div className="text-xs text-gray-500">Deals</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-emerald-600">$2M+</div>
                        <div className="text-xs text-gray-500">Saved</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default BrowseDeals