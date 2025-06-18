import React from 'react'
import { Shield, Eye, Lock, Users, Database, Globe, CheckCircle, AlertTriangle } from 'lucide-react'

const Privacy: React.FC = () => {
  const lastUpdated = "January 15, 2025"

  const sections = [
    {
      icon: <Database className="h-6 w-6" />,
      title: "Information We Collect",
      content: [
        {
          subtitle: "Account Information",
          details: "When you create an account, we collect your email address, password (encrypted), and profile preferences like shopping categories and location."
        },
        {
          subtitle: "Deal Interactions",
          details: "We track which deals you view, save, share, and interact with to improve your personalized experience and provide better recommendations."
        },
        {
          subtitle: "Usage Analytics",
          details: "We collect anonymous usage data like page views, click patterns, and feature usage to improve our platform and user experience."
        },
        {
          subtitle: "Communication Data",
          details: "When you contact us, we store your messages and our responses to provide better support and resolve your inquiries."
        }
      ]
    },
    {
      icon: <Eye className="h-6 w-6" />,
      title: "How We Use Your Information",
      content: [
        {
          subtitle: "Personalization",
          details: "We use your preferences and behavior to show you relevant deals and improve your browsing experience on JadeDeals."
        },
        {
          subtitle: "Platform Improvement",
          details: "Analytics help us understand how users interact with our platform so we can make it better, faster, and more useful."
        },
        {
          subtitle: "Communication",
          details: "We may send you important updates about your account, new features, or respond to your support requests."
        },
        {
          subtitle: "Security & Safety",
          details: "We monitor for suspicious activity and use your data to protect your account and maintain platform integrity."
        }
      ]
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Information Sharing",
      content: [
        {
          subtitle: "Public Information",
          details: "Your username and public interactions (like comments and helpful votes) are visible to other users. Your email is never shown publicly."
        },
        {
          subtitle: "Promoter Analytics",
          details: "Promoters can see aggregated analytics about their deals (views, clicks, saves) but cannot see individual user identities."
        },
        {
          subtitle: "Service Providers",
          details: "We work with trusted partners like Supabase for hosting and analytics. They only access data necessary to provide their services."
        },
        {
          subtitle: "Legal Requirements",
          details: "We may disclose information if required by law, to protect our rights, or to ensure user safety and platform security."
        }
      ]
    },
    {
      icon: <Lock className="h-6 w-6" />,
      title: "Data Security",
      content: [
        {
          subtitle: "Encryption",
          details: "All data is encrypted in transit and at rest. Your password is hashed using industry-standard security practices."
        },
        {
          subtitle: "Access Controls",
          details: "Only authorized team members have access to user data, and access is logged and monitored for security purposes."
        },
        {
          subtitle: "Regular Audits",
          details: "We regularly review our security practices and update them to protect against new threats and vulnerabilities."
        },
        {
          subtitle: "Incident Response",
          details: "In case of a security incident, we have procedures to quickly respond, contain the issue, and notify affected users."
        }
      ]
    }
  ]

  const userRights = [
    {
      title: "Access Your Data",
      description: "Request a copy of all personal data we have about you",
      action: "Email help@jadedeals.me"
    },
    {
      title: "Update Information",
      description: "Modify your profile and preferences anytime in your account settings",
      action: "Visit Profile Settings"
    },
    {
      title: "Delete Account",
      description: "Permanently delete your account and all associated data",
      action: "Contact Support"
    },
    {
      title: "Data Portability",
      description: "Export your data in a machine-readable format",
      action: "Email help@jadedeals.me"
    },
    {
      title: "Opt-out Communications",
      description: "Unsubscribe from non-essential emails and notifications",
      action: "Account Settings"
    },
    {
      title: "Restrict Processing",
      description: "Limit how we use your data while keeping your account active",
      action: "Contact Support"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg">
              <Shield className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Your privacy matters to us. Here's how we collect, use, and protect your information at JadeDeals.
          </p>
          <div className="mt-6 inline-flex items-center space-x-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Last updated: {lastUpdated}</span>
          </div>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Commitment to Privacy</h2>
          <div className="prose prose-lg text-gray-600">
            <p>
              At JadeDeals, we believe privacy is a fundamental right. This policy explains how we handle your personal information 
              when you use our platform to discover and share amazing deals. We're committed to being transparent about our practices 
              and giving you control over your data.
            </p>
            <p>
              By using JadeDeals, you agree to the collection and use of information in accordance with this policy. 
              If you have any questions, please don't hesitate to contact us at <a href="mailto:help@jadedeals.me" className="text-emerald-600 hover:text-emerald-700">help@jadedeals.me</a>.
            </p>
          </div>
        </div>

        {/* Main Sections */}
        <div className="space-y-8 mb-12">
          {sections.map((section, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl text-white">
                  {section.icon}
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
              </div>
              <div className="space-y-6">
                {section.content.map((item, itemIndex) => (
                  <div key={itemIndex} className="border-l-4 border-emerald-200 pl-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.subtitle}</h3>
                    <p className="text-gray-600 leading-relaxed">{item.details}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Your Rights */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white">
              <Users className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Your Privacy Rights</h2>
          </div>
          <p className="text-gray-600 mb-8">
            You have several rights regarding your personal data. Here's what you can do and how to exercise these rights:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userRights.map((right, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{right.title}</h3>
                <p className="text-gray-600 mb-4">{right.description}</p>
                <div className="text-sm">
                  <span className="text-gray-500">How to: </span>
                  <span className="text-emerald-600 font-medium">{right.action}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cookies & Tracking */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl text-white">
              <Globe className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Cookies & Tracking</h2>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Essential Cookies</h3>
              <p className="text-gray-600">Required for the website to function properly, including authentication and security features.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Cookies</h3>
              <p className="text-gray-600">Help us understand how users interact with our platform to improve the user experience.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Preference Cookies</h3>
              <p className="text-gray-600">Remember your settings and preferences to provide a personalized experience.</p>
            </div>
          </div>
        </div>

        {/* Data Retention */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Data Retention</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-emerald-500 mt-1 flex-shrink-0" />
              <div>
                <p className="text-gray-600"><strong>Account Data:</strong> Retained while your account is active and for 30 days after deletion to allow account recovery.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-emerald-500 mt-1 flex-shrink-0" />
              <div>
                <p className="text-gray-600"><strong>Analytics Data:</strong> Aggregated and anonymized data may be retained indefinitely for platform improvement.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-emerald-500 mt-1 flex-shrink-0" />
              <div>
                <p className="text-gray-600"><strong>Communication Records:</strong> Support conversations are kept for 2 years to improve our service quality.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Children's Privacy */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-8 border border-yellow-200 mb-8">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-6 w-6 text-yellow-600 mt-1 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">Children's Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                JadeDeals is not intended for children under 13 years of age. We do not knowingly collect personal information 
                from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, 
                please contact us immediately at <a href="mailto:help@jadedeals.me" className="text-emerald-600 hover:text-emerald-700 font-medium">help@jadedeals.me</a>.
              </p>
            </div>
          </div>
        </div>

        {/* Changes to Policy */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to This Policy</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            We may update this privacy policy from time to time to reflect changes in our practices or for legal and regulatory reasons. 
            When we make significant changes, we will:
          </p>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-emerald-500 mt-1 flex-shrink-0" />
              <span>Notify you via email if you have an account with us</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-emerald-500 mt-1 flex-shrink-0" />
              <span>Update the "Last updated" date at the top of this policy</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-emerald-500 mt-1 flex-shrink-0" />
              <span>Post a notice on our website highlighting the changes</span>
            </li>
          </ul>
        </div>

        {/* Contact Information */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-8 border border-emerald-200">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions About Privacy?</h2>
            <p className="text-gray-600 mb-6">
              If you have any questions about this privacy policy or how we handle your data, 
              we're here to help. Don't hesitate to reach out!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:help@jadedeals.me"
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 inline-flex items-center justify-center space-x-2"
              >
                <Shield className="h-5 w-5" />
                <span>Contact Privacy Team</span>
              </a>
              <a
                href="/contact"
                className="border-2 border-emerald-500 text-emerald-600 px-8 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition-all duration-200"
              >
                General Contact
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Privacy