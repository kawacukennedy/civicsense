import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import LoadingSpinner from './LoadingSpinner'
import ErrorMessage from './ErrorMessage'
import { useFormValidation } from '../hooks/useFormValidation'

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

  const validationConfig = {
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: {
      required: true,
      minLength: 6,
    },
    name: {
      required: mode === 'register',
      minLength: mode === 'register' ? 2 : 0,
    },
    confirmPassword: {
      required: mode === 'register',
      custom: (value: string) => {
        if (mode === 'register' && value !== formData.password) {
          return 'Passwords do not match'
        }
        return null
      },
    },
  }

  const { getFieldError, setFieldTouched, validate, isValid } = useFormValidation(validationConfig)

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

    // Mark all fields as touched for validation display
    Object.keys(validationConfig).forEach(field => setFieldTouched(field))

    // Validate all fields
    const validationErrors = validate(formData)

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    if (mode === 'register') {
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
    setFieldTouched(field)
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
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
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
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      onBlur={() => setFieldTouched('name')}
                      className={`w-full px-3 py-3 border rounded-lg transition-colors dark:bg-gray-700 dark:text-white ${
                        getFieldError('name')
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 dark:border-gray-600 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-gray-900 dark:focus:border-gray-100'
                      }`}
                      placeholder="Enter your full name"
                      required={mode === 'register'}
                    />
                    {getFieldError('name') && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{getFieldError('name')}</p>
                    )}
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    onBlur={() => setFieldTouched('email')}
                    className={`w-full px-3 py-3 border rounded-lg transition-colors dark:bg-gray-700 dark:text-white ${
                      getFieldError('email')
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 dark:border-gray-600 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-gray-900 dark:focus:border-gray-100'
                    }`}
                    placeholder="Enter your email"
                    required
                  />
                  {getFieldError('email') && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{getFieldError('email')}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    onBlur={() => setFieldTouched('password')}
                    className={`w-full px-3 py-3 border rounded-lg transition-colors dark:bg-gray-700 dark:text-white ${
                      getFieldError('password')
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 dark:border-gray-600 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-gray-900 dark:focus:border-gray-100'
                    }`}
                    placeholder="Enter your password"
                    required
                  />
                  {getFieldError('password') && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{getFieldError('password')}</p>
                  )}
                  {mode === 'register' && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Must be at least 6 characters</p>
                  )}
                </div>

                {mode === 'register' && (
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirm Password
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      onBlur={() => setFieldTouched('confirmPassword')}
                      className={`w-full px-3 py-3 border rounded-lg transition-colors dark:bg-gray-700 dark:text-white ${
                        getFieldError('confirmPassword')
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 dark:border-gray-600 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-gray-900 dark:focus:border-gray-100'
                      }`}
                      placeholder="Confirm your password"
                      required={mode === 'register'}
                    />
                    {getFieldError('confirmPassword') && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{getFieldError('confirmPassword')}</p>
                    )}
                  </div>
                )}

                {/* Status Messages */}
                <AnimatePresence>
                  {loginMutation.isError && mode === 'login' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                    >
                      <p className="text-red-800 dark:text-red-200 text-sm font-medium">Invalid email or password</p>
                      <p className="text-red-700 dark:text-red-300 text-xs mt-1">Please check your credentials and try again</p>
                    </motion.div>
                  )}

                  {registerMutation.isError && mode === 'register' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                    >
                      <p className="text-red-800 dark:text-red-200 text-sm font-medium">Registration failed</p>
                      <p className="text-red-700 dark:text-red-300 text-xs mt-1">This email may already be in use</p>
                    </motion.div>
                  )}

                  {registerMutation.isSuccess && mode === 'register' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                    >
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <div>
                          <p className="text-green-800 dark:text-green-200 text-sm font-medium">Account created successfully!</p>
                          <p className="text-green-700 dark:text-green-300 text-xs mt-1">Please sign in with your credentials</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={loginMutation.isPending || registerMutation.isPending || !isValid}
                  className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all duration-200 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {(loginMutation.isPending || registerMutation.isPending) && <LoadingSpinner size="sm" />}
                  <span>
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                  </span>
                  {!loginMutation.isPending && !registerMutation.isPending && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  )}
                </motion.button>
              </form>

              {/* Mode Toggle */}
              <div className="mt-8 text-center">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                      {mode === 'login' ? "New to CivicSense?" : "Already have an account?"}
                    </span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setMode(mode === 'login' ? 'register' : 'login')
                    setFormData({ email: '', password: '', name: '', confirmPassword: '' })
                    loginMutation.reset()
                    registerMutation.reset()
                    // Reset validation state
                    Object.keys(validationConfig).forEach(field => {
                      // Reset touched state by clearing errors
                    })
                  }}
                  className="mt-4 text-gray-900 dark:text-white font-semibold hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                >
                  {mode === 'login' ? "Create an account" : "Sign in instead"}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default AuthModal