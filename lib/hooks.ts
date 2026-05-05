'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

// Hook for fetching current user
export function useUser() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data, error }) => {
      if (error) setError(error.message)
      setUser(data.user)
      setLoading(false)
    })
  }, [])

  return { user, loading, error }
}

// Hook for fetching user profile
export function useUserProfile() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useUser()

  useEffect(() => {
    if (!user) return

    const supabase = createClient()
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
      .then(({ data, error }) => {
        if (error) setError(error.message)
        setProfile(data)
        setLoading(false)
      })
  }, [user])

  return { profile, loading, error }
}

// Hook for checking authentication
export function useAuth() {
  const { user, loading } = useUser()
  return {
    isAuthenticated: !!user,
    user,
    loading,
  }
}

// Hook for managing loading states
export function useAsyncAction(asyncFn: () => Promise<any>) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const execute = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      await asyncFn()
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, success, execute }
}

// Hook for local storage
export function useLocalStorage(key: string, initialValue: any) {
  const [storedValue, setStoredValue] = useState(initialValue)

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item) setStoredValue(JSON.parse(item))
    } catch (error) {
      console.error(error)
    }
  }, [key])

  const setValue = (value: any) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(error)
    }
  }

  return [storedValue, setValue]
}

// Hook for debouncing
export function useDebounce(value: string, delay: number = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}
