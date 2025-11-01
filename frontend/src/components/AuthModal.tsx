import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import LoadingSpinner from './LoadingSpinner'
import ErrorMessage from './ErrorMessage'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (token: string) => void
}

const AuthModal = ({ isOpen, onClose, onSuccess }: AuthModalProps) => {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  })

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
      const response = await fetch(`${apiBaseUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: data.email,
          password: data.password,
        }),
      })
      if (!response.ok) {
        throw new Error('Login failed')
      }
      return response.json()
    },
    onSuccess: (data) => {
      localStorage.setItem('auth_token', data.access_token)
      onSuccess(data.access_token)
      onClose()
      setFormData({ email: '', password: '', name: '', confirmPassword: '' })
    },
  })

  const registerMutation = useMutation({
    mutationFn: async (data: { email: string; password: string; name: string }) => {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
      const response = await fetch(`${apiBaseUrl}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        throw new Error('Registration failed')
      }
      return response.json()
    },
    onSuccess: () => {
      // After successful registration, switch to login mode
      setMode('login')
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }))
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (mode === 'register') {
      if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match')
        return
      }
      if (formData.password.length < 6) {
        alert('Password must be at least 6 characters')
        return
      }
      registerMutation.mutate({
        email: formData.email,
        password: formData.password,
        name: formData.name,
      })
    } else {
      loginMutation.mutate({
        email: formData.email,
        password: formData.password,
      })
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'register' && (
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Full Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                    minLength={6}
                  />
                </div>

                {mode === 'register' && (
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Confirm Password
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                )}

                {/* Error Messages */}
                {loginMutation.isError && mode === 'login' && (
                  <ErrorMessage message="Invalid email or password. Please try again." />
                )}
                {registerMutation.isError && mode === 'register' && (
                  <ErrorMessage message="Registration failed. Email may already be in use." />
                )}
                {registerMutation.isSuccess && mode === 'register' && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 text-sm">Account created successfully! Please sign in.</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loginMutation.isPending || registerMutation.isPending}
                  className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {(loginMutation.isPending || registerMutation.isPending) && <LoadingSpinner size="sm" />}
                  <span>
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                  </span>
                </button>
              </form>

              {/* Mode Toggle */}
              <div className="mt-6 text-center">
                <button
                  onClick={() => {
                    setMode(mode === 'login' ? 'register' : 'login')
                    setFormData({ email: '', password: '', name: '', confirmPassword: '' })
                    loginMutation.reset()
                    registerMutation.reset()
                  }}
                  className="text-primary hover:underline text-sm"
                >
                  {mode === 'login'
                    ? "Don't have an account? Sign up"
                    : "Already have an account? Sign in"
                  }
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default AuthModal