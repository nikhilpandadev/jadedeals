import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, UserProfile } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, userData: Partial<UserProfile>) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithFacebook: () => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // Initialize auth state
    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          if (mounted) {
            setSession(null)
            setUser(null)
            setProfile(null)
            setLoading(false)
          }
          return
        }

        console.log('Initial session check:', session ? 'Found session' : 'No session')
        
        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)
          
          if (session?.user) {
            await fetchProfile(session.user.id)
          } else {
            setProfile(null)
          }
          setLoading(false)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        if (mounted) {
          setSession(null)
          setUser(null)
          setProfile(null)
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session ? 'Session exists' : 'No session')
        
        if (!mounted) return

        setSession(session)
        setUser(session?.user ?? null)
        
        setTimeout(async () => {
          if (!mounted) return;
          if (session?.user) {
            console.log('User signed in: calling fetchProfile with ID:', session.user.id)
            await fetchProfile(session.user.id)
            // If this is a new OAuth user, create their profile
            if (event === 'SIGNED_IN' && session.user.app_metadata.provider) {
              await createOAuthProfile(session.user)
            }
          } else {
            setProfile(null)
          }
          if (event === 'SIGNED_OUT') {
            console.log('User signed out, clearing state')
            // Clear all local state on sign out
            setProfile(null)
            setUser(null)
            setSession(null)
            // Clear session storage
            clearAllStorage()
          }
          setLoading(false)
        }, 0);
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const clearAllStorage = () => {
    try {
      // Clear session storage
      sessionStorage.removeItem('jadedeals_session_id')
      
      // Clear any Supabase auth tokens from localStorage
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith('sb-') || key.includes('supabase')) {
          localStorage.removeItem(key)
        }
      })
      
      // Clear any other app-specific storage
      keys.forEach(key => {
        if (key.includes('jadedeals') || key.includes('jade-deals')) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.error('Error clearing storage:', error)
    }
  }

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error)
        return
      }

      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
      setProfile(null)
    }
  }

  const createOAuthProfile = async (user: User) => {
    try {
      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()

      if (!existingProfile) {
        // Create a basic profile for OAuth users
        const profileData = {
          id: user.id,
          email: user.email || '',
          user_type: 'regular' as const,
          age_group: '',
          city: '',
          country: '',
          zip_code: '',
          income_group: '',
          preferred_categories: [],
          shopping_frequency: '',
          price_sensitivity: 'Mid-range' as const,
        }

        const { data, error: profileError } = await supabase
          .from('user_profiles')
          .insert([profileData])
          .select()
          .single()

        if (profileError) {
          console.error('Error creating OAuth profile:', profileError)
        } else {
          setProfile(data)
        }
      }
    } catch (error) {
      console.error('Error in createOAuthProfile:', error)
    }
  }

  const signUp = async (email: string, password: string, userData: Partial<UserProfile>) => {
    console.log('Starting signup process for:', email)
    
    try {
      // First, sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      })

      if (error) {
        console.error('Signup error:', error)
        throw error
      }

      console.log('Signup response:', data)

      if (data.user) {
        console.log('User created successfully, creating profile...')
        
        // Create user profile
        const profileData = {
          id: data.user.id,
          email: data.user.email || email,
          user_type: userData.user_type || 'regular',
          age_group: userData.age_group || '',
          city: userData.city || '',
          country: userData.country || '',
          zip_code: userData.zip_code || '',
          income_group: userData.income_group || '',
          preferred_categories: userData.preferred_categories || [],
          shopping_frequency: userData.shopping_frequency || '',
          price_sensitivity: userData.price_sensitivity || 'Mid-range',
        }

        console.log('Creating profile with data:', profileData)

        const { data: profileResult, error: profileError } = await supabase
          .from('user_profiles')
          .insert([profileData])
          .select()
          .single()

        if (profileError) {
          console.error('Profile creation error:', profileError)
          throw new Error(`Failed to create user profile: ${profileError.message}`)
        }

        console.log('Profile created successfully:', profileResult)
        setProfile(profileResult)
      } else {
        console.error('No user returned from signup')
        throw new Error('Failed to create user account')
      }
    } catch (error) {
      console.error('Error in signUp:', error)
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    console.log('Attempting to sign in with:', email)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Sign in error:', error)
      throw error
    }

    console.log('Sign in successful')
    // The auth state change listener will handle setting user/profile state
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      }
    })

    if (error) throw error
  }

  const signInWithFacebook = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    })

    if (error) throw error
  }

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      console.error('Reset password error:', error)
      throw error
    }

    console.log('Password reset email sent successfully')
  }

  const signOut = async () => {
    console.log('Starting sign out process...')
    
    let retryCount = 0
    const maxRetries = 3
    
    const attemptSignOut = async (): Promise<void> => {
      try {
        console.log(`Sign out attempt ${retryCount + 1}/${maxRetries}`)
        
        // Clear local state immediately to prevent UI flickering
        console.log('Clearing local state...')
        setUser(null)
        setProfile(null)
        setSession(null)
        
        // Clear all storage immediately
        clearAllStorage()
        
        // Sign out from Supabase with global scope to clear all sessions
        console.log('Signing out from Supabase...')
        const { error } = await supabase.auth.signOut({ scope: 'global' })
        
        if (error) {
          console.error('Supabase sign out error:', error)
          throw error
        }
        
        console.log('Sign out completed successfully')
        
        // Force a small delay to ensure cleanup is complete
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (error) {
        console.error(`Sign out attempt ${retryCount + 1} failed:`, error)
        retryCount++
        
        if (retryCount < maxRetries) {
          console.log(`Retrying sign out in 1 second... (attempt ${retryCount + 1}/${maxRetries})`)
          await new Promise(resolve => setTimeout(resolve, 1000))
          return attemptSignOut()
        } else {
          console.error('All sign out attempts failed, forcing local cleanup')
          // Even if Supabase sign out fails, ensure local state is cleared
          setUser(null)
          setProfile(null)
          setSession(null)
          clearAllStorage()
          
          // Show error but don't throw to prevent blocking navigation
          console.error('Sign out failed after all retries, but local state cleared')
        }
      }
    }
    
    await attemptSignOut()
  }

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithFacebook,
    signOut,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}