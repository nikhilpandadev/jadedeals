import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, MapPin, DollarSign, Gem, AlertCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const SignUp: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '', // NEW: username field
    password: '',
    confirmPassword: '',
    userType: 'Shopper' as 'Shopper' | 'promoter',
    firstName: '', // NEW
    lastName: '',  // NEW
    ageGroup: '',
    city: '',
    country: '',
    zipCode: '',
    incomeGroup: '',
    preferredCategories: [] as string[],
    shoppingFrequency: '',
    priceSensitivity: 'Mid-range' as 'Budget' | 'Mid-range' | 'Premium'
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)
  const [usernameChecking, setUsernameChecking] = useState(false) // NEW
  const [usernameAvailable, setUsernameAvailable] = useState<boolean|null>(null) // NEW

  const { signUp, signInWithGoogle, signInWithFacebook, user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      console.log('User already authenticated, redirecting to dashboard')
      navigate('/dashboard', { replace: true })
    }
  }, [user, authLoading, navigate])

  const ageGroups = ['18-24', '25-34', '35-44', '45-54', '55-64', '65+']
  const incomeGroups = ['Under $25k', '$25k-$50k', '$50k-$75k', '$75k-$100k', '$100k-$150k', 'Over $150k']
  const categories = ['Electronics', 'Fashion', 'Home & Garden', 'Health & Beauty', 'Sports & Outdoors', 'Books & Media', 'Food & Beverages', 'Travel', 'Automotive', 'Toys & Games']
  const frequencies = ['Daily', 'Weekly', 'Monthly', 'Occasionally', 'Rarely']

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCategoryChange = (category: string) => {
    setFormData(prev => ({
      ...prev,
      preferredCategories: prev.preferredCategories.includes(category)
        ? prev.preferredCategories.filter(c => c !== category)
        : [...prev.preferredCategories, category]
    }))
  }

  // Username validation (format)
  const validateUsernameFormat = (username: string) => {
    // 3-20 chars, alphanumeric, underscores, no spaces
    return /^[a-zA-Z0-9_]{3,20}$/.test(username)
  }

  // Username uniqueness check (async)
  const checkUsernameAvailability = async (username: string) => {
    setUsernameChecking(true)
    setUsernameAvailable(null)
    try {
      // Use supabase client directly (imported, not window.supabase)
      const { data, error } = await import('../lib/supabase').then(({ supabase }) =>
        supabase
          .from('user_profiles')
          .select('id')
          .eq('username', username)
          .maybeSingle()
      )
      setUsernameAvailable(!data)
    } catch (e) {
      setUsernameAvailable(null)
    } finally {
      setUsernameChecking(false)
    }
  }

  const validateStep1 = () => {
    if (!formData.email) {
      setError('Email is required')
      return false
    }
    if (!formData.username) {
      setError('Username is required')
      return false
    }
    if (!validateUsernameFormat(formData.username)) {
      setError('Username must be 3-20 characters, letters, numbers, or underscores only')
      return false
    }
    if (usernameAvailable === false) {
      setError('Username is already taken')
      return false
    }
    if (!formData.password) {
      setError('Password is required')
      return false
    }
    if (!formData.confirmPassword) {
      setError('Please confirm your password')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return false
    }
    return true
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Submitting step:', step, e)
    if (step < 3) {
      // Don't submit, just go to next step
      return
    }
    if (!(await validateStep1())) {
      return
    }
    setLoading(true)
    setError('')
    try {
      console.log('Submitting signup form with data:', {
        email: formData.email,
        username: formData.username, // NEW
        userType: formData.userType,
        firstName: formData.firstName, // NEW
        lastName: formData.lastName,   // NEW
        ageGroup: formData.ageGroup,
        city: formData.city,
        country: formData.country,
        zipCode: formData.zipCode,
        incomeGroup: formData.incomeGroup,
        preferredCategories: formData.preferredCategories,
        shoppingFrequency: formData.shoppingFrequency,
        priceSensitivity: formData.priceSensitivity
      })

      await signUp(formData.email, formData.password, {
        user_type: formData.userType,
        username: formData.username, // NEW: send username
        first_name: formData.firstName || '', // NEW
        last_name: formData.lastName || '',   // NEW
        age_group: formData.ageGroup || '',
        city: formData.city || '',
        country: formData.country || '',
        zip_code: formData.zipCode || '',
        income_group: formData.incomeGroup || '',
        preferred_categories: formData.preferredCategories,
        shopping_frequency: formData.shoppingFrequency || '',
        price_sensitivity: formData.priceSensitivity
      })
      
      console.log('Sign up completed successfully')
      navigate('/dashboard', { replace: true })
    } catch (error: any) {
      console.error('Signup error:', error)
      
      // Provide more helpful error messages
      if (error.message?.includes('User already registered')) {
        setError('An account with this email already exists. Please sign in instead.')
      } else if (error.message?.includes('Invalid email')) {
        setError('Please enter a valid email address.')
      } else if (error.message?.includes('Password should be at least 6 characters')) {
        setError('Password must be at least 6 characters long.')
      } else if (error.message?.includes('username')) {
        setError('Username is already taken or invalid.')
      } else {
        setError(error.message || 'Failed to create account. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (step === 1) {
      if (!validateStep1()) {
        return
      }
    }
    setError('')
    setStep(step + 1)
  }

  const prevStep = () => {
    setError('')
    setStep(step - 1)
  }

  const handleGoogleSignIn = async () => {
    try {
      setError('')
      await signInWithGoogle()
    } catch (error: any) {
      console.error('Google sign in error:', error)
      setError(error.message || 'Failed to sign in with Google')
    }
  }

  const handleFacebookSignIn = async () => {
    try {
      setError('')
      await signInWithFacebook()
    } catch (error: any) {
      console.error('Facebook sign in error:', error)
      setError(error.message || 'Failed to sign in with Facebook')
    }
  }

  // Watch username for availability check
  useEffect(() => {
    if (formData.username && validateUsernameFormat(formData.username)) {
      checkUsernameAvailability(formData.username)
    } else {
      setUsernameAvailable(null)
    }
    // eslint-disable-next-line
  }, [formData.username])

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg">
              <Gem className="h-10 w-10 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Join JadeDeals</h2>
          <p className="text-gray-600">Create your account and start saving today</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Step {step} of 3</span>
              <span className="text-sm font-medium text-gray-600">{Math.round((step / 3) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              ></div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-600 text-sm">{error}</p>
                {error.includes('already exists') && (
                  <p className="text-red-500 text-xs mt-1">
                    <Link to="/login" className="underline hover:no-underline">Sign in here</Link>
                  </p>
                )}
              </div>
            </div>
          )}

          <form>
            {step === 1 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="relative">
                      <input
                        type="radio"
                        name="userType"
                        value="Shopper"
                        checked={formData.userType === 'Shopper'}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.userType === 'Shopper' 
                          ? 'border-emerald-500 bg-emerald-50' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}>
                        <div className="text-center">
                          <User className="h-8 w-8 mx-auto mb-2 text-emerald-600" />
                          <div className="font-medium">Shopper</div>
                          <div className="text-sm text-gray-500">Browse and discover deals</div>
                        </div>
                      </div>
                    </label>
                    <label className="relative">
                      <input
                        type="radio"
                        name="userType"
                        value="promoter"
                        checked={formData.userType === 'promoter'}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.userType === 'promoter' 
                          ? 'border-emerald-500 bg-emerald-50' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}>
                        <div className="text-center">
                          <DollarSign className="h-8 w-8 mx-auto mb-2 text-emerald-600" />
                          <div className="font-medium">Promoter</div>
                          <div className="text-sm text-gray-500">Share and promote deals</div>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                {/* Username field */}
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                    Username *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      value={formData.username}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${
                        usernameAvailable === false ? 'border-red-400' : usernameAvailable === true ? 'border-emerald-500' : 'border-gray-300'
                      }`}
                      placeholder="Choose a unique username"
                      autoComplete="off"
                    />
                    {usernameChecking && (
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">Checking...</span>
                    )}
                    {usernameAvailable === true && (
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-600 text-xs">Available</span>
                    )}
                    {usernameAvailable === false && (
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 text-xs">Taken</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">3-20 characters, letters, numbers, or underscores. This will be your public profile link.</p>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      placeholder="Create a password (min 6 characters)"
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      placeholder="Confirm your password"
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or continue with</span>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span className="ml-2">Google</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleFacebookSignIn}
                      className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                      <svg className="h-5 w-5" fill="#1877F2" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      <span className="ml-2">Facebook</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Personal Information (Optional)</h3>
                <p className="text-sm text-gray-600 mb-6">Help us personalize your experience by sharing some basic information.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="ageGroup" className="block text-sm font-medium text-gray-700 mb-2">
                      Age Group
                    </label>
                    <select
                      id="ageGroup"
                      name="ageGroup"
                      value={formData.ageGroup}
                      onChange={handleInputChange}
                      className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    >
                      <option value="">Select age group</option>
                      {ageGroups.map(group => (
                        <option key={group} value={group}>{group}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="incomeGroup" className="block text-sm font-medium text-gray-700 mb-2">
                      Income Group
                    </label>
                    <select
                      id="incomeGroup"
                      name="incomeGroup"
                      value={formData.incomeGroup}
                      onChange={handleInputChange}
                      className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    >
                      <option value="">Select income group</option>
                      {incomeGroups.map(group => (
                        <option key={group} value={group}>{group}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      placeholder="Enter your city"
                    />
                  </div>

                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <input
                      id="country"
                      name="country"
                      type="text"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      placeholder="Enter your country"
                    />
                  </div>

                  <div>
                    <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
                      Zip Code
                    </label>
                    <input
                      id="zipCode"
                      name="zipCode"
                      type="text"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      placeholder="Enter zip code"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Shopping Preferences (Optional)</h3>
                <p className="text-sm text-gray-600 mb-6">Help us show you the most relevant deals.</p>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Preferred Shopping Categories (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {categories.map(category => (
                      <label key={category} className="relative">
                        <input
                          type="checkbox"
                          checked={formData.preferredCategories.includes(category)}
                          onChange={() => handleCategoryChange(category)}
                          className="sr-only"
                        />
                        <div className={`p-3 border-2 rounded-lg cursor-pointer transition-all text-center ${
                          formData.preferredCategories.includes(category)
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}>
                          <div className="text-sm font-medium">{category}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="shoppingFrequency" className="block text-sm font-medium text-gray-700 mb-2">
                      Shopping Frequency
                    </label>
                    <select
                      id="shoppingFrequency"
                      name="shoppingFrequency"
                      value={formData.shoppingFrequency}
                      onChange={handleInputChange}
                      className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    >
                      <option value="">Select frequency</option>
                      {frequencies.map(freq => (
                        <option key={freq} value={freq}>{freq}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="priceSensitivity" className="block text-sm font-medium text-gray-700 mb-2">
                      Price Sensitivity
                    </label>
                    <select
                      id="priceSensitivity"
                      name="priceSensitivity"
                      value={formData.priceSensitivity}
                      onChange={handleInputChange}
                      className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    >
                      <option value="Budget">Budget - Looking for the best deals</option>
                      <option value="Mid-range">Mid-range - Balance of quality and price</option>
                      <option value="Premium">Premium - Quality over price</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
              )}
              
              {step < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="ml-auto bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSignUp}
                  disabled={loading}
                  className="ml-auto bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <span>Create Account</span>
                  )}
                </button>
              )}
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-emerald-600 hover:text-emerald-500">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUp