import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import ThemeToggle from '../components/ThemeToggle'

interface LandingProps {
  onAuthClick: () => void
}

const Landing = ({ onAuthClick }: LandingProps) => {
  const { user, logout, isAuthenticated } = useAuth()
  const { data: reports } = useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
      const response = await fetch(`${apiBaseUrl}/api/v1/reports`)
      if (!response.ok) {
        throw new Error('Failed to fetch reports')
      }
      return response.json()
    },
  })

  const reportCount = reports?.data?.length || 0

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-primary">CivicSense</h1>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              {isAuthenticated ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:inline">
                    Hi, {user?.name}
                  </span>
                  <button
                    onClick={logout}
                    className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={onAuthClick}
                  className="text-sm bg-primary text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
          {/* Navigation Links */}
          <nav className="flex space-x-4 mt-3 overflow-x-auto">
            <Link to="/map" className="text-primary hover:underline text-sm dark:text-blue-400 whitespace-nowrap">Map</Link>
            <Link to="/feed" className="text-primary hover:underline text-sm dark:text-blue-400 whitespace-nowrap">Feed</Link>
            {isAuthenticated && user?.role === 'volunteer' && (
              <Link to="/volunteer" className="text-primary hover:underline text-sm dark:text-blue-400 whitespace-nowrap">Dashboard</Link>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <div className="px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Report civic problems in 30 seconds</h2>
        <p className="text-muted mb-6">Anonymous by default — verified by AI.</p>

        <Link
          to="/report"
          className="inline-block bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg"
        >
          Report Issue
        </Link>
      </div>

      {/* Stats */}
      <div className="px-4 pb-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl font-bold text-primary mb-2">{reportCount}</div>
          <div className="text-muted">Reports submitted</div>
        </div>
      </div>

      {/* How it works */}
      <div className="px-4 pb-8">
        <h3 className="text-xl font-bold text-center mb-6">How it works</h3>
        <div className="max-w-md mx-auto space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">1</div>
            <div>
              <div className="font-semibold">Report</div>
              <div className="text-sm text-muted">One-screen reporting with photo</div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">2</div>
            <div>
              <div className="font-semibold">Verify</div>
              <div className="text-sm text-muted">AI analyzes and prioritizes</div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">3</div>
            <div>
              <div className="font-semibold">Send</div>
              <div className="text-sm text-muted">Action-ready message to authorities</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t px-4 py-4 text-center text-sm text-muted">
        <div className="max-w-md mx-auto">
          <p>Built with ❤️ for public good</p>
          <a href="https://github.com/kawacukennedy/civicsense" className="text-primary hover:underline">View on GitHub</a>
        </div>
      </footer>
    </div>
  )
}

export default Landing