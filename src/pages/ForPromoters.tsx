import React from 'react'
import { Link } from 'react-router-dom'
import { 
  ArrowRight, 
  DollarSign, 
  TrendingUp, 
  Shield, 
  BarChart3, 
  Users, 
  Target, 
  Clock, 
  CreditCard, 
  Smartphone, 
  Globe, 
  Award, 
  CheckCircle, 
  Star, 
  Zap,
  Eye,
  MousePointer,
  Heart,
  Share2,
  Calendar,
  Gift,
  Sparkles,
  Search,
  ShoppingBag,
  MessageCircle,
  Link as LinkIcon,
  Store
} from 'lucide-react'

const ForPromoters: React.FC = () => {
  const steps = [
    {
      number: 1,
      title: "Sign Up & Get Started",
      description: "Create your promoter account in under 2 minutes. No follower requirements, no application process - if you love finding deals, you're in!",
      icon: <Users className="h-8 w-8 text-white" />,
      color: "from-blue-500 to-blue-600"
    },
    {
      number: 2,
      title: "Find & Post Amazing Deals",
      description: "Discover products you genuinely love and create compelling deal posts with your affiliate links from Amazon, Best Buy, Nike, and hundreds of other retailers.",
      icon: <Search className="h-8 w-8 text-white" />,
      color: "from-emerald-500 to-emerald-600"
    },
    {
      number: 3,
      title: "Connect with Deal Seekers",
      description: "Our platform connects your deals with thousands of active deal hunters looking for exactly what you're sharing.",
      icon: <Users className="h-8 w-8 text-white" />,
      color: "from-purple-500 to-purple-600"
    },
    {
      number: 4,
      title: "Earn Direct Commissions",
      description: "When people click your deals and make purchases, you earn commissions directly from the retailers - Amazon, Best Buy, Target, and more.",
      icon: <DollarSign className="h-8 w-8 text-white" />,
      color: "from-green-500 to-green-600"
    }
  ]

  const tools = [
    {
      title: "Deal Posting Platform",
      description: "Easy-to-use interface for posting your affiliate deals with product images, descriptions, and tracking links",
      icon: <ShoppingBag className="h-6 w-6 text-emerald-600" />
    },
    {
      title: "Performance Analytics",
      description: "Track views, clicks, and engagement on your deals to see what resonates with our community",
      icon: <BarChart3 className="h-6 w-6 text-emerald-600" />
    },
    {
      title: "Deal Discovery Tools",
      description: "Find trending products and seasonal deals across major retailers to share with our deal-seeking community",
      icon: <Search className="h-6 w-6 text-emerald-600" />
    },
    {
      title: "Mobile-Optimized",
      description: "Post and manage your deals on-the-go with our mobile-friendly platform designed for busy promoters",
      icon: <Smartphone className="h-6 w-6 text-emerald-600" />
    },
    {
      title: "Community Connection",
      description: "Connect with thousands of active deal hunters who are actively looking for the best offers",
      icon: <MessageCircle className="h-6 w-6 text-emerald-600" />
    },
    {
      title: "Link Management",
      description: "Organize and manage all your affiliate links from different retailers in one convenient dashboard",
      icon: <LinkIcon className="h-6 w-6 text-emerald-600" />
    }
  ]

  const benefits = [
    {
      title: "No Follower Requirements",
      description: "Start sharing deals immediately - our platform gives you access to thousands of deal seekers without needing your own audience",
      details: ["No minimum follower count", "Built-in audience of deal hunters", "Quality deals matter most", "Authentic recommendations valued"],
      icon: <Users className="h-8 w-8 text-white" />,
      color: "from-green-500 to-emerald-600"
    },
    {
      title: "Direct Retailer Commissions",
      description: "Earn commissions directly from major retailers like Amazon, Best Buy, Target, and hundreds more through their affiliate programs",
      details: ["Commissions from retailers directly", "No middleman fees", "Standard affiliate rates (3-15%)", "Multiple payment methods"],
      icon: <Store className="h-8 w-8 text-white" />,
      color: "from-blue-500 to-indigo-600"
    },
    {
      title: "Product Knowledge Focus",
      description: "Success comes from knowing products well and sharing genuine recommendations with people who are actively looking to buy",
      details: ["Knowledge-based sharing", "Authentic product insights", "Help others make informed decisions", "Build trust through expertise"],
      icon: <Target className="h-8 w-8 text-white" />,
      color: "from-purple-500 to-pink-600"
    },
    {
      title: "Free Platform & Support",
      description: "JadeDeals is completely free to use - we simply connect you with deal seekers. You keep 100% of your affiliate commissions",
      details: ["Free platform forever", "No setup or monthly fees", "Keep all your commissions", "Community support included"],
      icon: <Gift className="h-8 w-8 text-white" />,
      color: "from-orange-500 to-red-600"
    }
  ]

  const testimonials = [
    {
      name: "Maria Santos",
      role: "Stay-at-Home Mom",
      followers: "250 Facebook friends",
      earnings: "$2,400/month",
      quote: "I started sharing deals I found for my family. JadeDeals connected me with other parents looking for the same savings. Now I earn Amazon commissions that cover our groceries!",
      rating: 5,
      image: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
    },
    {
      name: "David Kim",
      role: "College Student",
      followers: "180 Instagram followers",
      earnings: "$1,800/month",
      quote: "I love tech gadgets and research everything before buying. Sharing my findings on JadeDeals helps other students save money while I earn Best Buy and Amazon commissions.",
      rating: 5,
      image: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
    },
    {
      name: "Jennifer Walsh",
      role: "Office Worker",
      followers: "420 mixed social media",
      earnings: "$3,200/month",
      quote: "I've always been good at finding deals. JadeDeals gives me a platform to share with thousands of deal hunters. The retailer commissions add up to real money!",
      rating: 5,
      image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
    }
  ]

  const stats = [
    { label: "Active Deal Seekers", value: "50K+", icon: <Users className="h-6 w-6" /> },
    { label: "Partner Retailers", value: "500+", icon: <Store className="h-6 w-6" /> },
    { label: "Deals Posted Monthly", value: "10K+", icon: <ShoppingBag className="h-6 w-6" /> },
    { label: "Platform Usage", value: "Free", icon: <Gift className="h-6 w-6" /> }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%2310b981%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-xl">
                <ShoppingBag className="h-12 w-12 text-white" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              Love Finding Deals?
              <span className="block bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Connect & Earn
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              Turn your passion for discovering amazing deals into real income. Share deals with our community of 50,000+ active deal seekers and earn commissions directly from retailers.
            </p>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 max-w-3xl mx-auto mb-10 border border-emerald-200">
              <h3 className="text-lg font-bold text-gray-900 mb-3">How JadeDeals Works</h3>
              <p className="text-gray-700 leading-relaxed">
                <strong>JadeDeals is a free connection platform.</strong> You post deals with your affiliate links from retailers like Amazon, Best Buy, Target, etc. 
                Our community of deal seekers discovers your posts. When they make purchases, <strong>you earn commissions directly from the retailers</strong> - not from us. 
                We simply connect great deals with people who want them.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link
                to="/signup"
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center space-x-2"
              >
                <span>Start Sharing Deals</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <div className="text-sm text-gray-600 flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span>Free platform • Keep 100% of commissions • 50K+ deal seekers</span>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-2 text-emerald-600">
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Connect your deals with thousands of active deal seekers in 4 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className={`inline-flex p-4 bg-gradient-to-br ${step.color} rounded-2xl mb-6 shadow-lg`}>
                  {step.icon}
                </div>
                <div className="text-sm font-bold text-emerald-600 mb-2">STEP {step.number}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Share Deals
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our free platform provides all the tools to connect your deals with thousands of active deal seekers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tools.map((tool, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    {tool.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{tool.title}</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">{tool.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose JadeDeals
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A free platform that connects deal lovers with deal seekers - everyone wins
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center space-x-4 mb-6">
                  <div className={`p-3 bg-gradient-to-br ${benefit.color} rounded-xl shadow-lg`}>
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{benefit.title}</h3>
                    <p className="text-gray-600">{benefit.description}</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {benefit.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                      <span className="text-gray-700">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Real Promoters, Real Results
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Meet everyday people earning real commissions by sharing deals on our platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <div className="flex items-center space-x-4 mb-6">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                    <p className="text-xs text-emerald-600 font-medium">JadeDeals Promoter</p>
                    <div className="flex items-center space-x-1 mt-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                <blockquote className="text-gray-700 leading-relaxed mb-4">
                  "{testimonial.quote}"
                </blockquote>
                <div className="bg-emerald-100 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-emerald-600">{testimonial.earnings}</div>
                  <div className="text-sm text-emerald-700">Retailer Commissions</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commission Structure Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-12 text-white text-center">
            <h2 className="text-4xl font-bold mb-6">How You Earn</h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Earn commissions directly from major retailers when people purchase through your shared deals
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                <Store className="h-12 w-12 mx-auto mb-4 text-white" />
                <div className="text-xl font-bold mb-2">Amazon</div>
                <div className="text-emerald-100 mb-2">1-10% Commission</div>
                <div className="text-sm opacity-80">Electronics, Books, Home</div>
              </div>
              <div className="bg-white/20 rounded-xl p-6 backdrop-blur-sm border-2 border-white/30">
                <Store className="h-12 w-12 mx-auto mb-4 text-white" />
                <div className="text-xl font-bold mb-2">Best Buy</div>
                <div className="text-emerald-100 mb-2">1-4% Commission</div>
                <div className="text-sm opacity-80">Electronics, Appliances</div>
              </div>
              <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                <Store className="h-12 w-12 mx-auto mb-4 text-white" />
                <div className="text-xl font-bold mb-2">Target</div>
                <div className="text-emerald-100 mb-2">1-8% Commission</div>
                <div className="text-sm opacity-80">Fashion, Home, Beauty</div>
              </div>
            </div>
            
            <p className="text-emerald-100 text-sm mb-8">
              * Commission rates vary by retailer and product category. You earn directly from retailers, not from JadeDeals.
            </p>
            
            <Link
              to="/signup"
              className="bg-white text-emerald-600 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 inline-flex items-center space-x-2"
            >
              <span>Start Earning Commissions</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-3">How does JadeDeals make money if it's free?</h3>
              <p className="text-gray-600">JadeDeals is a community-driven platform. We don't take any commission from your earnings. Our goal is to create the best marketplace for deal sharing. We may introduce optional premium features in the future, but the core platform will always be free.</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Do I need to have my own affiliate accounts with retailers?</h3>
              <p className="text-gray-600">Yes, you'll need to sign up for affiliate programs with retailers like Amazon Associates, Best Buy Affiliate Program, etc. This is free and gives you access to their affiliate links. JadeDeals helps you share these deals with our community of deal seekers.</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-3">How do I get paid?</h3>
              <p className="text-gray-600">You get paid directly by the retailers (Amazon, Best Buy, Target, etc.) according to their payment schedules. Most pay monthly via direct deposit, PayPal, or check. JadeDeals doesn't handle payments - we just connect your deals with buyers.</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-3">What if I don't have a large social media following?</h3>
              <p className="text-gray-600">Perfect! That's exactly who JadeDeals is for. Our platform gives you access to 50,000+ active deal seekers, so you don't need your own audience. Focus on finding great deals and sharing authentic recommendations - our community will discover them.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Connect & Earn?
          </h2>
          <p className="text-xl text-emerald-100 mb-8 leading-relaxed">
            Join our free platform and start connecting your amazing deals with thousands of active deal seekers. 
            Earn commissions directly from retailers while helping others save money.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link
              to="/signup"
              className="bg-white text-emerald-600 px-10 py-4 rounded-xl font-bold text-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center space-x-2"
            >
              <span>Start Sharing Deals</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <div className="text-emerald-100 text-sm">
              Free forever • Keep 100% of commissions • 50K+ deal seekers waiting
            </div>
          </div>

          <div className="grid grid-cols-3 gap-8 max-w-md mx-auto text-center">
            <div>
              <div className="text-2xl font-bold text-white">Free</div>
              <div className="text-emerald-100 text-sm">Platform</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">100%</div>
              <div className="text-emerald-100 text-sm">Your Commissions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">50K+</div>
              <div className="text-emerald-100 text-sm">Deal Seekers</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ForPromoters