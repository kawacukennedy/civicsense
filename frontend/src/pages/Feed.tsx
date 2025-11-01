import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'

interface Report {
  id: string
  title: string
  lat: number
  lng: number
  status: string
  priority_score: number
  created_at: string
}

const Feed = () => {
  const { data: reports, isLoading, error } = useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const response = await fetch('http://localhost:8000/api/v1/reports')
      if (!response.ok) {
        throw new Error('Failed to fetch reports')
      }
      return response.json()
    },
  })

  const getPriorityColor = (score: number) => {
    if (score >= 67) return 'bg-danger'
    if (score >= 34) return 'bg-accent'
    return 'bg-muted'
  }

  const getPriorityLabel = (score: number) => {
    if (score >= 67) return 'High'
    if (score >= 34) return 'Medium'
    return 'Low'
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) return `${diffDays}d ago`
    if (diffHours > 0) return `${diffHours}h ago`
    return 'Just now'
  }

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-bg p-4"
      >
        <div className="max-w-md mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold mb-4"
          >
            Public Feed
          </motion.h1>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-lg shadow p-4"
              >
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <LoadingSpinner message="Loading reports..." />
          </div>
        </div>
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-bg p-4"
      >
        <div className="max-w-md mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold mb-4"
          >
            Public Feed
          </motion.h1>
          <ErrorMessage
            message="Failed to load reports. Please check your connection and try again."
            onRetry={() => window.location.reload()}
          />
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-bg p-4"
    >
      <div className="max-w-md mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold mb-4"
        >
          Public Feed
        </motion.h1>

        <div className="space-y-4">
          {reports?.data?.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <p className="text-muted">No reports yet. Be the first to report an issue!</p>
              <Link
                to="/report"
                className="inline-block mt-4 bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Report Issue
              </Link>
            </motion.div>
          ) : (
            reports?.data?.map((report: Report, index: number) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={`/reports/${report.id}`} className="block">
                  <motion.div
                    className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg flex-1 pr-2">{report.title}</h3>
                      <span className={`px-2 py-1 rounded text-xs text-white ${getPriorityColor(report.priority?.score || report.priority_score)}`}>
                        {getPriorityLabel(report.priority?.score || report.priority_score)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted">
                      <span>{formatTimeAgo(report.created_at)}</span>
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            // Handle confirm
                          }}
                          className="text-primary hover:underline"
                        >
                          👍 Confirm
                        </button>
                        <span className="text-primary">View Details →</span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))
          )}
        </div>

        <motion.div
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Link
            to="/report"
            className="bg-primary text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          >
            Report Issue
          </Link>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default Feed