import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Search,
  Filter,
  BookOpen,
  Video,
  FileText,
  ExternalLink,
  ChevronRight,
  Tag,
  User,
  ThumbsUp,
  Clock3,
  Bookmark,
  MessageCircle,
  TrendingUp,
  Star,
  Award,
  Target,
  DollarSign,
  BarChart3,
  Globe,
  Smartphone,
  ShoppingBag,
  CreditCard,
  Users,
  Zap,
  CheckCircle,
  ArrowRight,
  Eye,
  Calendar,
  Heart
} from 'lucide-react'

const PromoterResources: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const categories = [
    { id: 'all', name: 'All Resources', count: 47, icon: <BookOpen className="h-4 w-4" /> },
    { id: 'getting-started', name: 'Getting Started', count: 12, icon: <Target className="h-4 w-4" /> },
    { id: 'marketplaces', name: 'Marketplace Guides', count: 15, icon: <ShoppingBag className="h-4 w-4" /> },
    { id: 'strategies', name: 'Marketing Strategies', count: 8, icon: <TrendingUp className="h-4 w-4" /> },
    { id: 'tools', name: 'Tools & Software', count: 7, icon: <Smartphone className="h-4 w-4" /> },
    { id: 'case-studies', name: 'Case Studies', count: 5, icon: <Award className="h-4 w-4" /> }
  ]

  const featuredArticles = [
    {
      id: 1,
      title: 'Complete Guide to Amazon Associates Program 2025',
      excerpt: 'Everything you need to know about starting with Amazon\'s affiliate program, from application to advanced optimization strategies.',
      author: 'Sarah Chen',
      authorRole: 'Senior Affiliate Manager',
      authorAvatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      category: 'marketplaces',
      readTime: '12 min read',
      publishDate: '2 days ago',
      likes: 156,
      comments: 23,
      bookmarks: 89,
      views: 2847,
      image: 'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
      featured: true,
      tags: ['Amazon', 'Beginner', 'Commission', 'Setup'],
      type: 'article'
    },
    {
      id: 2,
      title: 'Best Buy Affiliate Program: Hidden Gem for Tech Promoters',
      excerpt: 'Discover why Best Buy\'s affiliate program offers some of the best commissions in the electronics space with real case studies.',
      author: 'Mike Rodriguez',
      authorRole: 'Tech Affiliate Expert',
      authorAvatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      category: 'marketplaces',
      readTime: '8 min read',
      publishDate: '4 days ago',
      likes: 89,
      comments: 15,
      bookmarks: 67,
      views: 1923,
      image: 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
      featured: true,
      tags: ['Best Buy', 'Electronics', 'High Commission'],
      type: 'guide'
    }
  ]

  const articles = [
    {
      id: 3,
      title: 'Shopify Affiliate Program: Complete Setup Guide',
      excerpt: 'Step-by-step guide to joining and succeeding with Shopify\'s affiliate program, including advanced tips.',
      author: 'Emma Thompson',
      authorRole: 'E-commerce Specialist',
      authorAvatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      category: 'marketplaces',
      readTime: '10 min read',
      publishDate: '1 week ago',
      likes: 67,
      comments: 12,
      bookmarks: 45,
      views: 1456,
      image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
      tags: ['Shopify', 'E-commerce', 'Setup'],
      type: 'tutorial'
    },
    {
      id: 4,
      title: 'Target Affiliate Program: Fashion & Home Deals That Convert',
      excerpt: 'Learn how to maximize earnings with Target\'s diverse product catalog and seasonal strategies.',
      author: 'David Kim',
      authorRole: 'Lifestyle Affiliate',
      authorAvatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      category: 'marketplaces',
      readTime: '7 min read',
      publishDate: '1 week ago',
      likes: 45,
      comments: 8,
      bookmarks: 32,
      views: 987,
      image: 'https://images.pexels.com/photos/1005638/pexels-photo-1005638.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
      tags: ['Target', 'Fashion', 'Home'],
      type: 'guide'
    },
    {
      id: 5,
      title: 'Nike Affiliate Program: Sports & Lifestyle Marketing',
      excerpt: 'How to tap into Nike\'s massive brand appeal for affiliate success with authentic content strategies.',
      author: 'Lisa Park',
      authorRole: 'Sports Marketing Pro',
      authorAvatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      category: 'marketplaces',
      readTime: '9 min read',
      publishDate: '2 weeks ago',
      likes: 78,
      comments: 19,
      bookmarks: 56,
      views: 1678,
      image: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
      tags: ['Nike', 'Sports', 'Brand Marketing'],
      type: 'case-study'
    },
    {
      id: 6,
      title: 'Building Your First Affiliate Marketing Strategy',
      excerpt: 'Essential framework for creating a successful affiliate marketing plan from scratch.',
      author: 'Alex Johnson',
      authorRole: 'Strategy Consultant',
      authorAvatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      category: 'strategies',
      readTime: '15 min read',
      publishDate: '3 weeks ago',
      likes: 134,
      comments: 28,
      bookmarks: 98,
      views: 3245,
      image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
      tags: ['Strategy', 'Planning', 'Beginner'],
      type: 'guide'
    },
    {
      id: 7,
      title: 'Content Creation for Affiliate Success',
      excerpt: 'How to create compelling content that drives affiliate conversions and builds trust.',
      author: 'Rachel Green',
      authorRole: 'Content Strategist',
      authorAvatar: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      category: 'strategies',
      readTime: '11 min read',
      publishDate: '3 weeks ago',
      likes: 92,
      comments: 16,
      bookmarks: 73,
      views: 2156,
      image: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
      tags: ['Content', 'Writing', 'Conversion'],
      type: 'tutorial'
    },
    {
      id: 8,
      title: 'Walmart Affiliate Program: Mass Market Opportunities',
      excerpt: 'Explore the potential of Walmart\'s affiliate program for everyday products and bulk sales.',
      author: 'Tom Wilson',
      authorRole: 'Retail Affiliate Expert',
      authorAvatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      category: 'marketplaces',
      readTime: '6 min read',
      publishDate: '1 month ago',
      likes: 56,
      comments: 11,
      bookmarks: 34,
      views: 1234,
      image: 'https://images.pexels.com/photos/1005644/pexels-photo-1005644.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
      tags: ['Walmart', 'Mass Market', 'Everyday Products'],
      type: 'guide'
    }
  ]

  const marketplaceGuides = [
    {
      name: 'Amazon Associates',
      logo: '🛒',
      commission: '1-10%',
      difficulty: 'Beginner',
      description: 'World\'s largest marketplace with millions of products',
      pros: ['Huge product selection', 'Trusted brand', 'Good tracking'],
      cons: ['Lower commissions', 'Strict policies', 'Cookie duration: 24h'],
      color: 'from-orange-500 to-yellow-500',
      signupUrl: 'https://affiliate-program.amazon.com'
    },
    {
      name: 'Best Buy Affiliate',
      logo: '💻',
      commission: '1-4%',
      difficulty: 'Beginner',
      description: 'Leading electronics retailer with high-value products',
      pros: ['High-value items', 'Good conversion rates', 'Trusted brand'],
      cons: ['Limited to electronics', 'Seasonal fluctuations'],
      color: 'from-blue-500 to-indigo-500',
      signupUrl: 'https://www.bestbuy.com/site/affiliate-program'
    },
    {
      name: 'Target Affiliate',
      logo: '🎯',
      commission: '1-8%',
      difficulty: 'Intermediate',
      description: 'Fashion, home, and lifestyle products with broad appeal',
      pros: ['Diverse product range', 'Strong brand loyalty', 'Good commissions'],
      cons: ['Competitive space', 'Seasonal dependency'],
      color: 'from-red-500 to-pink-500',
      signupUrl: 'https://affiliates.target.com'
    },
    {
      name: 'Nike Affiliate',
      logo: '👟',
      commission: '2-11%',
      difficulty: 'Intermediate',
      description: 'Premium sports and lifestyle brand with global appeal',
      pros: ['Strong brand recognition', 'High commissions', 'Quality products'],
      cons: ['Strict content guidelines', 'High competition'],
      color: 'from-gray-700 to-black',
      signupUrl: 'https://www.nike.com/help/a/affiliate-program'
    },
    {
      name: 'Shopify Affiliate',
      logo: '🏪',
      commission: '200% of monthly fee',
      difficulty: 'Advanced',
      description: 'E-commerce platform with recurring commission potential',
      pros: ['Recurring commissions', 'High payouts', 'Growing market'],
      cons: ['Requires technical knowledge', 'Longer sales cycle'],
      color: 'from-green-500 to-emerald-500',
      signupUrl: 'https://www.shopify.com/affiliates'
    },
    {
      name: 'Walmart Affiliate',
      logo: '🏬',
      commission: '1-4%',
      difficulty: 'Beginner',
      description: 'Mass market retailer with everyday low prices',
      pros: ['Wide product range', 'Competitive prices', 'Easy approval'],
      cons: ['Lower commissions', 'High competition'],
      color: 'from-blue-600 to-blue-700',
      signupUrl: 'https://affiliates.walmart.com'
    }
  ]

  const quickStats = [
    { label: 'Total Articles', value: '47', icon: <BookOpen className="h-5 w-5" /> },
    { label: 'Active Contributors', value: '23', icon: <Users className="h-5 w-5" /> },
    { label: 'Marketplace Guides', value: '15', icon: <ShoppingBag className="h-5 w-5" /> },
    { label: 'This Month', value: '8 New', icon: <Calendar className="h-5 w-5" /> }
  ]

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />
      case 'tutorial': return <BookOpen className="h-4 w-4" />
      case 'case-study': return <Award className="h-4 w-4" />
      case 'guide': return <FileText className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-red-100 text-red-700'
      case 'tutorial': return 'bg-blue-100 text-blue-700'
      case 'case-study': return 'bg-purple-100 text-purple-700'
      case 'guide': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const filteredArticles = [...featuredArticles, ...articles].filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Promoter Resources</h1>
              <p className="text-xl text-gray-600">Your complete guide to affiliate marketing success</p>
            </div>
            <Link
              to="/promoter-dashboard"
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center space-x-2"
            >
              <BarChart3 className="h-5 w-5" />
              <span>My Dashboard</span>
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {quickStats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl p-4 border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                    {stat.icon}
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-8">
              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search resources..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Categories */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Categories
                </h3>
                <div className="space-y-2">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {category.icon}
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <span className={`text-sm px-2 py-1 rounded-full ${
                        selectedCategory === category.id
                          ? 'bg-emerald-200 text-emerald-800'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {category.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Featured Articles */}
            {selectedCategory === 'all' && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Star className="h-6 w-6 mr-2 text-yellow-500" />
                  Featured Articles
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {featuredArticles.map(article => (
                    <div key={article.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={article.image}
                          alt={article.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-6">
                        <div className="flex items-center space-x-2 mb-3">
                          <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(article.type)}`}>
                            {getTypeIcon(article.type)}
                            <span className="capitalize">{article.type}</span>
                          </span>
                          {article.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{article.title}</h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">{article.excerpt}</p>
                        
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={article.authorAvatar}
                              alt={article.author}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{article.author}</div>
                              <div className="text-xs text-gray-500">{article.authorRole}</div>
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">{article.readTime}</div>
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center space-x-1">
                              <Eye className="h-4 w-4" />
                              <span>{article.views.toLocaleString()}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <ThumbsUp className="h-4 w-4" />
                              <span>{article.likes}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <MessageCircle className="h-4 w-4" />
                              <span>{article.comments}</span>
                            </span>
                          </div>
                          <button className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center space-x-1">
                            <span>Read More</span>
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Marketplace Quick Access */}
            {selectedCategory === 'all' && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <ShoppingBag className="h-6 w-6 mr-2 text-emerald-500" />
                  Popular Marketplaces
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {marketplaceGuides.slice(0, 6).map((marketplace, index) => (
                    <div key={index} className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`text-2xl p-2 bg-gradient-to-br ${marketplace.color} rounded-lg`}>
                          {marketplace.logo}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{marketplace.name}</h3>
                          <div className="flex items-center space-x-2 text-sm">
                            <span className="text-emerald-600 font-medium">{marketplace.commission}</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-600">{marketplace.difficulty}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{marketplace.description}</p>
                      <a
                        href={marketplace.signupUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-emerald-600 hover:text-emerald-700 font-medium text-sm"
                      >
                        <span>Join Program</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Articles */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <BookOpen className="h-6 w-6 mr-2 text-blue-500" />
                {selectedCategory === 'all' ? 'Latest Articles' : `${categories.find(c => c.id === selectedCategory)?.name} Articles`}
                <span className="ml-2 text-lg text-gray-500">({filteredArticles.length})</span>
              </h2>
              
              {filteredArticles.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">No articles found matching your criteria.</p>
                  <p className="text-gray-500 mt-2">Try adjusting your search or category filter.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredArticles.map(article => (
                    <div key={article.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="md:w-1/3">
                          <div className="aspect-video overflow-hidden rounded-lg">
                            <img
                              src={article.image}
                              alt={article.title}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        </div>
                        <div className="md:w-2/3">
                          <div className="flex items-center space-x-2 mb-3">
                            <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(article.type)}`}>
                              {getTypeIcon(article.type)}
                              <span className="capitalize">{article.type}</span>
                            </span>
                            {article.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                          
                          <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-emerald-600 transition-colors cursor-pointer">
                            {article.title}
                          </h3>
                          <p className="text-gray-600 mb-4 line-clamp-2">{article.excerpt}</p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <img
                                src={article.authorAvatar}
                                alt={article.author}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                              <div>
                                <div className="text-sm font-medium text-gray-900">{article.author}</div>
                                <div className="text-xs text-gray-500">{article.authorRole}</div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center space-x-1">
                                <Eye className="h-4 w-4" />
                                <span>{article.views.toLocaleString()}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <ThumbsUp className="h-4 w-4" />
                                <span>{article.likes}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <MessageCircle className="h-4 w-4" />
                                <span>{article.comments}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Bookmark className="h-4 w-4" />
                                <span>{article.bookmarks}</span>
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center space-x-1">
                                <Clock3 className="h-4 w-4" />
                                <span>{article.readTime}</span>
                              </span>
                              <span>{article.publishDate}</span>
                            </div>
                            <button className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center space-x-1">
                              <span>Read Article</span>
                              <ArrowRight className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PromoterResources