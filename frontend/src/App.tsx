import { useState, lazy, Suspense } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
import AuthModal from './components/AuthModal'
import LoadingSpinner from './components/LoadingSpinner'
import './App.css'

// Lazy load pages for better bundle splitting
const Landing = lazy(() => import('./pages/Landing'))
const ReportForm = lazy(() => import('./pages/ReportForm'))
const MapView = lazy(() => import('./pages/MapView'))
const Feed = lazy(() => import('./pages/Feed'))
const VolunteerDashboard = lazy(() => import('./pages/VolunteerDashboard'))
const ReportDetail = lazy(() => import('./pages/ReportDetail'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (error instanceof Error && error.message.includes('4')) {
          return false
        }
        // Retry up to 3 times for network errors
        return failureCount < 3
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
    mutations: {
      retry: false, // Don't retry mutations by default
    },
  },
})

function AppContent() {
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const { login } = useAuth()

  const handleAuthSuccess = (token: string) => {
    login(token)
    queryClient.invalidateQueries()
  }

  return (
    <>
      <div className="min-h-screen bg-bg font-sans dark:bg-gray-900 dark:text-white">
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><LoadingSpinner size="lg" /></div>}>
          <Routes>
            <Route path="/" element={<Landing onAuthClick={() => setAuthModalOpen(true)} />} />
            <Route path="/report" element={<ReportForm />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/volunteer" element={
              <ProtectedRoute requiredRole="volunteer">
                <VolunteerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/reports/:id" element={<ReportDetail />} />
          </Routes>
        </Suspense>
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <Router>
              <AppContent />
            </Router>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App