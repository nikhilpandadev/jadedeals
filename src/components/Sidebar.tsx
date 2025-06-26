import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Menu, 
  X, 
  Search, 
  Grid3X3, 
  Heart, 
  BarChart3, 
  BookOpen,
  Home,
  ChevronRight
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const Sidebar: React.FC = () => {
  const { user, profile } = useAuth()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)

  if (!user) return null

  const ShopperUserMenuItems = [
    { 
      name: 'Browse Deals', 
      path: '/browse-deals', 
      icon: <Search className="h-5 w-5" />,
      description: 'Discover amazing deals'
    },
    { 
      name: 'Categories', 
      path: '/categories', 
      icon: <Grid3X3 className="h-5 w-5" />,
      description: 'Shop by category'
    },
    { 
      name: 'Saved Deals', 
      path: '/saved-deals', 
      icon: <Heart className="h-5 w-5" />,
      description: 'Your saved favorites'
    }
  ]

  const promoterMenuItems = [
    { 
      name: 'My Dashboard', 
      path: '/promoter-dashboard', 
      icon: <BarChart3 className="h-5 w-5" />,
      description: 'Analytics & deals'
    },
    { 
      name: 'Resources', 
      path: '/promoter-resources', 
      icon: <BookOpen className="h-5 w-5" />,
      description: 'Guides & tutorials'
    }
  ]

  const menuItems = profile?.user_type === 'promoter' ? promoterMenuItems : ShopperUserMenuItems

  const isActivePath = (path: string) => {
    return location.pathname === path
  }

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          {profile?.user_type === 'promoter' ? 'Promoter Tools' : 'Shopping Tools'}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`group flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                  isActivePath(item.path)
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-emerald-600'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`${
                    isActivePath(item.path) ? 'text-white' : 'text-gray-500 group-hover:text-emerald-600'
                  }`}>
                    {item.icon}
                  </div>
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className={`text-xs ${
                      isActivePath(item.path) ? 'text-emerald-100' : 'text-gray-500'
                    }`}>
                      {item.description}
                    </div>
                  </div>
                </div>
                <ChevronRight className={`h-4 w-4 transition-transform ${
                  isActivePath(item.path) ? 'text-white' : 'text-gray-400 group-hover:text-emerald-600'
                }`} />
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg">
              <Home className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">
                {profile?.user_type === 'promoter' ? 'Boost Your Sales' : 'Happy Shopping!'}
              </div>
              <div className="text-xs text-gray-600">
                {profile?.user_type === 'promoter' 
                  ? 'Create compelling deals' 
                  : 'Find amazing deals daily'
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-20 left-4 z-50 p-3 bg-white rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200"
      >
        <Menu className="h-5 w-5 text-gray-700" />
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <SidebarContent />
      </div>
    </>
  )
}

export default Sidebar