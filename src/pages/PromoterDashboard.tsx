import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, Deal, PromoterStats, getFollowersOfPromoter, removeFollower } from '../lib/supabase'
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  MousePointer, 
  Heart, 
  Share2,
  MessageCircle,
  Calendar,
  Filter,
  Search,
  Edit,
  Trash2,
  MoreHorizontal,
  Upload,
  X,
  Check,
  AlertCircle,
  BarChart3,
  Users,
  Target,
  BookOpen,
  User,
  Link as LinkIcon,
  Globe
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { getUserAvatar } from '../utils/avatars'
import { isValidImageUrl, isValidImageFile } from '../utils/imageValidation'
import * as XLSX from 'xlsx'


const PromoterDashboard: React.FC = () => {
  const { user, profile } = useAuth()
  const [deals, setDeals] = useState<Deal[]>([])
  const [stats, setStats] = useState<PromoterStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreateDeal, setShowCreateDeal] = useState(false)
  const [showProfileEdit, setShowProfileEdit] = useState(false)
  const [selectedDeals, setSelectedDeals] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired'>('all')
  const [sortBy, setSortBy] = useState<'created_at' | 'expiry_date' | 'performance'>('created_at')
  // Paging state
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [totalDeals, setTotalDeals] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [showCommentsModal, setShowCommentsModal] = useState<null | string>(null) // dealId or null

  // Profile editing state
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    bio: '',
    website: '',
    social_links: {
      twitter: '',
      instagram: '',
      youtube: '',
      tiktok: ''
    }
  })

  const [followers, setFollowers] = useState<any[]>([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);

  // Add state for editing deals
  const [editDeal, setEditDeal] = useState<Deal | null>(null)

  const [showBulkUpload, setShowBulkUpload] = useState(false)

  useEffect(() => {
    if (user && profile?.user_type === 'promoter') {
      fetchStats()
      fetchDeals(1, true)
      loadPromoterProfile()
      fetchFollowers();
    }
  }, [user, profile])

  // Ensure deals are refetched when filters or sorting change
  useEffect(() => {
    if (user && profile?.user_type === 'promoter') {
      setPage(1)
      fetchDeals(1, true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterStatus, sortBy, pageSize])

  const loadPromoterProfile = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('first_name, last_name, username, bio, website, social_links')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading promoter profile:', error)
        return
      }

      if (data) {
        setProfileData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          username: data.username || '',
          bio: data.bio || '',
          website: data.website || '',
          social_links: data.social_links || {
            twitter: '',
            instagram: '',
            youtube: '',
            tiktok: ''
          }
        })
      }
    } catch (error) {
      console.error('Error loading promoter profile:', error)
    }
  }

  const updatePromoterProfile = async () => {
    if (!user) return

    try {
      // Update username in deals if changed
      if (profile?.username && profileData.username && profile?.username !== profileData.username) {
        await supabase
          .from('deals')
          .update({ promoter_username: profileData.username })
          .eq('promoter_id', user.id)
      }
      const { error } = await supabase
        .from('user_profiles')
        .update({
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          username: profileData.username, // NEW
          bio: profileData.bio,
          website: profileData.website,
          social_links: profileData.social_links,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      setShowProfileEdit(false)
    } catch (error) {
      console.error('Error updating promoter profile:', error)
    }
  }

  const fetchStats = async () => {
    if (!user) return

    try {
      const now = new Date()
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

      // 1. Get all deal IDs for this promoter
      const { data: promoterDeals, error: dealsError } = await supabase
        .from('deals')
        .select('id, created_at')
        .eq('promoter_id', user.id)

      if (dealsError) throw dealsError
      const dealIds = promoterDeals?.map((d: { id: string }) => d.id) || []
      if (dealIds.length === 0) {
        setStats({
          total_deals: 0,
          previous_week_deals: false,
          deals_last_7_days: 0,
          total_clicks: 0,
          total_views: 0,
          total_saves: 0,
          total_shares: 0,
          conversion_rate: 0,
          change_vs_previous_week: { deals: 0, clicks: 0, views: 0, saves: 0, shares: 0 }
        })
        return
      }

      // Helper to fetch analytics counts for a period
      const fetchAnalytics = async (from: Date, to?: Date) => {
        let query = supabase
          .from('daily_deal_analytics')
          .select('event_type, deal_id, user_id')
          .in('deal_id', dealIds)
          .gte('created_at', from.toISOString())
        if (to) query = query.lt('created_at', to.toISOString())
        const { data, error } = await query
        if (error) throw error
        // Aggregate by event_type
        const stats = { views: 0, clicks: 0, saves: 0, shares: 0 }
        data?.forEach((row: any) => {
          if (row.event_type === 'view') stats.views += 1
          if (row.event_type === 'click') stats.clicks += 1
          if (row.event_type === 'save') stats.saves += 1
          if (row.event_type === 'share') stats.shares += 1
        })
        return stats
      }

      // Fetch stats for current week, previous week, and all time
      const [currentStats, previousStats, totals] = await Promise.all([
        fetchAnalytics(sevenDaysAgo),
        fetchAnalytics(fourteenDaysAgo, sevenDaysAgo),
        fetchAnalytics(new Date('2025-01-01')),
      ])

      // Get total deals count and deals in last 7 days/previous 7 days
      const dealsLast7Days = promoterDeals.filter((d: any) => new Date(d.created_at) >= sevenDaysAgo).length
      const dealsPrev7Days = promoterDeals.filter((d: any) => new Date(d.created_at) >= fourteenDaysAgo && new Date(d.created_at) < sevenDaysAgo).length
      const totalDeals = promoterDeals.length

      const conversionRate = totals.views > 0 ? (totals.clicks / totals.views) * 100 : 0

      setStats({
        total_deals: totalDeals,
        previous_week_deals: dealsPrev7Days > 0 ? true : false,
        deals_last_7_days: dealsLast7Days,
        total_clicks: totals.clicks,
        total_views: totals.views,
        total_saves: totals.saves,
        total_shares: totals.shares,
        conversion_rate: conversionRate,
        change_vs_previous_week: {
          deals: dealsPrev7Days > 0 ? ((dealsLast7Days - dealsPrev7Days) / dealsPrev7Days) * 100 : 0,
          clicks: previousStats.clicks > 0 ? ((currentStats.clicks - previousStats.clicks) / previousStats.clicks) * 100 : 0,
          views: previousStats.views > 0 ? ((currentStats.views - previousStats.views) / previousStats.views) * 100 : 0,
          saves: previousStats.saves > 0 ? ((currentStats.saves - previousStats.saves) / previousStats.saves) * 100 : 0,
          shares: previousStats.shares > 0 ? ((currentStats.shares - previousStats.shares) / previousStats.shares) * 100 : 0
        }
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
      setStats({
        total_deals: 0,
        previous_week_deals: false,
        deals_last_7_days: 0,
        total_clicks: 0,
        total_views: 0,
        total_saves: 0,
        total_shares: 0,
        conversion_rate: 0,
        change_vs_previous_week: { deals: 0, clicks: 0, views: 0, saves: 0, shares: 0 }
      })
    }
  }

  const fetchDeals = useCallback(async (pageNum: number = 1, reset: boolean = false) => {
    if (!user) return

    try {
      if (pageNum === 1) setLoading(true)

      let query = supabase
        .from('deals')
        .select('*', { count: 'exact' })
        .eq('promoter_id', user.id)
        .eq('promoter_username', profile?.username) // NEW: filter by username

      // Apply filters
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,marketplace.ilike.%${searchTerm}%`)
      }

      if (filterStatus === 'active') {
        query = query.gt('expiry_date', new Date().toISOString())
      } else if (filterStatus === 'expired') {
        query = query.lt('expiry_date', new Date().toISOString())
      }

      // Apply sorting
      if (sortBy === 'performance') {
        query = query.order('click_count', { ascending: false })
      } else {
        query = query.order(sortBy, { ascending: false })
      }

      // Apply pagination
      const from = (pageNum - 1) * pageSize
      const to = from + pageSize - 1
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) throw error
      setTotalDeals(count || 0)

      // Fetch real stats from deal_analytics for these deals
      const dealIds = (data || []).map(deal => deal.id)
      let analyticsMap: Record<string, { view_count: number, click_count: number, save_count: number, share_count: number, comment_count: number }> = {}
      if (dealIds.length > 0) {
        const { data: analyticsData, error: analyticsError } = await supabase
          .from('daily_deal_analytics')
          .select('deal_id, event_type')
          .in('deal_id', dealIds)
        if (analyticsError) throw analyticsError

        // Fetch comment counts for each deal
        const { data: commentsData, error: commentsError } = await supabase
          .from('deal_comments')
          .select('*')
          .in('deal_id', dealIds)

        if (commentsError) throw commentsError

        // Aggregate counts by deal_id and event_type
        analyticsData?.forEach((row: any) => {
          if (!analyticsMap[row.deal_id]) {
            analyticsMap[row.deal_id] = { 
              view_count: 0, 
              click_count: 0, 
              save_count: 0, 
              share_count: 0, 
              comment_count: commentsData.filter(deal => deal.deal_id === row.deal_id).length 
            }
          }
          if (row.event_type === 'view') analyticsMap[row.deal_id].view_count += 1
          if (row.event_type === 'click') analyticsMap[row.deal_id].click_count += 1
          if (row.event_type === 'save') analyticsMap[row.deal_id].save_count += 1
          if (row.event_type === 'share') analyticsMap[row.deal_id].share_count += 1
        })
      }

      // Attach real stats to each deal
      const processedDeals = (data || []).map(deal => ({
        ...deal,
        view_count: analyticsMap[deal.id]?.view_count || 0,
        click_count: analyticsMap[deal.id]?.click_count || 0,
        save_count: analyticsMap[deal.id]?.save_count || 0,
        share_count: analyticsMap[deal.id]?.share_count || 0,
        comment_count: analyticsMap[deal.id]?.comment_count || 0
      }))

      if (reset || pageNum === 1) {
        setDeals(processedDeals)
      } else {
        setDeals(prev => [...prev, ...processedDeals])
      }

      setHasMore((from + processedDeals.length) < (count || 0))
    } catch (error) {
      console.error('Error fetching deals:', error)
    } finally {
      setLoading(false)
    }
  }, [user, searchTerm, filterStatus, sortBy, pageSize, profile?.username])

  const fetchFollowers = async () => {
    if (!user) return;
    setLoadingFollowers(true);
    const { data } = await getFollowersOfPromoter(user.id);
    setFollowers(data || []);
    setLoadingFollowers(false);
  };

  useEffect(() => {
    if (profile?.user_type === 'promoter') fetchFollowers();
  }, [profile, user]);

  const handleRemoveFollower = async (shopperId: string) => {
    if (!user) return;
    await removeFollower(user.id, shopperId);
    fetchFollowers();
  };

  const handleBulkDelete = async () => {
    if (!selectedDeals.length) return

    try {
      // Delete related analytics and comments for each deal
      await supabase.from('deal_analytics').delete().in('deal_id', selectedDeals)
      await supabase.from('deal_comments').delete().in('deal_id', selectedDeals)
      // Now delete the deals
      const { error } = await supabase
        .from('deals')
        .delete()
        .in('id', selectedDeals)

      if (error) throw error

      setSelectedDeals([])
      fetchDeals(1, true)
      fetchStats()
    } catch (error) {
      console.error('Error deleting deals:', error)
    }
  }

  const StatCard: React.FC<{
    title: string
    value: string | number
    change?: number
    icon: React.ReactNode
    color: string
    previousWeekDeals?: boolean
  }> = ({ title, value, change, icon, color, previousWeekDeals }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          { previousWeekDeals && change !== undefined && (
            <div className={`flex items-center mt-2 text-sm ${
              change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {change > 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
              {change < 0 ? <TrendingDown className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
              {change !== 0 ? change.toFixed(1) : 0}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  )

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  // Access control: Only allow logged-in promoter to access their own dashboard
  if (profile && profile.user_type === 'promoter' && user && profile.id !== user.id) {
    return (
      <div className="py-16 text-center text-red-600 font-semibold">
        Access Denied: You are not allowed to view another promoter's dashboard.
      </div>
    )
  }

  if (!user || profile?.user_type !== 'promoter') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You need to be a promoter to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Promoter's Dashboard</h1>
            <p className="text-gray-600 mt-2">Track your deals performance and manage your content</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowCreateDeal(true)}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Create Deal</span>
            </button>
          </div>
        </div>

        {/* Promoter Profile Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <img
                src={getUserAvatar(user.email || '', user.id)}
                alt="Profile"
                className="w-16 h-16 rounded-full border-4 border-emerald-200"
              />
              <div>
                <h3 className="text-xl font-bold text-gray-900">{profileData.first_name} {profileData.last_name} ({user.email?.split('@')[0]})</h3>
                <p className="text-emerald-600 font-medium">Promoter</p>
                {profileData.bio && (
                  <p className="text-gray-600 mt-2 max-w-md">{profileData.bio}</p>
                )}
                <div className="flex items-center space-x-4 mt-2">
                  {profileData.website && (
                    <a
                      href={profileData.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-emerald-600 hover:text-emerald-700 text-sm"
                    >
                      <Globe className="h-4 w-4" />
                      <span>Website</span>
                    </a>
                  )}
                  {Object.entries(profileData.social_links).map(([platform, url]) => 
                    url && (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-emerald-600 hover:text-emerald-700 text-sm capitalize"
                      >
                        <LinkIcon className="h-4 w-4" />
                        <span>{platform}</span>
                      </a>
                    )
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <button
                onClick={() => setShowProfileEdit(true)}
                className="flex items-center space-x-2 text-gray-600 hover:text-emerald-600 transition-colors"
              >
                <Edit className="h-4 w-4" />
                <span>Edit Profile</span>
              </button>
              <button
                onClick={() => window.location.href = '/followers-management'}
                className="flex items-center space-x-2 text-gray-600 hover:text-emerald-600 transition-colors"
              >
                <Users className="h-4 w-4" />
                <span>Edit Followers</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Deals"
              value={stats.total_deals}
              change={stats.change_vs_previous_week.deals}
              icon={<BarChart3 className="h-6 w-6 text-white" />}
              color="bg-gradient-to-br from-blue-500 to-blue-600"
              previousWeekDeals={stats.previous_week_deals}
            />
            <StatCard
              title="Total Views"
              value={stats.total_views.toLocaleString()}
              change={stats.change_vs_previous_week.views}
              icon={<Eye className="h-6 w-6 text-white" />}
              color="bg-gradient-to-br from-emerald-500 to-emerald-600"
              previousWeekDeals={stats.previous_week_deals}
            />
            <StatCard
              title="Total Clicks"
              value={stats.total_clicks.toLocaleString()}
              change={stats.change_vs_previous_week.clicks}
              icon={<MousePointer className="h-6 w-6 text-white" />}
              color="bg-gradient-to-br from-purple-500 to-purple-600"
              previousWeekDeals={stats.previous_week_deals}
            />
            <StatCard
              title="Conversion Rate"
              value={`${stats.conversion_rate.toFixed(1)}%`}
              icon={<Target className="h-6 w-6 text-white" />}
              color="bg-gradient-to-br from-orange-500 to-orange-600"
              previousWeekDeals={stats.previous_week_deals}
            />
          </div>
        )}

        {/* Additional Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Total Saves"
              value={stats.total_saves.toLocaleString()}
              change={stats.change_vs_previous_week.saves}
              icon={<Heart className="h-6 w-6 text-white" />}
              color="bg-gradient-to-br from-pink-500 to-pink-600"
              previousWeekDeals={stats.previous_week_deals}
            />
            <StatCard
              title="Total Shares"
              value={stats.total_shares.toLocaleString()}
              change={stats.change_vs_previous_week.shares}
              icon={<Share2 className="h-6 w-6 text-white" />}
              color="bg-gradient-to-br from-cyan-500 to-cyan-600"
              previousWeekDeals={stats.previous_week_deals}
            />
            <StatCard
              title="Deals This Week"
              value={stats.deals_last_7_days}
              change={stats.change_vs_previous_week.deals}
              icon={<Calendar className="h-6 w-6 text-white" />}
              color="bg-gradient-to-br from-indigo-500 to-indigo-600"
              previousWeekDeals={stats.previous_week_deals}
            />
          </div>
        )}

        {/* Deals Management */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Your Deals</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowBulkUpload(true)}
                className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-600 transition-colors flex items-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span>Bulk Upload</span>
              </button>
              {selectedDeals.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center space-x-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Selected ({selectedDeals.length})</span>
                </button>
              )}
            </div>
          </div>

          {/* Select All Checkbox */}
          {deals.length > 0 && (
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={selectedDeals.length === deals.length}
                onChange={e => {
                  if (e.target.checked) setSelectedDeals(deals.map(d => d.id))
                  else setSelectedDeals([])
                }}
                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 mr-2"
              />
              <span className="text-sm text-gray-700">Select All</span>
            </div>
          )}

          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search deals..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">All Deals</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="created_at">Newest First</option>
              <option value="expiry_date">Expiring Soon</option>
              <option value="performance">Best Performance</option>
            </select>
          </div>

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
                  onClick={() => { if (page > 1) { setPage(page - 1); fetchDeals(page - 1, true) } }}
                  disabled={page === 1}
                  className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-700 disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="text-sm text-gray-600">Page {page} of {Math.ceil(totalDeals / pageSize) || 1}</span>
                <button
                  onClick={() => { if (page * pageSize < totalDeals) { setPage(page + 1); fetchDeals(page + 1, true) } }}
                  disabled={page * pageSize >= totalDeals}
                  className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-700 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Deals List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
          ) : deals.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No deals found. Create your first deal to get started!</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {deals.map((deal) => (
                  <DealRow
                    key={deal.id}
                    deal={deal}
                    selected={selectedDeals.includes(deal.id)}
                    onSelect={(selected) => {
                      if (selected) setSelectedDeals(prev => [...prev, deal.id])
                      else setSelectedDeals(prev => prev.filter(id => id !== deal.id))
                    }}
                    onEdit={() => setEditDeal(deal)}
                    onDelete={() => setConfirmDeleteId(deal.id)}
                    onViewComments={() => setShowCommentsModal(deal.id)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Create Deal Modal */}
      {showCreateDeal && (
        <CreateDealModal
          onClose={() => setShowCreateDeal(false)}
          onSuccess={() => {
            setShowCreateDeal(false)
            fetchDeals(1, true)
            fetchStats()
          }}
        />
      )}

      {/* Profile Edit Modal */}
      {showProfileEdit && (
        <ProfileEditModal
          profileData={profileData}
          setProfileData={setProfileData}
          onClose={() => setShowProfileEdit(false)}
          onSave={updatePromoterProfile}
        />
      )}

      {/* Comments Modal */}
      {showCommentsModal && (
        <CommentsModal
          dealId={showCommentsModal}
          onClose={() => setShowCommentsModal(null)}
        />
      )}

      {/* Confirmation Delete Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Delete Deal?</h2>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this deal? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    // Delete related analytics and comments for this deal
                    await supabase.from('deal_analytics').delete().eq('deal_id', confirmDeleteId)
                    await supabase.from('deal_comments').delete().eq('deal_id', confirmDeleteId)
                    // Now delete the deal
                    await supabase.from('deals').delete().eq('id', confirmDeleteId)
                    setConfirmDeleteId(null)
                    fetchDeals(1, true)
                    fetchStats()
                  } catch (error) {
                    console.error('Error deleting deal:', error)
                    setConfirmDeleteId(null)
                  }
                }}
                className="px-6 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Deal Modal */}
      {editDeal && (
        <EditDealModal
          deal={editDeal}
          onClose={() => setEditDeal(null)}
          onSuccess={() => {
            setEditDeal(null)
            fetchDeals(1, true)
            fetchStats()
          }}
        />
      )}

      {/* Bulk Upload Modal */}
      {showBulkUpload && (
        <BulkUploadModal
          onClose={() => setShowBulkUpload(false)}
          onSuccess={() => {
            setShowBulkUpload(false)
            fetchDeals(1, true)
            fetchStats()
          }}
        />
      )}
    </div>
  )
}

// Deal Row Component
const DealRow: React.FC<{
  deal: Deal
  selected: boolean
  onSelect: (selected: boolean) => void
  onEdit: () => void
  onDelete: () => void
  onViewComments: () => void
}> = ({ deal, selected, onSelect, onEdit, onDelete, onViewComments }) => {
  const isExpired = new Date(deal.expiry_date) < new Date()
  return (
    <div className={`border rounded-lg p-4 ${selected ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'}`}>
      <div className="flex items-center space-x-4">
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onSelect(e.target.checked)}
          className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
        />
        
        {deal.image_url && (
          <img
            src={deal.image_url}
            alt={deal.title}
            referrerPolicy="no-referrer"
            loading="lazy"
            className="w-16 h-16 object-cover rounded-lg"
          />
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-semibold text-gray-900 truncate">{deal.title}</h3>
            {isExpired && (
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Expired</span>
            )}
          </div>
          <p className="text-sm text-gray-600 truncate">{deal.description}</p>
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
            <span className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>{deal.view_count || 0}</span>
            </span>
            <span className="flex items-center space-x-1">
              <MousePointer className="h-4 w-4" />
              <span>{deal.click_count || 0}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Heart className="h-4 w-4" />
              <span>{deal.save_count || 0}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Share2 className="h-4 w-4" />
              <span>{deal.share_count || 0}</span>
            </span>
            <span className="flex items-center space-x-1">
              <button
                onClick={onViewComments}
                className="focus:outline-none"
                title="View Comments"
              >
                <MessageCircle className="h-4 w-4 text-emerald-600 hover:text-emerald-700 transition-colors" />
              </button>
              <span>{deal.comment_count || 0}</span>
            </span>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-lg font-bold text-emerald-600">${deal.current_price}</div>
          <div className="text-sm text-gray-500 line-through">${deal.retail_price}</div>
          <div className="text-sm font-medium text-orange-600">{deal.discount_percentage}% OFF</div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={onEdit}
            className="p-2 text-gray-400 hover:text-emerald-600 transition-colors"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Profile Edit Modal Component
const ProfileEditModal: React.FC<{
  profileData: any
  setProfileData: (data: any) => void
  onClose: () => void
  onSave: () => void
}> = ({ profileData, setProfileData, onClose, onSave }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Edit Promoter Profile</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                value={profileData.first_name}
                onChange={(e) => setProfileData((prev: typeof profileData) => ({ ...prev, first_name: e.target.value }))}
                placeholder="John"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={profileData.last_name}
                onChange={(e) => setProfileData((prev: typeof profileData) => ({ ...prev, last_name: e.target.value }))}
                placeholder="Doe"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                value={profileData.bio}
                onChange={(e) => setProfileData((prev: typeof profileData) => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell your audience about yourself and what kind of deals you share..."
                rows={4}
                maxLength={500}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">{profileData.bio.length}/500 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                value={profileData.website}
                onChange={(e) => setProfileData((prev: typeof profileData) => ({ ...prev, website: e.target.value }))}
                placeholder="https://your-website.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Social Media Links
              </label>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Twitter
                  </label>
                  <input
                    type="url"
                    value={profileData.social_links.twitter}
                    onChange={(e) => setProfileData((prev: typeof profileData) => ({
                      ...prev,
                      social_links: {
                        ...prev.social_links,
                        twitter: e.target.value
                      }
                    }))}
                    placeholder="https://twitter.com/yourusername"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Instagram
                  </label>
                  <input
                    type="url"
                    value={profileData.social_links.instagram}
                    onChange={(e) => setProfileData((prev: typeof profileData) => ({
                      ...prev,
                      social_links: {
                        ...prev.social_links,
                        instagram: e.target.value
                      }
                    }))}
                    placeholder="https://instagram.com/yourusername"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    YouTube
                  </label>
                  <input
                    type="url"
                    value={profileData.social_links.youtube}
                    onChange={(e) => setProfileData((prev: typeof profileData) => ({
                      ...prev,
                      social_links: {
                        ...prev.social_links,
                        youtube: e.target.value
                      }
                    }))}
                    placeholder="https://youtube.com/yourusername"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    TikTok
                  </label>
                  <input
                    type="url"
                    value={profileData.social_links.tiktok}
                    onChange={(e) => setProfileData((prev: typeof profileData) => ({
                      ...prev,
                      social_links: {
                        ...prev.social_links,
                        tiktok: e.target.value
                      }
                    }))}
                    placeholder="https://tiktok.com/@yourusername"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-8">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Create Deal Modal Component
const CreateDealModal: React.FC<{
  onClose: () => void
  onSuccess: () => void
}> = ({ onClose, onSuccess }) => {
  const { user, profile } = useAuth()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    coupon_code: '',
    retail_price: '',
    current_price: '',
    category: '',
    marketplace: '',
    affiliate_link: '',
    expiry_date: '',
    image_url: ''
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [imageFileError, setImageFileError] = useState('')

  const categories = [
    'Electronics', 'Fashion', 'Home & Garden', 'Health & Beauty',
    'Sports & Outdoors', 'Books & Media', 'Food & Beverages',
    'Travel', 'Automotive', 'Toys & Games'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !profile) return
    setLoading(true)
    setError('')
    setImageFileError('')
    // Validate image URL if provided
    if (formData.image_url && !isValidImageUrl(formData.image_url)) {
      setError('Image URL must be https and end with .jpg, .jpeg, or .png')
      setLoading(false)
      return
    }
    // Validate image file if provided
    if (imageFile && !isValidImageFile(imageFile)) {
      setImageFileError('Image must be PNG/JPG/JPEG and <= 1MB')
      setLoading(false)
      return
    }
    let imageUrl = formData.image_url || null
    // If file is provided, upload to Supabase Storage
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${user.id}_${Date.now()}.${fileExt}`
      const { data, error: uploadError } = await supabase.storage.from('productimages').upload(fileName, imageFile, {
        cacheControl: '3600',
        upsert: false
      })
      if (uploadError) {
        setError('Failed to upload image')
        setLoading(false)
        return
      }
      imageUrl = data ? supabase.storage.from('productimages').getPublicUrl(fileName).data.publicUrl : null
    }
    try {
      const retailPrice = parseFloat(formData.retail_price)
      const currentPrice = parseFloat(formData.current_price)
      const discountPercentage = Math.round(((retailPrice - currentPrice) / retailPrice) * 100)
      const { error } = await supabase.from('deals').insert({
        title: formData.title,
        description: formData.description,
        coupon_code: formData.coupon_code || null,
        retail_price: retailPrice,
        current_price: currentPrice,
        discount_percentage: discountPercentage,
        category: formData.category,
        marketplace: formData.marketplace,
        promoter_id: user.id,
        promoter_username: profile.username, // set username
        affiliate_link: formData.affiliate_link,
        expiry_date: formData.expiry_date,
        image_url: imageUrl
      })
      if (error) throw error
      onSuccess()
    } catch (error: any) {
      setError(error.message || 'Failed to create deal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Create New Deal</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Apple AirPods Pro (2nd Generation)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                maxLength={120}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the deal and what makes it special..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                maxLength={240}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marketplace *
                </label>
                <input
                  type="text"
                  required
                  value={formData.marketplace}
                  onChange={(e) => setFormData(prev => ({ ...prev, marketplace: e.target.value }))}
                  placeholder="e.g., Amazon, Best Buy, Nike"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Retail Price *
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={formData.retail_price}
                  onChange={(e) => setFormData(prev => ({ ...prev, retail_price: e.target.value }))}
                  placeholder="199.99"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sale Price *
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={formData.current_price}
                  onChange={(e) => setFormData(prev => ({ ...prev, current_price: e.target.value }))}
                  placeholder="149.99"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Coupon Code (Optional)
              </label>
              <input
                type="text"
                value={formData.coupon_code}
                onChange={(e) => setFormData(prev => ({ ...prev, coupon_code: e.target.value }))}
                placeholder="e.g., SAVE20"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Affiliate Link *
              </label>
              <input
                type="url"
                required
                value={formData.affiliate_link}
                onChange={(e) => setFormData(prev => ({ ...prev, affiliate_link: e.target.value }))}
                placeholder="https://example.com/product"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.expiry_date}
                onChange={(e) => setFormData(prev => ({ ...prev, expiry_date: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL (Optional)
              </label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                disabled={!!imageFile}
              />
              <div className="text-xs text-gray-500 mt-1">Must be https and end with .jpg, .jpeg, or .png</div>
            </div>
            <div className="flex items-center space-x-2">
              <label className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-semibold cursor-pointer hover:shadow-lg hover:from-emerald-600 hover:to-teal-700 transition-all">
                <span>{imageFile ? 'Change Image' : 'Upload Image'}</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0] || null
                    setImageFile(file)
                    setFormData(prev => ({ ...prev, image_url: '' }))
                    setImageFileError('')
                  }}
                  disabled={!!formData.image_url}
                />
              </label>
              {imageFile && (
                <span className="text-xs text-gray-700 truncate max-w-[120px]">{imageFile.name}</span>
              )}
            </div>
            {imageFileError && <div className="text-xs text-red-600 mt-1">{imageFileError}</div>}
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Deal'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// Edit Deal Modal Component
const EditDealModal: React.FC<{
  deal: Deal
  onClose: () => void
  onSuccess: () => void
}> = ({ deal, onClose, onSuccess }) => {
  const { user, profile } = useAuth()
  const [formData, setFormData] = useState({
    title: deal.title || '',
    description: deal.description || '',
    coupon_code: deal.coupon_code || '',
    retail_price: deal.retail_price?.toString() || '',
    current_price: deal.current_price?.toString() || '',
    category: deal.category || '',
    marketplace: deal.marketplace || '',
    affiliate_link: deal.affiliate_link || '',
    expiry_date: deal.expiry_date ? deal.expiry_date.slice(0, 16) : '',
    image_url: deal.image_url || ''
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [imageFileError, setImageFileError] = useState('')

  const categories = [
    'Electronics', 'Fashion', 'Home & Garden', 'Health & Beauty',
    'Sports & Outdoors', 'Books & Media', 'Food & Beverages',
    'Travel', 'Automotive', 'Toys & Games'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !profile) return
    setLoading(true)
    setError('')
    setImageFileError('')
    // Only one of image_url or imageFile can be used
    if (formData.image_url && imageFile) {
      setError('Please provide either an image URL or upload an image, not both.')
      setLoading(false)
      return
    }
    // Validate image URL if provided
    if (formData.image_url && !isValidImageUrl(formData.image_url)) {
      setError('Image URL must be https and end with .jpg, .jpeg, or .png')
      setLoading(false)
      return
    }
    // Validate image file if provided
    if (imageFile && !isValidImageFile(imageFile)) {
      setImageFileError('Image must be PNG/JPG/JPEG and <= 1MB')
      setLoading(false)
      return
    }
    let imageUrl = formData.image_url || null
    // If file is provided, upload to Supabase Storage
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${user.id}_${Date.now()}.${fileExt}`
      const { data, error: uploadError } = await supabase.storage.from('productimages').upload(fileName, imageFile, {
        cacheControl: '3600',
        upsert: false
      })
      if (uploadError) {
        setError('Failed to upload image')
        setLoading(false)
        return
      }
      imageUrl = data ? supabase.storage.from('productimages').getPublicUrl(fileName).data.publicUrl : null
    }
    try {
      const retailPrice = parseFloat(formData.retail_price)
      const currentPrice = parseFloat(formData.current_price)
      const discountPercentage = Math.round(((retailPrice - currentPrice) / retailPrice) * 100)
      const { error } = await supabase.from('deals').update({
        title: formData.title,
        description: formData.description,
        coupon_code: formData.coupon_code || null,
        retail_price: retailPrice,
        current_price: currentPrice,
        discount_percentage: discountPercentage,
        category: formData.category,
        marketplace: formData.marketplace,
        affiliate_link: formData.affiliate_link,
        expiry_date: formData.expiry_date,
        image_url: imageUrl,
        promoter_username: profile.username // ensure username is updated
      }).eq('id', deal.id)
      if (error) throw error
      onSuccess()
    } catch (error: any) {
      setError(error.message || 'Failed to update deal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Edit Deal</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Apple AirPods Pro (2nd Generation)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                maxLength={120}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the deal and what makes it special..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                maxLength={240}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marketplace *
                </label>
                <input
                  type="text"
                  required
                  value={formData.marketplace}
                  onChange={(e) => setFormData(prev => ({ ...prev, marketplace: e.target.value }))}
                  placeholder="e.g., Amazon, Best Buy, Nike"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Retail Price *
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={formData.retail_price}
                  onChange={(e) => setFormData(prev => ({ ...prev, retail_price: e.target.value }))}
                  placeholder="199.99"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sale Price *
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={formData.current_price}
                  onChange={(e) => setFormData(prev => ({ ...prev, current_price: e.target.value }))}
                  placeholder="149.99"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Coupon Code (Optional)
              </label>
              <input
                type="text"
                value={formData.coupon_code}
                onChange={(e) => setFormData(prev => ({ ...prev, coupon_code: e.target.value }))}
                placeholder="e.g., SAVE20"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Affiliate Link *
              </label>
              <input
                type="url"
                required
                value={formData.affiliate_link}
                onChange={(e) => setFormData(prev => ({ ...prev, affiliate_link: e.target.value }))}
                placeholder="https://example.com/product"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.expiry_date}
                onChange={(e) => setFormData(prev => ({ ...prev, expiry_date: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL (Optional)
              </label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                disabled={!!imageFile}
              />
              <div className="text-xs text-gray-500 mt-1">Must be https and end with .jpg, .jpeg, or .png</div>
            </div>
            <div className="flex items-center space-x-2">
              <label className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-semibold cursor-pointer hover:shadow-lg hover:from-emerald-600 hover:to-teal-700 transition-all">
                <span>{imageFile ? 'Change Image' : 'Upload Image'}</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0] || null
                    setImageFile(file)
                    setFormData(prev => ({ ...prev, image_url: '' }))
                    setImageFileError('')
                  }}
                  disabled={!!formData.image_url}
                />
              </label>
              {imageFile && (
                <span className="text-xs text-gray-700 truncate max-w-[120px]">{imageFile.name}</span>
              )}
            </div>
            {imageFileError && <div className="text-xs text-red-600 mt-1">{imageFileError}</div>}
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Deal'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// Comments Modal Component
const CommentsModal: React.FC<{
  dealId: string
  onClose: () => void
}> = ({ dealId, onClose }) => {
  const { user } = useAuth()
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [replyContent, setReplyContent] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [error, setError] = useState('')

  // Fetch comments for the deal
  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true)
      setError('')
      try {
        const { data: commentsData, error: commentsError } = await supabase
          .from('deal_comments')
          .select('*')
          .eq('deal_id', dealId)
          .order('created_at', { ascending: true })
        if (commentsError) throw commentsError
        // Fetch user profiles for all unique user_ids
        const userIds = Array.from(new Set((commentsData || []).map((c: any) => c.user_id)))
        let profilesMap: Record<string, any> = {}
        if (userIds.length > 0) {
          const { data: profilesData, error: profilesError } = await supabase
            .from('user_profiles')
            .select('id, username')
            .in('id', userIds)
          if (profilesError) throw profilesError
          profilesMap = Object.fromEntries((profilesData || []).map((p: any) => [p.id, p.username]))
        }
               // Attach username to each comment
        const commentsWithUsernames = (commentsData || []).map((c: any) => ({
          ...c,
          username: profilesMap[c.user_id] || c.user_id
        }))
        setComments(commentsWithUsernames)
      } catch (err: any) {
        setError(err.message || 'Failed to load comments')
      } finally {
        setLoading(false)
      }
    }
    fetchComments()
  }, [dealId])

  // Post a reply
  const handleReply = async (parentId: string | null) => {
    if (!user || !replyContent.trim()) return
    setError('')
    try {
      const { error } = await supabase.from('deal_comments').insert({
        deal_id: dealId,
        user_id: user.id,
        comment: replyContent,
        parent_id: parentId || null,
        created_at: new Date().toISOString()
      })
      if (error) throw error
      setReplyContent('')
      setReplyingTo(null)
      // Refresh comments
      const { data } = await supabase
        .from('deal_comments')
        .select('*')
        .eq('deal_id', dealId)
        .order('created_at', { ascending: true })
      setComments(data || [])
    } catch (err: any) {
      setError(err.message || 'Failed to post reply')
    }
  }

  // Helper to nest comments
  const nestComments = (comments: any[]) => {
    const map: Record<string, any> = {}
    const roots: any[] = []
    comments.forEach(c => { map[c.id] = { ...c, replies: [] } })
    comments.forEach(c => {
      if (c.parent_id && map[c.parent_id]) {
        map[c.parent_id].replies.push(map[c.id])
      } else {
        roots.push(map[c.id])
      }
    })
    return roots
  }

  const renderComments = (comments: any[], level = 0) => (
    <div>
      {comments.map(comment => (
        <div key={comment.id} className={`mb-4 ml-${level * 6}`}>
          <div className="flex items-start space-x-3">
            <img
              src={getUserAvatar(comment.user_id, comment.user_id)}
              alt="avatar"
              className="w-8 h-8 rounded-full border"
            />
            <div className="flex-1">
              <div className="bg-gray-100 rounded-lg px-4 py-2">
                <div className="text-sm text-gray-900 font-medium">{comment.username || comment.user_id}</div>
                <div className="text-gray-700 text-sm mt-1">{comment.comment}</div>
                <div className="text-xs text-gray-400 mt-1">{new Date(comment.created_at).toLocaleString()}</div>
              </div>
              <button
                className="text-emerald-600 text-xs mt-1 hover:underline"
                onClick={() => {
                  setReplyingTo(comment.id)
                  setReplyContent('')
                               }}
              >Reply</button>
              {replyingTo === comment.id && (
                <div className="mt-2 flex items-center space-x-2">
                  <input
                    type="text"
                    value={replyContent}
                    onChange={e => setReplyContent(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Write a reply..."
                  />
                  <button
                    onClick={() => handleReply(comment.id)}
                    className="px-3 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600"
                  >Send</button>
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="px-2 py-2 text-gray-400 hover:text-gray-600"
                  ><X className="h-4 w-4" /></button>
                </div>
              )}
              {comment.replies && comment.replies.length > 0 && renderComments(comment.replies, level + 1)}
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Deal Comments</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
          ) : (
            <>
              {renderComments(nestComments(comments))}
              {/* Top-level reply */}
              <div className="mt-6">
                <input
                  type="text"
                  value={replyingTo === null ? replyContent : ''}
                  onChange={e => { if (replyingTo === null) setReplyContent(e.target.value) }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Write a comment..."
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => handleReply(null)}
                    disabled={!replyContent.trim() || replyingTo !== null}
                    className="px-6 py-2 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600 disabled:opacity-50"
                  >Post Comment</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// Bulk Upload Modal Component
const BulkUploadModal: React.FC<{
  onClose: () => void
  onSuccess: () => void
}> = ({ onClose, onSuccess }) => {
  const { user, profile } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [rowErrors, setRowErrors] = useState<string[]>([])

  const requiredFields = [
    'title', 'description', 'category', 'marketplace',
    'retail_price', 'current_price', 'affiliate_link', 'expiry_date'
  ]

  // Map Excel headers to internal field names
  const headerMap: Record<string, string> = {
    'Product Name': 'title',
    'Description': 'description',
    'Category': 'category',
    'Marketplace': 'marketplace',
    'Retail Price': 'retail_price',
    'Sale Price': 'current_price',
    'Affiliate Link': 'affiliate_link',
    'Expiry Date': 'expiry_date',
    'Coupon Code': 'coupon_code',
    'Image Url': 'image_url'
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null)
    setError('')
    setSuccess('')
    setRowErrors([])
  }

  const validateRow = (row: any, idx: number) => {
    const errors: string[] = []
    requiredFields.forEach(field => {
      if (!row[field] || row[field].toString().trim() === '') {
        errors.push(`Row ${idx + 2}: Missing required field '${field}'`)
      }
    })
    // Validate price fields
    if (row.retail_price && isNaN(Number(row.retail_price))) {
      errors.push(`Row ${idx + 2}: 'retail_price' must be a number`)
    }
    if (row.current_price && (isNaN(Number(row.current_price)) || Number(row.current_price) < 0)) {
      errors.push(`Row ${idx + 2}: 'current_price' must be a non-negative number`)
    }
    // New: retail_price must be greater than current_price
    if (
      row.retail_price && row.current_price &&
      !isNaN(Number(row.retail_price)) && !isNaN(Number(row.current_price)) &&
      Number(row.retail_price) <= Number(row.current_price)
    ) {
      errors.push(`Row ${idx + 2}: 'retail_price' must be greater than 'current_price'`)
    }
    // Validate expiry_date (should be a valid date)
    if (row.expiry_date && isNaN(Date.parse(row.expiry_date))) {
      errors.push(`Row ${idx + 2}: 'expiry_date' must be a valid date`)
    }
    // Validate image_url if present
    if (row.image_url && row.image_url.trim() !== '' && !/^https:\/\/.+\.(jpg|jpeg|png)$/i.test(row.image_url)) {
      errors.push(`Row ${idx + 2}: 'image_url' must be https and end with .jpg, .jpeg, or .png`)
    }
    // Validate affiliate_link
    if (row.affiliate_link && !/^https?:\/\//.test(row.affiliate_link)) {
      errors.push(`Row ${idx + 2}: 'affiliate_link' must be a valid URL`)
    }
    return errors
  }

  const handleUpload = async () => {
    if (!file || !user || !profile) return
    setLoading(true)
    setError('')
    setSuccess('')
    setRowErrors([])
    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      let rows: any[] = XLSX.utils.sheet_to_json(sheet, { raw: false, defval: '' })
      if (!rows.length) {
        setError('No records found in the file.')
        setLoading(false)
        return
      }
      // Map headers for each row
      rows = rows.map(row => {
        const mapped: any = {}
        Object.entries(headerMap).forEach(([excelKey, fieldKey]) => {
          mapped[fieldKey] = row[excelKey] ?? ''
        })
        return mapped
      })
      const errors: string[] = []
      const validDeals: any[] = []
      rows.forEach((row, idx) => {
        const rowErrs = validateRow(row, idx)
        if (rowErrs.length) {
          errors.push(...rowErrs)
        } else {
          // Prepare deal object
          const retailPrice = parseFloat(row.retail_price)
          const currentPrice = parseFloat(row.current_price)
          const discountPercentage = Math.round(((retailPrice - currentPrice) / retailPrice) * 100)
            // Convert expiry_date to ISO string (timestamp format for Supabase)
            let expiryDateValue = row.expiry_date
            if (expiryDateValue && !/T/.test(expiryDateValue)) {
            // If only date is provided (e.g., "2024-06-01"), add time
            expiryDateValue = new Date(expiryDateValue).toISOString()
            } else if (expiryDateValue) {
            // If datetime-local format (e.g., "2024-06-01T23:59"), convert to ISO
            expiryDateValue = new Date(expiryDateValue).toISOString()
            }
            validDeals.push({
            title: row.title,
            description: row.description,
            coupon_code: row.coupon_code || null,
            retail_price: retailPrice,
            current_price: currentPrice,
            discount_percentage: discountPercentage,
            category: row.category,
            marketplace: row.marketplace,
            promoter_id: user.id,
            promoter_username: profile.username,
            affiliate_link: row.affiliate_link,
            expiry_date: expiryDateValue,
            image_url: row.image_url || null
            })
        }
      })
      if (validDeals.length) {
        const { error: insertError } = await supabase.from('deals').insert(validDeals)
        if (insertError) {
          setError('Some error occurred while inserting valid deals.')
        } else {
          setSuccess(`${validDeals.length} deals uploaded successfully!`)
        }
      }
      setRowErrors(errors)
      setLoading(false)
      if (validDeals.length) onSuccess()
    } catch (e: any) {
      setError('Failed to process the file. Please ensure it is a valid Excel file.')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Bulk Upload Deals</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="mb-4">
            <a
              href="/public/bulk_deals_template.xlsx"
              download
              className="text-emerald-600 hover:underline"
            >
              Download Excel Template
            </a>
          </div>
          <div className="mb-4 text-sm text-gray-700">
            Please use the provided template. Required columns: <b>title, description, category, marketplace, retail_price, current_price, affiliate_link, expiry_date</b>.<br/>
            Optional: coupon_code, image_url
          </div>
          <input type="file" accept=".xlsx,.xls" className="mb-4" onChange={handleFileChange} />
          {error && <div className="mb-2 text-red-600 text-sm">{error}</div>}
          {success && <div className="mb-2 text-green-600 text-sm">{success}</div>}
          {rowErrors.length > 0 && (
            <div className="mb-2 text-red-600 text-sm max-h-40 overflow-y-auto border border-red-200 rounded p-2">
              <b>Some records could not be processed:</b>
              <ul className="list-disc ml-5">
                {rowErrors.map((err, i) => <li key={i}>{err}</li>)}
              </ul>
            </div>
          )}
          <div className="flex justify-end space-x-4 mt-4">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50"
              onClick={handleUpload}
              disabled={!file || loading}
            >
              {loading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PromoterDashboard