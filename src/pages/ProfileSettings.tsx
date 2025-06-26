import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { getUserAvatar } from '../utils/avatars'
import { 
  User, 
  Mail, 
  MapPin, 
  DollarSign, 
  Save, 
  Eye, 
  EyeOff, 
  Lock,
  AlertCircle,
  CheckCircle,
  Camera,
  Edit3
} from 'lucide-react'

const ProfileSettings: React.FC = () => {
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [showPasswordSection, setShowPasswordSection] = useState(false)
  
  const [formData, setFormData] = useState({
    email: '',
    userType: 'Shopper' as 'Shopper' | 'promoter',
    username: '', // NEW
    ageGroup: '',
    city: '',
    country: '',
    zipCode: '',
    incomeGroup: '',
    preferredCategories: [] as string[],
    shoppingFrequency: '',
    priceSensitivity: 'Mid-range' as 'Budget' | 'Mid-range' | 'Premium'
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  const ageGroups = ['18-24', '25-34', '35-44', '45-54', '55-64', '65+']
  const incomeGroups = ['Under $25k', '$25k-$50k', '$50k-$75k', '$75k-$100k', '$100k-$150k', 'Over $150k']
  const categories = ['Electronics', 'Fashion', 'Home & Garden', 'Health & Beauty', 'Sports & Outdoors', 'Books & Media', 'Food & Beverages', 'Travel', 'Automotive', 'Toys & Games']
  const frequencies = ['Daily', 'Weekly', 'Monthly', 'Occasionally', 'Rarely']

  useEffect(() => {
    if (user && profile) {
      setFormData({
        email: user.email || '',
        userType: profile.user_type,
        username: profile.username || '', // NEW
        ageGroup: profile.age_group || '',
        city: profile.city || '',
        country: profile.country || '',
        zipCode: profile.zip_code || '',
        incomeGroup: profile.income_group || '',
        preferredCategories: profile.preferred_categories || [],
        shoppingFrequency: profile.shopping_frequency || '',
        priceSensitivity: profile.price_sensitivity || 'Mid-range'
      })
    }
  }, [user, profile])

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

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    setMessage(null)

    // Username validation
    if (!formData.username || formData.username.length < 3) {
      setMessage({ type: 'error', text: 'Username must be at least 3 characters.' })
      setSaving(false)
      return
    }
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      setMessage({ type: 'error', text: 'Username can only contain letters, numbers, and underscores.' })
      setSaving(false)
      return
    }
    // Check uniqueness
    const { data: existing, error: usernameError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('username', formData.username)
      .neq('id', user.id)
      .maybeSingle()
    if (usernameError) {
      setMessage({ type: 'error', text: 'Error checking username. Please try again.' })
      setSaving(false)
      return
    }
    if (existing) {
      setMessage({ type: 'error', text: 'Username is already taken.' })
      setSaving(false)
      return
    }

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          username: formData.username,
          age_group: formData.ageGroup,
          city: formData.city,
          country: formData.country,
          zip_code: formData.zipCode,
          income_group: formData.incomeGroup,
          preferred_categories: formData.preferredCategories,
          shopping_frequency: formData.shoppingFrequency,
          price_sensitivity: formData.priceSensitivity,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error: any) {
      console.error('Error updating profile:', error)
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' })
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' })
      return
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' })
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (error) throw error

      setMessage({ type: 'success', text: 'Password updated successfully!' })
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setShowPasswordSection(false)
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000)
    } catch (error: any) {
      console.error('Error updating password:', error)
      setMessage({ type: 'error', text: error.message || 'Failed to update password' })
    } finally {
      setSaving(false)
    }
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account information and preferences</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500" />
            )}
            <p className={`text-sm ${
              message.type === 'success' ? 'text-green-600' : 'text-red-600'
            }`}>
              {message.text}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="text-center">
                <div className="relative inline-block">
                  <img
                    src={getUserAvatar(user.email || '', user.id)}
                    alt="Profile"
                    className="w-24 h-24 rounded-full border-4 border-emerald-200"
                  />
                  <button className="absolute bottom-0 right-0 p-2 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-colors">
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mt-4">
                  {user.email?.split('@')[0]}
                </h3>
                <p className="text-gray-600 capitalize">{profile.user_type} Account</p>
                <div className="mt-4 p-3 bg-emerald-50 rounded-lg">
                  <p className="text-sm text-emerald-700">
                    Member since {new Date(profile.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h4>
              <div className="space-y-3">
                <button
                  onClick={() => setShowPasswordSection(!showPasswordSection)}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <Lock className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-700">Change Password</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <User className="h-6 w-6 text-emerald-600" />
                <h2 className="text-xl font-bold text-gray-900">Account Information</h2>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-6">
                {/* Username */}
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    placeholder="Choose a unique username"
                    required
                    minLength={3}
                    maxLength={32}
                    pattern="^[a-zA-Z0-9_]+$"
                    autoComplete="off"
                  />
                  <p className="text-xs text-gray-500 mt-1">This will be your public profile link: /promoter/&lt;username&gt;</p>
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                {/* User Type (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Type
                  </label>
                  <div className="p-3 border border-gray-300 rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-2">
                      {formData.userType === 'promoter' ? (
                        <DollarSign className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <User className="h-5 w-5 text-emerald-600" />
                      )}
                      <span className="text-gray-700 capitalize font-medium">
                        {formData.userType} Account
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Account type cannot be changed</p>
                </div>

                {/* Personal Information */}
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
                      className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
                      className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="">Select income group</option>
                      {incomeGroups.map(group => (
                        <option key={group} value={group}>{group}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Location */}
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
                      className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
                      className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
                      className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Enter zip code"
                    />
                  </div>
                </div>

                {/* Shopping Preferences */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Preferred Shopping Categories
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
                      className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
                      className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="Budget">Budget - Looking for the best deals</option>
                      <option value="Mid-range">Mid-range - Balance of quality and price</option>
                      <option value="Premium">Premium - Quality over price</option>
                    </select>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Save className="h-5 w-5" />
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Password Change Section */}
            {showPasswordSection && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <Lock className="h-6 w-6 text-emerald-600" />
                  <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="newPassword"
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Enter new password"
                        minLength={6}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="confirmPassword"
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Confirm new password"
                        minLength={6}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordSection(false)
                        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                      }}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <Lock className="h-5 w-5" />
                      <span>{saving ? 'Updating...' : 'Update Password'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileSettings