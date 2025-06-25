import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Gem, LogOut, ChevronDown } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getUserAvatar } from '../utils/avatars'

interface HeaderPromoterProps {
  showSearchBar?: boolean;
}

const HeaderPromoter: React.FC<HeaderPromoterProps> = ({ showSearchBar = true }) => {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

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

            {/* Search bar */}
            {showSearchBar && (
              <div className="flex-1 max-w-lg mx-4">
                {/* Insert search bar code here if you have one for promoters */}
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
    </>
  )
}

export default HeaderPromoter