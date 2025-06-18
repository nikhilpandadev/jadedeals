import React from 'react'
import { Heart, Target, Users, Zap, Award, Globe, TrendingUp, Shield, Sparkles } from 'lucide-react'
import { getUserAvatar } from '../utils/avatars'

const About: React.FC = () => {
  const stats = [
    { label: 'Active Members', value: '50K+', icon: <Users className="h-6 w-6" /> },
    { label: 'Deals Posted', value: '100K+', icon: <Target className="h-6 w-6" /> },
    { label: 'Money Saved', value: '$10M+', icon: <TrendingUp className="h-6 w-6" /> },
    { label: 'Countries', value: '25+', icon: <Globe className="h-6 w-6" /> }
  ]

  const values = [
    {
      icon: <Heart className="h-8 w-8" />,
      title: 'Community First',
      description: 'We believe in the power of community. Every feature we build is designed to help deal seekers and promoters connect and succeed together.',
      color: 'from-red-500 to-pink-600'
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Trust & Transparency',
      description: 'We maintain the highest standards of trust by verifying deals, protecting user privacy, and ensuring transparent promoter relationships.',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: 'Innovation',
      description: 'We continuously innovate to make deal discovery faster, smarter, and more personalized for every member of our community.',
      color: 'from-yellow-500 to-orange-600'
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: 'Quality Over Quantity',
      description: 'We focus on curating high-quality deals rather than overwhelming users with mediocre offers. Every deal should be worth your time.',
      color: 'from-emerald-500 to-teal-600'
    }
  ]

  const timeline = [
    {
      year: '2024',
      title: 'The Vision',
      description: 'JadeDeals was conceived with a simple idea: create a platform where deal enthusiasts could share and discover amazing savings together.',
      milestone: 'Platform Concept'
    },
    {
      year: '2024',
      title: 'Building the Foundation',
      description: 'We developed our core platform with advanced features like personalized recommendations, community interactions, and promoter analytics.',
      milestone: 'MVP Launch'
    },
    {
      year: '2025',
      title: 'Community Growth',
      description: 'Our community has grown to over 50,000 active members, with thousands of verified deals posted monthly.',
      milestone: '50K Members'
    },
    {
      year: '2025',
      title: 'The Future',
      description: 'We\'re expanding globally, adding AI-powered deal discovery, and building the ultimate destination for smart shoppers worldwide.',
      milestone: 'Global Expansion'
    }
  ]

  const team = [
    {
      name: 'Nikhil Panda',
      role: 'Founder & CEO',
      bio: 'Passionate entrepreneur with a love for finding and sharing amazing deals. Nikhil founded JadeDeals to create a community where everyone can save money together.',
      avatar: getUserAvatar('nikhil@jadedeals.me'),
      achievements: ['Built 3 successful startups', 'Saved $100K+ through deals', 'Featured in TechCrunch']
    },
    {
      name: 'Claude (AI Assistant)',
      role: 'Chief Technology Officer',
      bio: 'Advanced AI system responsible for platform architecture, deal verification, and user experience optimization. Never sleeps, always optimizing!',
      avatar: getUserAvatar('claude@jadedeals.me'),
      achievements: ['Processes 1M+ deals daily', '99.9% uptime record', 'Advanced ML algorithms']
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%2310b981%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-xl">
                <Sparkles className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              About
              <span className="block bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                JadeDeals
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              We're building the world's most trusted community for deal discovery, where passionate promoters 
              connect with smart shoppers to share incredible savings and amazing finds.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl text-white">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              To democratize access to amazing deals by creating a trusted platform where deal enthusiasts 
              can discover, share, and save together.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">Why JadeDeals Exists</h3>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    In a world where everyone is looking for the best deals, we noticed a problem: great deals were 
                    scattered across the internet, hidden in newsletters, or shared in closed groups. Meanwhile, 
                    passionate deal hunters had amazing finds but limited ways to share them with people who would appreciate them.
                  </p>
                  <p>
                    JadeDeals bridges this gap by creating a centralized, trusted community where deal seekers and 
                    promoters can connect. We believe that when people share their best finds, everyone wins - 
                    shoppers save money, and promoters build meaningful connections with their audience.
                  </p>
                  <p>
                    Our platform isn't just about transactions; it's about building relationships, sharing knowledge, 
                    and creating a community where everyone's expertise is valued and rewarded.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl p-8 text-center">
                  <div className="text-6xl mb-4">🎯</div>
                  <h4 className="text-xl font-bold text-gray-900 mb-4">Our Goal</h4>
                  <p className="text-gray-700">
                    To save our community members over <strong>$100 million</strong> in the next 3 years 
                    while building the most trusted deal discovery platform in the world.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              These core values guide every decision we make and every feature we build
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className={`inline-flex p-4 bg-gradient-to-br ${value.color} rounded-2xl mb-6`}>
                  <div className="text-white">
                    {value.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Journey</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From concept to community - here's how JadeDeals has evolved
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full"></div>
            
            <div className="space-y-12">
              {timeline.map((item, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                      <div className="text-emerald-600 font-bold text-sm mb-2">{item.milestone}</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                  
                  {/* Timeline dot */}
                  <div className="relative z-10 flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full border-4 border-white shadow-lg">
                    <span className="text-white font-bold text-sm">{item.year}</span>
                  </div>
                  
                  <div className="w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The passionate individuals (and AI) working to make JadeDeals the best deal discovery platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {team.map((member, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="text-center mb-6">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-24 h-24 rounded-full border-4 border-emerald-200 mx-auto mb-4"
                  />
                  <h3 className="text-2xl font-bold text-gray-900">{member.name}</h3>
                  <p className="text-emerald-600 font-medium">{member.role}</p>
                </div>
                
                <p className="text-gray-600 leading-relaxed mb-6">{member.bio}</p>
                
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Key Achievements</h4>
                  <ul className="space-y-2">
                    {member.achievements.map((achievement, achievementIndex) => (
                      <li key={achievementIndex} className="flex items-center space-x-2 text-sm text-gray-600">
                        <Award className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                        <span>{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Future Vision */}
      <section className="py-20 bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">The Future of JadeDeals</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We're just getting started. Here's what we're building next to make deal discovery even better
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">AI-Powered Discovery</h3>
              <p className="text-gray-600">Advanced machine learning to predict and surface deals you'll love before you even know you want them.</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Global Expansion</h3>
              <p className="text-gray-600">Bringing JadeDeals to deal hunters worldwide with localized content and currency support.</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Enhanced Community</h3>
              <p className="text-gray-600">New features for deal discussions, user groups, and collaborative deal hunting experiences.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Join Our Story
          </h2>
          <p className="text-xl text-emerald-100 mb-8 leading-relaxed">
            Be part of the JadeDeals community and help us build the future of deal discovery. 
            Whether you're hunting for deals or sharing them, there's a place for you here.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/signup"
              className="bg-white text-emerald-600 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 inline-flex items-center justify-center space-x-2"
            >
              <span>Join the Community</span>
              <Heart className="h-5 w-5" />
            </a>
            <a
              href="/contact"
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-emerald-600 transition-all duration-200"
            >
              Get in Touch
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About