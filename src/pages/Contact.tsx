import React, { useState } from 'react'
import { Mail, MapPin, Phone, Send, MessageCircle, Coffee, Zap, Heart, CheckCircle } from 'lucide-react'
import { getUserAvatar } from '../utils/avatars'

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setLoading(false)
    setSubmitted(true)
  }

  const teamMembers = [
    {
      name: 'Nikhil Panda',
      role: 'Founder & CEO',
      email: 'nikhil@jadedeals.me',
      bio: 'Passionate about connecting deal seekers with amazing savings. When not building JadeDeals, you can find me hunting for the next great deal!',
      avatar: getUserAvatar('nikhil@jadedeals.me'),
      funFact: '🎯 Has saved over $50,000 using deals in the last 5 years'
    },
    {
      name: 'Claude (AI Assistant)',
      role: 'Chief Technology Officer',
      email: 'claude@jadedeals.me',
      bio: 'I help build and maintain the technical infrastructure that powers JadeDeals. I process millions of deals daily and never sleep!',
      avatar: getUserAvatar('claude@jadedeals.me'),
      funFact: '🤖 Can analyze 10,000 deals per second (but still can\'t figure out why humans need so many shoes)'
    }
  ]

  const contactMethods = [
    {
      icon: <Mail className="h-6 w-6" />,
      title: 'Email Support',
      description: 'Get help with your account, deals, or general questions',
      contact: 'help@jadedeals.me',
      responseTime: 'Usually within 24 hours',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: 'General Inquiries',
      description: 'Business partnerships, media inquiries, or feedback',
      contact: 'hello@jadedeals.me',
      responseTime: 'Usually within 48 hours',
      color: 'from-emerald-500 to-teal-600'
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: 'Technical Issues',
      description: 'Report bugs, technical problems, or feature requests',
      contact: 'tech@jadedeals.me',
      responseTime: 'Usually within 12 hours',
      color: 'from-purple-500 to-pink-600'
    }
  ]

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Message Sent! 🎉</h2>
            <p className="text-gray-600 mb-6">
              Thanks for reaching out! We've received your message and will get back to you soon. 
              In the meantime, why not check out some amazing deals?
            </p>
            <div className="space-y-3">
              <a
                href="/browse-deals"
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 block"
              >
                Browse Deals
              </a>
              <button
                onClick={() => {
                  setSubmitted(false)
                  setFormData({ name: '', email: '', subject: '', message: '' })
                }}
                className="text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Send Another Message
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Have questions, feedback, or just want to say hi? We'd love to hear from you! 
            Our team is here to help make your deal-hunting experience amazing.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center space-x-3 mb-8">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
                <Send className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Send us a Message</h2>
                <p className="text-gray-600">We'll get back to you as soon as possible</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <select
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                >
                  <option value="">Select a subject</option>
                  <option value="general">General Question</option>
                  <option value="support">Technical Support</option>
                  <option value="partnership">Business Partnership</option>
                  <option value="feedback">Feedback & Suggestions</option>
                  <option value="promoter">Promoter Inquiries</option>
                  <option value="media">Media & Press</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none"
                  placeholder="Tell us how we can help you..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Contact Methods */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Other Ways to Reach Us</h2>
              <div className="space-y-4">
                {contactMethods.map((method, index) => (
                  <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 bg-gradient-to-br ${method.color} rounded-lg flex-shrink-0`}>
                        <div className="text-white">
                          {method.icon}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{method.title}</h3>
                        <p className="text-gray-600 mb-3">{method.description}</p>
                        <div className="space-y-1">
                          <a
                            href={`mailto:${method.contact}`}
                            className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                          >
                            {method.contact}
                          </a>
                          <p className="text-sm text-gray-500">{method.responseTime}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Info */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Coffee className="h-5 w-5 mr-2 text-emerald-600" />
                Quick Info
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-emerald-600" />
                  <span className="text-gray-700">Based in the Cloud ☁️</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-emerald-600" />
                  <span className="text-gray-700">24/7 Email Support</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Heart className="h-4 w-4 text-emerald-600" />
                  <span className="text-gray-700">Built with love for deal hunters</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The humans (and AI) behind JadeDeals who work tirelessly to bring you the best deals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start space-x-4">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-16 h-16 rounded-full border-4 border-emerald-200"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                    <p className="text-emerald-600 font-medium mb-2">{member.role}</p>
                    <p className="text-gray-600 text-sm leading-relaxed mb-3">{member.bio}</p>
                    <div className="flex items-center justify-between">
                      <a
                        href={`mailto:${member.email}`}
                        className="text-emerald-600 hover:text-emerald-700 font-medium text-sm transition-colors"
                      >
                        {member.email}
                      </a>
                    </div>
                    <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="text-sm text-gray-700">{member.funFact}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">How do I report a broken deal?</h3>
                <p className="text-gray-600">Email us at help@jadedeals.me with the deal link and we'll investigate immediately.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I become a promoter?</h3>
                <p className="text-gray-600">Absolutely! Sign up for a promoter account and start sharing amazing deals with our community.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Is JadeDeals free to use?</h3>
                <p className="text-gray-600">Yes! JadeDeals is completely free for both deal seekers and promoters.</p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">How do you verify deals?</h3>
                <p className="text-gray-600">Our team (including Claude) monitors deals 24/7 and community members help flag expired or invalid deals.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I suggest new features?</h3>
                <p className="text-gray-600">We love feedback! Send your suggestions to hello@jadedeals.me and we'll consider them for future updates.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Do you have a mobile app?</h3>
                <p className="text-gray-600">Not yet, but our website works great on mobile! A dedicated app is in our roadmap.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact