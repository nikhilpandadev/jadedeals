import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Footer from './components/Footer'
import BoltNewBadge from './components/BoltNewBadge'
import ProtectedRoute from './components/ProtectedRoute'
import Landing from './pages/Landing'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import PromoterDashboard from './pages/PromoterDashboard'
import PromoterResources from './pages/PromoterResources'
import BrowseDeals from './pages/BrowseDeals'
import Categories from './pages/Categories'
import DealDetails from './pages/DealDetails'
import ForPromoters from './pages/ForPromoters'
import AuthCallback from './pages/AuthCallback'

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Header />
          <div className="flex flex-1">
            <Sidebar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/browse-deals" element={<BrowseDeals />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/deal/:id" element={<DealDetails />} />
                <Route path="/promoters" element={<ForPromoters />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/promoter-dashboard" 
                  element={
                    <ProtectedRoute>
                      <PromoterDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/promoter-resources" 
                  element={
                    <ProtectedRoute>
                      <PromoterResources />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/deals" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/auth/callback" element={<AuthCallback />} />
                {/* Placeholder routes for footer links */}
                <Route path="/help" element={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><h1 className="text-2xl font-bold text-gray-900">Help Center - Coming Soon</h1></div>} />
                <Route path="/contact" element={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><h1 className="text-2xl font-bold text-gray-900">Contact Us - Coming Soon</h1></div>} />
                <Route path="/privacy" element={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><h1 className="text-2xl font-bold text-gray-900">Privacy Policy - Coming Soon</h1></div>} />
                <Route path="/terms" element={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><h1 className="text-2xl font-bold text-gray-900">Terms of Service - Coming Soon</h1></div>} />
                <Route path="/about" element={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><h1 className="text-2xl font-bold text-gray-900">About Us - Coming Soon</h1></div>} />
                <Route path="/profile" element={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><h1 className="text-2xl font-bold text-gray-900">Profile Settings - Coming Soon</h1></div>} />
              </Routes>
            </main>
          </div>
          <Footer />
          
          {/* Bolt.new Badge */}
          <BoltNewBadge 
            variant="auto"
            size="medium"
            position="bottom-right"
          />
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App