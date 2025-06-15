import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Users, TrendingUp, Shield, Star, Zap, Target } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, Deal } from '../lib/supabase'
import { getUserAvatar } from '../utils/avatars'
import Carousel from '../components/Carousel'

const Landing: React.FC = () => {
  const { user, loading } = useAuth()
  const [featuredDeals, setFeaturedDeals] = useState<Deal[]>([])
  const [carouselLoading, setCarouselLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedDeals()
  }, [])

  const fetchFeaturedDeals = async () => {
    try {
      setCarouselLoading(true)
      
      // First, try to get unexpired deals
      const { data: unexpiredDeals, error: unexpiredError } = await supabase
        .from('deals')
        .select(`
          *,
          interactions:deal_interactions(is_helpful, has_used)
        `)
        .gt('expiry_date', new Date().toISOString()) // Only unexpired deals
        .order('created_at', { ascending: false })
        .limit(8)

      if (unexpiredError) {
        console.error('Error fetching unexpired deals:', unexpiredError)
        throw unexpiredError
      }

      let dealsToUse = unexpiredDeals || []

      // If we don't have enough unexpired deals (less than 4), fetch some expired ones to fill the gap
      if (dealsToUse.length < 4) {
        const { data: expiredDeals, error: expiredError } = await supabase
          .from('deals')
          .select(`
            *,
            interactions:deal_interactions(is_helpful, has_used)
          `)
          .lt('expiry_date', new Date().toISOString()) // Only expired deals
          .order('created_at', { ascending: false })
          .limit(8 - dealsToUse.length) // Fill the remaining slots

        if (expiredError) {
          console.error('Error fetching expired deals:', expiredError)
          // Don't throw here, just continue with unexpired deals
        } else {
          // Combine unexpired and expired deals, with unexpired first
          dealsToUse = [...dealsToUse, ...(expiredDeals || [])]
        }
      }

      // Fetch promoter profiles
      const dealIds = dealsToUse?.map(deal => deal.promoter_id).filter(Boolean) || []
      let promoterProfiles = []
      
      if (dealIds.length > 0) {
        const { data: profiles, error: profileError } = await supabase
          .from('user_profiles')
          .select('id, email')
          .in('id', dealIds)

        if (profileError) {
          console.error('Error fetching promoter profiles:', profileError)
        } else {
          promoterProfiles = profiles || []
        }
      }

      const processedDeals = dealsToUse?.map(deal => ({
        ...deal,
        helpful_count: deal.interactions?.filter(i => i.is_helpful === true).length || 0,
        not_helpful_count: deal.interactions?.filter(i => i.is_helpful === false).length || 0,
        promoter: {
          email: promoterProfiles?.find(p => p.id === deal.promoter_id)?.email || 'Unknown'
        }
      })) || []

      // Randomly select 4 deals for the carousel (prioritizing unexpired)
      const shuffled = processedDeals.sort(() => 0.5 - Math.random())
      setFeaturedDeals(shuffled.slice(0, 4))
    } catch (error) {
      console.error('Error fetching featured deals:', error)
      // Set empty array on error to stop loading
      setFeaturedDeals([])
    } finally {
      // Always set loading to false, regardless of success or failure
      setCarouselLoading(false)
    }
  }

  // Convert deals to carousel items format
  const carouselItems = featuredDeals.map(deal => ({
    id: deal.id,
    type: 'deal' as const,
    title: deal.title,
    description: deal.description,
    discount: `${deal.discount_percentage}%`,
    price: `$${deal.current_price.toFixed(2)}`,
    originalPrice: `$${deal.retail_price.toFixed(2)}`,
    category: deal.category
  }))

  // Add some testimonials between deals
  const testimonials = [
    {
      id: 'testimonial-1',
      type: 'testimonial' as const,
      title: 'Customer Review',
      description: 'JadeDeals has saved me over $500 this month alone! The community is amazing and the deals are always legitimate.',
      author: 'Sarah Johnson',
      rating: 5
    },
    {
      id: 'testimonial-2',
      type: 'testimonial' as const,
      title: 'Community Feedback',
      description: 'As a promoter, JadeDeals has helped me reach thousands of customers. The platform is user-friendly and effective.',
      author: 'Mike Chen',
      rating: 5
    }
  ]

  // Interleave deals and testimonials for a dynamic carousel
  const mixedCarouselItems = []
  const maxItems = Math.max(carouselItems.length, testimonials.length)
  
  for (let i = 0; i < maxItems; i++) {
    if (carouselItems[i]) mixedCarouselItems.push(carouselItems[i])
    if (testimonials[i]) mixedCarouselItems.push(testimonials[i])
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%2310b981%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              Discover Amazing
              <span className="block bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Deals Together
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Join JadeDeals - where smart shoppers discover incredible savings and passionate promoters share their best finds. 
              Whether you're hunting for deals or sharing them, our community connects you with like-minded people who love great value.
            </p>
            
            {/* Show different CTAs based on authentication status */}
            {loading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
              </div>
            ) : user ? (
              // Authenticated user - show dashboard and browse deals
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  to="/dashboard"
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center space-x-2"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  to="/browse-deals"
                  className="border-2 border-emerald-500 text-emerald-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-emerald-50 transition-all duration-300"
                >
                  Browse All Deals
                </Link>
              </div>
            ) : (
              // Non-authenticated user - show signup and browse deals
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  to="/signup"
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center space-x-2"
                >
                  <span>Join the Community</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  to="/browse-deals"
                  className="border-2 border-emerald-500 text-emerald-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-emerald-50 transition-all duration-300"
                >
                  Browse Deals
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Deals & Testimonials Carousel */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Featured Deals & Community Love
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our hottest deals and see what our community members are saying
            </p>
          </div>
          
          {carouselLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading featured deals...</p>
              </div>
            </div>
          ) : mixedCarouselItems.length > 0 ? (
            <Carousel 
              items={mixedCarouselItems}
              autoPlay={true}
              autoPlayInterval={6000}
              showDots={true}
              className="max-w-4xl mx-auto"
            />
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-600 text-lg">No featured deals available at the moment.</p>
              <Link
                to="/browse-deals"
                className="inline-block mt-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
              >
                Browse All Deals
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose JadeDeals?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We've built the perfect platform to connect deal enthusiasts with trusted promoters
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Trusted Community</h3>
              <p className="text-gray-600 leading-relaxed">
                Connect with verified promoters and fellow deal hunters in a safe, trusted environment designed for smart shoppers.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Exclusive Deals</h3>
              <p className="text-gray-600 leading-relaxed">
                Access exclusive offers and limited-time deals curated by our network of trusted promoters and affiliates.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Secure & Safe</h3>
              <p className="text-gray-600 leading-relaxed">
                Shop with confidence knowing all deals are verified and promoters are thoroughly vetted for your security.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-emerald-100">Active Members</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-emerald-100">Deals Posted</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">$2M+</div>
              <div className="text-emerald-100">Money Saved</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-emerald-100">Trusted Promoters</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How JadeDeals Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Getting started is simple - join, discover, and save!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Sign Up & Set Preferences</h3>
              <p className="text-gray-600">
                Create your account and tell us about your shopping preferences, budget, and interests.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Discover Personalized Deals</h3>
              <p className="text-gray-600">
                Browse curated deals tailored to your preferences from our network of trusted promoters.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Save & Share</h3>
              <p className="text-gray-600">
                Enjoy exclusive savings and share great deals with the community to help others save too.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Only show for non-authenticated users */}
      {!loading && !user && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Ready to Start Saving?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of smart shoppers who are already saving money with JadeDeals
            </p>
            <Link
              to="/signup"
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-10 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 inline-flex items-center space-x-2"
            >
              <span>Get Started Today</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}

export default Landing