import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import UserLayout from './components/UserLayout'
import PromoterLayout from './components/PromoterLayout'
import ProtectedRoute from './components/ProtectedRoute'
import Landing from './pages/Landing'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import PromoterDashboard from './pages/PromoterDashboard'
import PromoterResources from './pages/PromoterResources'
import BrowseDeals from './pages/BrowseDeals'
import SavedDeals from './pages/SavedDeals'
import Categories from './pages/Categories'
import DealDetails from './pages/DealDetails'
import ForPromoters from './pages/ForPromoters'
import ProfileSettings from './pages/ProfileSettings'
import AuthCallback from './pages/AuthCallback'
import Contact from './pages/Contact'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import About from './pages/About'
import Help from './pages/Help'
import PromoterProfile from './pages/PromoterProfile'
import FollowersManagement from './pages/FollowersManagement'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* User Layout Routes */}
          <Route element={<UserLayout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/browse-deals" element={<BrowseDeals />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/deal/:id" element={<DealDetails />} />
            <Route path="/promoters" element={<ForPromoters />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/about" element={<About />} />
            <Route path="/help" element={<Help />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/saved-deals" 
              element={
                <ProtectedRoute>
                  <SavedDeals />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfileSettings />
                </ProtectedRoute>
              } 
            />
            <Route path="/promoter/:username" element={
              <ProtectedRoute>
                <PromoterProfile />
              </ProtectedRoute>
            } />
          </Route>

          {/* Promoter Layout Routes */}
          <Route element={<PromoterLayout />}>
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
              path="/followers-management" 
              element={
                <ProtectedRoute>
                  <FollowersManagement />
                </ProtectedRoute>
              } 
            />
          </Route>

          {/* Auth Callback outside layouts */}
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App