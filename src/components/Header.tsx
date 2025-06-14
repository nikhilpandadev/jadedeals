import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Gem, User, LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const Header: React.FC = () => {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    console.log('Sign out button clicked')
    try {
      await signOut()
      console.log('Sign out completed, navigating to home')
      // Navigate to home page after successful sign out
      navigate('/', { replace: true })
    } catch (error) {
      console.error('Error during sign out:', error)
      // Force navigation to home even if there's an error
      navigate('/', { replace: true })
    }
  }

  const handleProtectedNavigation = (path: string) => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: path } } })
    } else {
      navigate(path)
    }
    // Close mobile menu after navigation
    setMobileMenuOpen(false)
  }

  const getDashboardPath = () => {
    if (!profile) return '/dashboard'
    return profile.user_type === 'promoter' ? '/promoter-resources' : '/dashboard'
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg group-hover:shadow-lg transition-all duration-200">
              <Gem className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              JadeDeals
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {!user ? (
              // Non-authenticated users: Browse Deals, For Promoters
              <>
                <Link
                  to="/browse-deals"
                  className="text-gray-700 hover:text-emerald-600 font-medium transition-colors"
                >
                  Browse Deals
                </Link>
                <Link 
                  to="/promoters" 
                  className="text-gray-700 hover:text-emerald-600 font-medium transition-colors"
                >
                  For Promoters
                </Link>
              </>
            ) : profile?.user_type === 'regular' ? (
              // Regular users: Browse Deals, Categories
              <>
                <Link
                  to="/browse-deals"
                  className="text-gray-700 hover:text-emerald-600 font-medium transition-colors"
                >
                  Browse Deals
                </Link>
                <Link
                  to="/categories"
                  className="text-gray-700 hover:text-emerald-600 font-medium transition-colors"
                >
                  Categories
                </Link>
              </>
            ) : (
              // Promoters: My Dashboard, Promoter Resources
              <>
                <Link
                  to="/promoter-dashboard"
                  className="text-gray-700 hover:text-emerald-600 font-medium transition-colors"
                >
                  My Dashboard
                </Link>
                <Link 
                  to="/promoter-resources" 
                  className="text-gray-700 hover:text-emerald-600 font-medium transition-colors"
                >
                  Promoter Resources
                </Link>
              </>
            )}
          </nav>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <Link
                  to={getDashboardPath()}
                  className="flex items-center space-x-2 text-gray-700 hover:text-emerald-600 transition-colors"
                >
                  <User className="h-5 w-5" />
                  <span className="font-medium">
                    {user.email?.split('@')[0]}
                    {profile?.user_type === 'promoter' && (
                      <span className="ml-1 text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        Promoter
                      </span>
                    )}
                  </span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50"
                  type="button"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
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

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-emerald-600 transition-colors p-2"
              type="button"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4">
            <div className="flex flex-col space-y-4">
              {/* Mobile Navigation Links */}
              {!user ? (
                // Non-authenticated users: Browse Deals, For Promoters
                <>
                  <Link
                    to="/browse-deals"
                    onClick={closeMobileMenu}
                    className="text-gray-700 hover:text-emerald-600 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-gray-50"
                  >
                    Browse Deals
                  </Link>
                  <Link 
                    to="/promoters"
                    onClick={closeMobileMenu}
                    className="text-gray-700 hover:text-emerald-600 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-gray-50"
                  >
                    For Promoters
                  </Link>
                </>
              ) : profile?.user_type === 'regular' ? (
                // Regular users: Browse Deals, Categories
                <>
                  <Link
                    to="/browse-deals"
                    onClick={closeMobileMenu}
                    className="text-gray-700 hover:text-emerald-600 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-gray-50"
                  >
                    Browse Deals
                  </Link>
                  <Link
                    to="/categories"
                    onClick={closeMobileMenu}
                    className="text-gray-700 hover:text-emerald-600 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-gray-50"
                  >
                    Categories
                  </Link>
                </>
              ) : (
                // Promoters: My Dashboard, Promoter Resources
                <>
                  <Link
                    to="/promoter-dashboard"
                    onClick={closeMobileMenu}
                    className="text-gray-700 hover:text-emerald-600 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-gray-50"
                  >
                    My Dashboard
                  </Link>
                  <Link 
                    to="/promoter-resources"
                    onClick={closeMobileMenu}
                    className="text-gray-700 hover:text-emerald-600 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-gray-50"
                  >
                    Promoter Resources
                  </Link>
                </>
              )}

              {/* Mobile Auth Section */}
              <div className="border-t border-gray-100 pt-4 mt-4">
                {user ? (
                  <div className="space-y-3">
                    <Link
                      to={getDashboardPath()}
                      onClick={closeMobileMenu}
                      className="flex items-center space-x-2 text-gray-700 hover:text-emerald-600 transition-colors px-4 py-2 rounded-lg hover:bg-gray-50"
                    >
                      <User className="h-5 w-5" />
                      <span className="font-medium">
                        {user.email?.split('@')[0]}
                        {profile?.user_type === 'promoter' && (
                          <span className="ml-1 text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                            Promoter
                          </span>
                        )}
                      </span>
                    </Link>
                    <button
                      onClick={() => {
                        handleSignOut()
                        closeMobileMenu()
                      }}
                      className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors px-4 py-2 rounded-lg hover:bg-gray-50 w-full text-left"
                      type="button"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="px-4">
                    <Link
                      to="/login"
                      onClick={closeMobileMenu}
                      className="block w-full text-center bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      onClick={closeMobileMenu}
                      className="block w-full text-center text-gray-700 hover:text-emerald-600 font-medium transition-colors mt-3 px-6 py-2"
                    >
                      New to JadeDeals? Join Now
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header