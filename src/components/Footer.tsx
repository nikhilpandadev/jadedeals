import React from 'react'
import { Link } from 'react-router-dom'
import { Gem, Mail, MapPin, Phone } from 'lucide-react'

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
                <Gem className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">JadeDeals</span>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Your ultimate destination for discovering amazing deals and connecting with trusted promoters. 
              Join our community and start saving today!
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2 text-gray-300">
                <Mail className="h-4 w-4" />
                <span>hello@jadedeals.com</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/deals" className="text-gray-300 hover:text-emerald-400 transition-colors">Browse Deals</Link></li>
              <li><Link to="/categories" className="text-gray-300 hover:text-emerald-400 transition-colors">Categories</Link></li>
              <li><Link to="/promoters" className="text-gray-300 hover:text-emerald-400 transition-colors">For Promoters</Link></li>
              <li><Link to="/about" className="text-gray-300 hover:text-emerald-400 transition-colors">About Us</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link to="/help" className="text-gray-300 hover:text-emerald-400 transition-colors">Help Center</Link></li>
              <li><Link to="/contact" className="text-gray-300 hover:text-emerald-400 transition-colors">Contact Us</Link></li>
              <li><Link to="/privacy" className="text-gray-300 hover:text-emerald-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-gray-300 hover:text-emerald-400 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 JadeDeals. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer