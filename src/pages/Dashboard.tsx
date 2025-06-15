import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Dashboard: React.FC = () => {
  const { user, profile, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && user && profile) {
      // Redirect regular users to browse deals (their home page)
      if (profile.user_type === 'regular') {
        navigate('/browse-deals', { replace: true })
      }
      // Redirect promoters to their dashboard
      else if (profile.user_type === 'promoter') {
        navigate('/promoter-dashboard', { replace: true })
      }
    }
  }, [user, profile, loading, navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // This should rarely be seen as users will be redirected
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Redirecting...</h1>
        <p className="text-gray-600">Taking you to your personalized experience...</p>
      </div>
    </div>
  )
}

export default Dashboard