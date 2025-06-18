import React from 'react'
import { Scale, Shield, Users, AlertTriangle, CheckCircle, FileText, Gavel } from 'lucide-react'

const Terms: React.FC = () => {
  const lastUpdated = "January 15, 2025"

  const sections = [
    {
      icon: <Users className="h-6 w-6" />,
      title: "Account Terms",
      content: [
        "You must be at least 13 years old to use JadeDeals",
        "You are responsible for maintaining the security of your account and password",
        "You must provide accurate and complete information when creating your account",
        "You may not use another person's account without permission",
        "You are responsible for all activities that occur under your account"
      ]
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Acceptable Use",
      content: [
        "Use JadeDeals only for lawful purposes and in accordance with these terms",
        "Do not post false, misleading, or expired deals",
        "Respect other users and maintain a friendly, helpful community atmosphere",
        "Do not spam, harass, or engage in abusive behavior toward other users",
        "Do not attempt to circumvent any security measures or access restrictions"
      ]
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Content Guidelines",
      content: [
        "You retain ownership of content you post, but grant us license to use it on our platform",
        "Do not post content that infringes on intellectual property rights",
        "Ensure all deal information is accurate and up-to-date",
        "We reserve the right to remove content that violates our guidelines",
        "User-generated content does not represent the views of JadeDeals"
      ]
    },
    {
      icon: <Gavel className="h-6 w-6" />,
      title: "Promoter Terms",
      content: [
        "Promoters must disclose affiliate relationships and comply with FTC guidelines",
        "All affiliate links must be legitimate and lead to the advertised products",
        "Promoters are responsible for the accuracy of their deal postings",
        "We may suspend or terminate promoter accounts for violations",
        "Promoters must comply with all applicable laws and regulations"
      ]
    }
  ]

  const prohibitedActivities = [
    "Posting fake, expired, or misleading deals",
    "Creating multiple accounts to manipulate votes or reviews",
    "Attempting to hack, disrupt, or damage our platform",
    "Collecting user information without consent",
    "Posting spam, advertisements, or irrelevant content",
    "Impersonating other users or entities",
    "Violating any applicable laws or regulations",
    "Interfering with other users' enjoyment of the platform"
  ]

  const disclaimers = [
    {
      title: "Deal Accuracy",
      content: "While we strive to ensure deal accuracy, we cannot guarantee that all deals are current, accurate, or available. Always verify deal details on the retailer's website."
    },
    {
      title: "Third-Party Links",
      content: "JadeDeals contains links to third-party websites. We are not responsible for the content, privacy policies, or practices of these external sites."
    },
    {
      title: "Service Availability",
      content: "We aim for 99.9% uptime but cannot guarantee uninterrupted service. We may temporarily suspend service for maintenance or updates."
    },
    {
      title: "User Content",
      content: "User-generated content represents the views of individual users, not JadeDeals. We do not endorse or verify user-submitted content."
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
              <Scale className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            These terms govern your use of JadeDeals. By using our platform, you agree to these terms and conditions.
          </p>
          <div className="mt-6 inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Last updated: {lastUpdated}</span>
          </div>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to JadeDeals</h2>
          <div className="prose prose-lg text-gray-600">
            <p>
              These Terms of Service ("Terms") govern your access to and use of JadeDeals, including our website, 
              services, and applications (collectively, the "Service"). By accessing or using our Service, 
              you agree to be bound by these Terms.
            </p>
            <p>
              If you disagree with any part of these terms, then you may not access the Service. 
              These Terms apply to all visitors, users, and others who access or use the Service.
            </p>
          </div>
        </div>

        {/* Main Sections */}
        <div className="space-y-8 mb-12">
          {sections.map((section, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white">
                  {section.icon}
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
              </div>
              <ul className="space-y-3">
                {section.content.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Prohibited Activities */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl text-white">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Prohibited Activities</h2>
          </div>
          <p className="text-gray-600 mb-6">
            The following activities are strictly prohibited on JadeDeals. Violation of these rules may result in 
            account suspension or termination:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prohibitedActivities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 bg-red-50 rounded-lg border border-red-200">
                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                <span className="text-red-700 text-sm">{activity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Intellectual Property */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Intellectual Property Rights</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Our Content</h3>
              <p className="text-gray-600">
                The Service and its original content, features, and functionality are owned by JadeDeals and are protected 
                by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Content</h3>
              <p className="text-gray-600">
                You retain ownership of content you submit to JadeDeals. However, by posting content, you grant us a 
                worldwide, non-exclusive, royalty-free license to use, display, and distribute your content on our platform.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Respect Others' Rights</h3>
              <p className="text-gray-600">
                Do not post content that infringes on others' intellectual property rights. We will respond to valid 
                copyright infringement notices in accordance with applicable law.
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimers */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Disclaimers & Limitations</h2>
          <div className="space-y-6">
            {disclaimers.map((disclaimer, index) => (
              <div key={index} className="border-l-4 border-yellow-400 pl-6 bg-yellow-50 p-4 rounded-r-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{disclaimer.title}</h3>
                <p className="text-gray-600">{disclaimer.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Limitation of Liability */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-8 border border-yellow-200 mb-8">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-6 w-6 text-yellow-600 mt-1 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                JadeDeals provides the service "as is" without warranties of any kind. We are not liable for any indirect, 
                incidental, special, consequential, or punitive damages arising from your use of the service.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Our total liability to you for any claims arising from these terms or your use of the service 
                shall not exceed the amount you paid us in the 12 months preceding the claim (which may be zero).
              </p>
            </div>
          </div>
        </div>

        {/* Termination */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Termination</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Right to Terminate</h3>
              <p className="text-gray-600">
                You may terminate your account at any time by contacting us or using the account deletion feature 
                in your profile settings.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Our Right to Terminate</h3>
              <p className="text-gray-600">
                We may terminate or suspend your account immediately, without prior notice, for conduct that we believe 
                violates these Terms or is harmful to other users, us, or third parties.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Effect of Termination</h3>
              <p className="text-gray-600">
                Upon termination, your right to use the Service will cease immediately. We may delete your account 
                and all associated data, though some information may be retained as described in our Privacy Policy.
              </p>
            </div>
          </div>
        </div>

        {/* Governing Law */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Governing Law & Disputes</h2>
          <div className="space-y-4 text-gray-600">
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the United States, 
              without regard to its conflict of law provisions.
            </p>
            <p>
              Any disputes arising from these Terms or your use of the Service will be resolved through binding arbitration, 
              except that either party may seek injunctive relief in court for intellectual property violations.
            </p>
            <p>
              Before initiating arbitration, we encourage you to contact us at <a href="mailto:help@jadedeals.me" className="text-blue-600 hover:text-blue-700">help@jadedeals.me</a> to 
              try to resolve the dispute informally.
            </p>
          </div>
        </div>

        {/* Changes to Terms */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to These Terms</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            We reserve the right to modify these Terms at any time. When we make material changes, we will:
          </p>
          <ul className="space-y-2 text-gray-600 mb-4">
            <li className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-emerald-500 mt-1 flex-shrink-0" />
              <span>Notify you via email if you have an account</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-emerald-500 mt-1 flex-shrink-0" />
              <span>Update the "Last updated" date</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-emerald-500 mt-1 flex-shrink-0" />
              <span>Post a notice on our website</span>
            </li>
          </ul>
          <p className="text-gray-600">
            Your continued use of the Service after changes become effective constitutes acceptance of the new Terms.
          </p>
        </div>

        {/* Contact Information */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions About These Terms?</h2>
            <p className="text-gray-600 mb-6">
              If you have any questions about these Terms of Service, please don't hesitate to contact us. 
              We're here to help clarify anything you need to know.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:help@jadedeals.me"
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 inline-flex items-center justify-center space-x-2"
              >
                <Scale className="h-5 w-5" />
                <span>Contact Legal Team</span>
              </a>
              <a
                href="/contact"
                className="border-2 border-blue-500 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-200"
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

export default Terms