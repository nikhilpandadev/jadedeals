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
      async (event, session) => {
        console.log('Auth state changed:', event, session ? 'Session exists' : 'No session')
        
        if (!mounted) return

        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
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
          sessionStorage.removeItem('jadedeals_session_id')
        }
        
        setLoading(false)
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

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
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) throw error

    if (data.user) {
      // Create user profile
      const profileData = {
        id: data.user.id,
        email: data.user.email || email,
        ...userData,
      }

      const { data: profileResult, error: profileError } = await supabase
        .from('user_profiles')
        .insert([profileData])
        .select()
        .single()

      if (profileError) throw profileError

      setProfile(profileResult)
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
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
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
    try {
      // Clear local state first
      console.log('Clearing local state...')
      setUser(null)
      setProfile(null)
      setSession(null)
      
      // Clear any session storage
      sessionStorage.removeItem('jadedeals_session_id')
      
      // Sign out from Supabase with scope 'global' to clear all sessions
      console.log('Signing out from Supabase...')
      const { error } = await supabase.auth.signOut({ scope: 'global' })
      
      if (error) {
        console.error('Error signing out from Supabase:', error)
        // Don't throw the error, just log it and continue
      }
      
      // Additional cleanup - clear any potential localStorage items
      try {
        // Clear any Supabase auth tokens from localStorage
        const keys = Object.keys(localStorage)
        keys.forEach(key => {
          if (key.startsWith('sb-') || key.includes('supabase')) {
            localStorage.removeItem(key)
          }
        })
      } catch (storageError) {
        console.error('Error clearing localStorage:', storageError)
      }
      
      console.log('Sign out completed successfully')
      
    } catch (error) {
      console.error('Sign out error:', error)
      // Even if there's an error, ensure local state is cleared
      setUser(null)
      setProfile(null)
      setSession(null)
      sessionStorage.removeItem('jadedeals_session_id')
      
      // Force clear localStorage as fallback
      try {
        const keys = Object.keys(localStorage)
        keys.forEach(key => {
          if (key.startsWith('sb-') || key.includes('supabase')) {
            localStorage.removeItem(key)
          }
        })
      } catch (storageError) {
        console.error('Error clearing localStorage in catch:', storageError)
      }
      
      throw error
    }
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