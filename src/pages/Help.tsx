import React, { useState } from 'react'
import { Search, ChevronDown, ChevronRight, MessageCircle, Mail, Book, Users, Zap, Shield, Heart, Star } from 'lucide-react'

const Help: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)

  const categories = [
    { id: 'all', name: 'All Topics', icon: <Book className="h-4 w-4" /> },
    { id: 'getting-started', name: 'Getting Started', icon: <Zap className="h-4 w-4" /> },
    { id: 'deals', name: 'Finding Deals', icon: <Star className="h-4 w-4" /> },
    { id: 'promoters', name: 'For Promoters', icon: <Users className="h-4 w-4" /> },
    { id: 'account', name: 'Account & Settings', icon: <Shield className="h-4 w-4" /> },
    { id: 'community', name: 'Community', icon: <Heart className="h-4 w-4" /> }
  ]

  const faqs = [
    {
      id: '1',
      category: 'getting-started',
      question: 'How do I create an account on JadeDeals?',
      answer: 'Creating an account is easy! Click the "Sign Up" button in the top right corner, choose between a Shopper or promoter account, fill in your details, and you\'re ready to start discovering amazing deals. You can also sign up using Google or Facebook for faster registration.'
    },
    {
      id: '2',
      category: 'getting-started',
      question: 'What\'s the difference between Shoppers and promoters?',
      answer: 'Shoppers can browse deals, save favorites, comment, and interact with the community. Promoters can do all of that plus post their own deals, access analytics, and earn commissions through affiliate links. Both account types are completely free!'
    },
    {
      id: '3',
      category: 'deals',
      question: 'How do I find deals that match my interests?',
      answer: 'Use our search bar to look for specific products, browse by categories, or set up your profile preferences. Our algorithm will learn from your interactions and show you more relevant deals over time. You can also save deals to your favorites for easy access later.'
    },
    {
      id: '4',
      category: 'deals',
      question: 'How do I know if a deal is still valid?',
      answer: 'Each deal shows an expiration date and time remaining. We also have community verification - users can mark deals as helpful or report expired ones. If you find an expired deal, please let us know so we can update it quickly!'
    },
    {
      id: '5',
      category: 'deals',
      question: 'Can I browse deals without creating an account?',
      answer: 'Yes! You can browse and view deals without an account, but you\'ll be limited to the first 10 deals. Creating a free account unlocks unlimited browsing, saving favorites, commenting, and personalized recommendations.'
    },
    {
      id: '6',
      category: 'promoters',
      question: 'How do I become a promoter?',
      answer: 'Simply sign up for a promoter account during registration or upgrade your existing account in settings. There are no follower requirements or approval processes - if you love finding and sharing deals, you can start promoting immediately!'
    },
    {
      id: '7',
      category: 'promoters',
      question: 'How do I earn money as a promoter?',
      answer: 'Promoters earn commissions directly from retailers (like Amazon, Best Buy, Target) through affiliate programs. When someone clicks your deal and makes a purchase, you earn a commission. JadeDeals doesn\'t take any cut - you keep 100% of your earnings!'
    },
    {
      id: '8',
      category: 'promoters',
      question: 'What analytics can I see for my deals?',
      answer: 'Promoters get detailed analytics including views, clicks, saves, shares, conversion rates, and performance trends. You can track which deals perform best and optimize your strategy accordingly.'
    },
    {
      id: '9',
      category: 'account',
      question: 'How do I change my password?',
      answer: 'Go to your Profile Settings, scroll down to the security section, and click "Change Password". You\'ll need to enter your current password and choose a new one. For security, we recommend using a strong, unique password.'
    },
    {
      id: '10',
      category: 'account',
      question: 'Can I delete my account?',
      answer: 'Yes, you can delete your account anytime by contacting our support team at help@jadedeals.me. We\'ll permanently remove all your data within 30 days. Note that this action cannot be undone.'
    },
    {
      id: '11',
      category: 'community',
      question: 'How do I report inappropriate content?',
      answer: 'If you see content that violates our community guidelines, please report it by contacting help@jadedeals.me with the deal or comment link. We review all reports quickly and take appropriate action.'
    },
    {
      id: '12',
      category: 'community',
      question: 'Can I message other users directly?',
      answer: 'Currently, we don\'t have direct messaging. You can interact through comments on deals and public discussions. This helps maintain a safe, transparent community environment for everyone.'
    }
  ]

  const quickActions = [
    {
      title: 'Contact Support',
      description: 'Get help from our friendly support team',
      action: 'Email help@jadedeals.me',
      icon: <Mail className="h-6 w-6" />,
      color: 'from-blue-500 to-indigo-600'
    },
    {
      title: 'Join Community',
      description: 'Connect with other deal hunters',
      action: 'Browse Deals',
      icon: <Users className="h-6 w-6" />,
      color: 'from-emerald-500 to-teal-600'
    },
    {
      title: 'Report Issue',
      description: 'Found a bug or broken deal?',
      action: 'Report Problem',
      icon: <MessageCircle className="h-6 w-6" />,
      color: 'from-purple-500 to-pink-600'
    }
  ]

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg">
              <Book className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Help Center
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Find answers to common questions, learn how to use JadeDeals, and get the most out of our platform
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for help topics..."
              className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {quickActions.map((action, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center space-x-4">
                <div className={`p-3 bg-gradient-to-br ${action.color} rounded-lg`}>
                  <div className="text-white">
                    {action.icon}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{action.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{action.description}</p>
                  <button className="text-emerald-600 hover:text-emerald-700 font-medium text-sm">
                    {action.action} →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {category.icon}
                    <span className="font-medium">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* FAQ Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedCategory === 'all' ? 'All Questions' : categories.find(c => c.id === selectedCategory)?.name}
                </h2>
                <span className="text-sm text-gray-500">
                  {filteredFAQs.length} {filteredFAQs.length === 1 ? 'question' : 'questions'}
                </span>
              </div>

              {filteredFAQs.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your search terms or browse different categories
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm('')
                      setSelectedCategory('all')
                    }}
                    className="bg-emerald-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-600 transition-colors"
                  >
                    Show All Questions
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredFAQs.map((faq) => (
                    <div key={faq.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleFAQ(faq.id)}
                        className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 pr-4">{faq.question}</h3>
                        {expandedFAQ === faq.id ? (
                          <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-500 flex-shrink-0" />
                        )}
                      </button>
                      {expandedFAQ === faq.id && (
                        <div className="px-6 pb-6">
                          <div className="border-t border-gray-200 pt-4">
                            <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Still Need Help Section */}
        <div className="mt-16 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-8 border border-emerald-200">
          <div className="text-center max-w-2xl mx-auto">
            <MessageCircle className="h-12 w-12 text-emerald-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Still Need Help?</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Can't find what you're looking for? Our friendly support team is here to help! 
              We typically respond within 24 hours and love hearing from our community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:help@jadedeals.me"
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 inline-flex items-center justify-center space-x-2"
              >
                <Mail className="h-5 w-5" />
                <span>Contact Support</span>
              </a>
              <a
                href="/contact"
                className="border-2 border-emerald-500 text-emerald-600 px-8 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition-all duration-200"
              >
                Visit Contact Page
              </a>
            </div>
          </div>
        </div>

        {/* Popular Resources */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Popular Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <a href="/promoters" className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 text-center">
              <Users className="h-8 w-8 text-emerald-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">For Promoters</h3>
              <p className="text-gray-600 text-sm">Learn how to become a successful promoter</p>
            </a>
            <a href="/browse-deals" className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 text-center">
              <Star className="h-8 w-8 text-emerald-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Browse Deals</h3>
              <p className="text-gray-600 text-sm">Discover amazing deals from our community</p>
            </a>
            <a href="/categories" className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 text-center">
              <Book className="h-8 w-8 text-emerald-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Categories</h3>
              <p className="text-gray-600 text-sm">Shop by your favorite categories</p>
            </a>
            <a href="/profile" className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 text-center">
              <Shield className="h-8 w-8 text-emerald-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Account Settings</h3>
              <p className="text-gray-600 text-sm">Manage your profile and preferences</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Help