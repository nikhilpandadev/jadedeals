import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Gem, LogOut, Search, ChevronDown, Filter, Calendar, X, Settings } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getUserAvatar } from '../utils/avatars'

const Header: React.FC = () => {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAdvancedModal, setShowAdvancedModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [timeFilter, setTimeFilter] = useState('')
  const [signingOut, setSigningOut] = useState(false)

  const categories = [
    'Electronics', 'Fashion', 'Home & Garden', 'Health & Beauty', 
    'Sports & Outdoors', 'Books & Media', 'Food & Beverages', 
    'Travel', 'Automotive', 'Toys & Games'
  ]

  const timeFilters = [
    { value: '24h', label: 'Last 24 hours' },
    { value: '72h', label: 'Last 72 hours' },
    { value: '7d', label: 'Last 7 days' }
  ]

  const handleSignOut = async () => {
    if (signingOut) return
    
    try {
      setSigningOut(true)
      setShowProfileMenu(false)
      
      await signOut()
      navigate('/', { replace: true })
      
    } catch (error) {
      console.error('Header: Error during sign out:', error)
      navigate('/', { replace: true })
    } finally {
      setSigningOut(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchTerm) params.set('search', searchTerm)
    if (selectedCategory) params.set('category', selectedCategory)
    if (timeFilter) params.set('time', timeFilter)
    
    navigate(`/browse-deals?${params.toString()}`)
    setShowAdvancedModal(false)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('')
    setTimeFilter('')
  }

  const applyFilters = () => {
    const params = new URLSearchParams()
    if (searchTerm) params.set('search', searchTerm)
    if (selectedCategory) params.set('category', selectedCategory)
    if (timeFilter) params.set('time', timeFilter)
    
    navigate(`/browse-deals?${params.toString()}`)
    setShowAdvancedModal(false)
  }

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group flex-shrink-0">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg group-hover:shadow-lg transition-all duration-200">
                <Gem className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent hidden sm:block">
                JadeDeals
              </span>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent sm:hidden">
                JD
              </span>
            </Link>

            {/* Search Bar - Only for authenticated users */}
            {user && (
              <div className="flex-1 max-w-2xl mx-4 sm:mx-8">
                <form onSubmit={handleSearch} className="relative">
                  <div className="flex items-center">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search deals..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    
                    {/* Advanced Search Button */}
                    <button
                      type="button"
                      onClick={() => setShowAdvancedModal(true)}
                      className="px-3 py-2 border-t border-b border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors"
                      title="Advanced Search"
                    >
                      <Settings className="h-4 w-4 text-gray-600" />
                    </button>
                    
                    {/* Search Button */}
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-r-lg hover:shadow-lg transition-all duration-200"
                    >
                      <span className="hidden sm:inline">Search</span>
                      <Search className="h-4 w-4 sm:hidden" />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Profile Section */}
            <div className="flex items-center space-x-2">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center space-x-2 sm:space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={signingOut}
                  >
                    <img
                      src={getUserAvatar(user.email || '', user.id)}
                      alt="Profile"
                      className="w-8 h-8 rounded-full border-2 border-emerald-200"
                    />
                    <div className="hidden sm:block text-left">
                      <div className="text-sm font-medium text-gray-900">
                        {user.email?.split('@')[0]}
                      </div>
                      {profile?.user_type === 'promoter' && (
                        <div className="text-xs text-emerald-600">Promoter</div>
                      )}
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-500 hidden sm:block" />
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      <div className="p-3 border-b border-gray-100">
                        <div className="text-sm font-medium text-gray-900">{user.email}</div>
                        <div className="text-xs text-gray-500 capitalize">{profile?.user_type} Account</div>
                      </div>
                      <div className="py-1">
                        <Link
                          to="/profile"
                          onClick={() => setShowProfileMenu(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Profile Settings
                        </Link>
                        <button
                          onClick={handleSignOut}
                          disabled={signingOut}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>{signingOut ? 'Signing Out...' : 'Sign Out'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 sm:px-6 py-2 rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 text-sm sm:text-base"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Advanced Search Modal */}
      {showAdvancedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Advanced Search</h2>
                <button
                  onClick={() => setShowAdvancedModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Search Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Terms
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Enter keywords..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Time Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Time Filter
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {timeFilters.map(filter => (
                      <button
                        key={filter.value}
                        type="button"
                        onClick={() => setTimeFilter(timeFilter === filter.value ? '' : filter.value)}
                        className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                          timeFilter === filter.value
                            ? 'bg-emerald-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Clear All
                  </button>
                  <button
                    type="button"
                    onClick={applyFilters}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Header