import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Gem, LogOut, Search, ChevronDown, Filter, Calendar } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const Header: React.FC = () => {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [timeFilter, setTimeFilter] = useState('')
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)
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

  // Generate random avatar based on user email
  const getRandomAvatar = (email: string) => {
    const avatars = [
      'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    ]
    const hash = email.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
    return avatars[hash % avatars.length]
  }

  const handleSignOut = async () => {
    if (signingOut) return // Prevent multiple clicks
    
    try {
      setSigningOut(true)
      setShowProfileMenu(false)
      
      console.log('Header: Starting sign out process...')
      
      // Call the sign out function
      await signOut()
      
      console.log('Header: Sign out completed, navigating to landing page...')
      
      // Navigate to landing page with replace to prevent back navigation
      navigate('/', { replace: true })
      
    } catch (error) {
      console.error('Header: Error during sign out:', error)
      // Even if there's an error, navigate to landing page
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
    setShowCategoryDropdown(false)
    setShowAdvancedSearch(false)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('')
    setTimeFilter('')
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg group-hover:shadow-lg transition-all duration-200">
              <Gem className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              JadeDeals
            </span>
          </Link>

          {/* Search Bar - Only for authenticated users */}
          {user && (
            <div className="flex-1 max-w-2xl mx-8">
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
                  
                  {/* Category Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                      className="px-4 py-2 border-t border-b border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center space-x-2"
                    >
                      <span className="text-sm text-gray-700">
                        {selectedCategory || 'All Categories'}
                      </span>
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    </button>
                    
                    {showCategoryDropdown && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCategory('')
                            setShowCategoryDropdown(false)
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
                        >
                          All Categories
                        </button>
                        {categories.map(category => (
                          <button
                            key={category}
                            type="button"
                            onClick={() => {
                              setSelectedCategory(category)
                              setShowCategoryDropdown(false)
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Advanced Search Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                    className={`px-3 py-2 border-t border-b border-gray-300 transition-colors ${
                      showAdvancedSearch ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <Filter className="h-4 w-4" />
                  </button>
                  
                  {/* Search Button */}
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-r-lg hover:shadow-lg transition-all duration-200"
                  >
                    Search
                  </button>
                </div>
                
                {/* Advanced Search Options */}
                {showAdvancedSearch && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-lg shadow-lg z-50 p-4 mt-1">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700">Time:</span>
                      </div>
                      <div className="flex space-x-2">
                        {timeFilters.map(filter => (
                          <button
                            key={filter.value}
                            type="button"
                            onClick={() => setTimeFilter(timeFilter === filter.value ? '' : filter.value)}
                            className={`px-3 py-1 rounded-full text-sm transition-colors ${
                              timeFilter === filter.value
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {filter.label}
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        Clear all
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* Profile Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={signingOut}
                >
                  <img
                    src={getRandomAvatar(user.email || '')}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover border-2 border-emerald-200"
                  />
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium text-gray-900">
                      {user.email?.split('@')[0]}
                    </div>
                    {profile?.user_type === 'promoter' && (
                      <div className="text-xs text-emerald-600">Promoter</div>
                    )}
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
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
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header