import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
import Landing from './pages/Landing'
import ReportForm from './pages/ReportForm'
import MapView from './pages/MapView'
import Feed from './pages/Feed'
import VolunteerDashboard from './pages/VolunteerDashboard'
import ReportDetail from './pages/ReportDetail'
import AuthModal from './components/AuthModal'
import './App.css'

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
      <ThemeProvider>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <Router>
              <AppContent />
            </Router>
          </QueryClientProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App