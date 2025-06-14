import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  Smartphone, 
  Shirt, 
  Home, 
  Heart, 
  Dumbbell, 
  BookOpen, 
  Coffee, 
  Plane, 
  Car, 
  Gamepad2,
  ArrowRight,
  Sparkles,
  AlertCircle
} from 'lucide-react'
import { Link } from 'react-router-dom'

const Categories: React.FC = () => {
  const navigate = useNavigate()
  const { profile } = useAuth()

  const categories = [
    {
      name: 'Electronics',
      icon: Smartphone,
      description: 'Gadgets, phones, computers & tech accessories',
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'from-blue-50 to-indigo-50',
      borderColor: 'border-blue-200'
    },
    {
      name: 'Fashion',
      icon: Shirt,
      description: 'Clothing, shoes, accessories & style essentials',
      color: 'from-pink-500 to-rose-600',
      bgColor: 'from-pink-50 to-rose-50',
      borderColor: 'border-pink-200'
    },
    {
      name: 'Home & Garden',
      icon: Home,
      description: 'Furniture, decor, appliances & outdoor gear',
      color: 'from-green-500 to-emerald-600',
      bgColor: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-200'
    },
    {
      name: 'Health & Beauty',
      icon: Heart,
      description: 'Skincare, makeup, wellness & personal care',
      color: 'from-purple-500 to-violet-600',
      bgColor: 'from-purple-50 to-violet-50',
      borderColor: 'border-purple-200'
    },
    {
      name: 'Sports & Outdoors',
      icon: Dumbbell,
      description: 'Fitness gear, outdoor equipment & activewear',
      color: 'from-orange-500 to-red-600',
      bgColor: 'from-orange-50 to-red-50',
      borderColor: 'border-orange-200'
    },
    {
      name: 'Books & Media',
      icon: BookOpen,
      description: 'Books, e-readers, movies & entertainment',
      color: 'from-amber-500 to-yellow-600',
      bgColor: 'from-amber-50 to-yellow-50',
      borderColor: 'border-amber-200'
    },
    {
      name: 'Food & Beverages',
      icon: Coffee,
      description: 'Gourmet foods, drinks & kitchen essentials',
      color: 'from-brown-500 to-amber-600',
      bgColor: 'from-amber-50 to-orange-50',
      borderColor: 'border-amber-200'
    },
    {
      name: 'Travel',
      icon: Plane,
      description: 'Luggage, travel gear & vacation essentials',
      color: 'from-cyan-500 to-blue-600',
      bgColor: 'from-cyan-50 to-blue-50',
      borderColor: 'border-cyan-200'
    },
    {
      name: 'Automotive',
      icon: Car,
      description: 'Car accessories, tools & automotive gear',
      color: 'from-gray-500 to-slate-600',
      bgColor: 'from-gray-50 to-slate-50',
      borderColor: 'border-gray-200'
    },
    {
      name: 'Toys & Games',
      icon: Gamepad2,
      description: 'Toys, games, puzzles & entertainment for all ages',
      color: 'from-teal-500 to-cyan-600',
      bgColor: 'from-teal-50 to-cyan-50',
      borderColor: 'border-teal-200'
    }
  ]

  const handleCategoryClick = (categoryName: string) => {
    // Redirect promoters to their dashboard instead of browse deals
    if (profile?.user_type === 'promoter') {
      navigate('/promoter-dashboard')
      return
    }
    navigate(`/browse-deals?category=${encodeURIComponent(categoryName)}`)
  }

  // Show access denied for promoters
  if (profile?.user_type === 'promoter') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <AlertCircle className="h-16 w-16 text-orange-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Restricted</h1>
          <p className="text-gray-600 mb-6 leading-relaxed">
            As a promoter, you have access to your own dashboard to manage your deals. 
            Category browsing is restricted to maintain platform integrity.
          </p>
          <div className="space-y-3">
            <Link
              to="/promoter-dashboard"
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 block"
            >
              Go to My Dashboard
            </Link>
            <Link
              to="/promoters"
              className="border-2 border-emerald-500 text-emerald-600 px-6 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition-all duration-200 block"
            >
              Promoter Resources
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg">
              <Sparkles className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Explore Deal Categories
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover amazing deals organized by category. From electronics to fashion, 
            find exactly what you're looking for with exclusive offers from trusted promoters.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {categories.map((category) => {
            const IconComponent = category.icon
            return (
              <button
                key={category.name}
                onClick={() => handleCategoryClick(category.name)}
                className={`group relative bg-gradient-to-br ${category.bgColor} border-2 ${category.borderColor} rounded-2xl p-6 hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 text-left overflow-hidden`}
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23000%22%20fill-opacity%3D%220.02%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <div className={`inline-flex p-3 bg-gradient-to-br ${category.color} rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  
                  {/* Category Name */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-800 transition-colors">
                    {category.name}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-gray-600 text-sm leading-relaxed mb-4 group-hover:text-gray-700 transition-colors">
                    {category.description}
                  </p>
                  
                  {/* Arrow */}
                  <div className="flex items-center text-gray-500 group-hover:text-gray-700 transition-colors">
                    <span className="text-sm font-medium mr-2">Browse deals</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>

                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl"></div>
              </button>
            )
          })}
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-8 border border-emerald-200">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Can't Find What You're Looking For?
            </h2>
            <p className="text-gray-600 mb-6">
              Browse all our deals or use our search feature to find exactly what you need. 
              New deals are added daily by our community of trusted promoters.
            </p>
            <button
              onClick={() => navigate('/browse-deals')}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 inline-flex items-center space-x-2"
            >
              <span>Browse All Deals</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Categories