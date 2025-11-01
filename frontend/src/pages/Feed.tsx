import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import SkeletonLoader from '../components/SkeletonLoader'

interface Report {
  id: string
  title: string
  lat: number
  lng: number
  status: string
  priority_score?: number
  priority?: { score: number; level: string }
  created_at: string
}

const Feed = () => {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [touchStartY, setTouchStartY] = useState(0)
  const [isPulling, setIsPulling] = useState(false)

  const { data: reports, isLoading, error, refetch } = useQuery({
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

  const confirmMutation = useMutation({
    mutationFn: async (reportId: string) => {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`${apiBaseUrl}/api/v1/reports/${reportId}/confirm`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        throw new Error('Failed to confirm report')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
  })

  const handlePullToRefresh = async () => {
    setIsRefreshing(true)
    await refetch()
    setIsRefreshing(false)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentY = e.touches[0].clientY
    const diff = currentY - touchStartY

    if (diff > 80 && window.scrollY === 0) {
      setIsPulling(true)
    } else {
      setIsPulling(false)
    }
  }

  const handleTouchEnd = () => {
    if (isPulling) {
      handlePullToRefresh()
    }
    setIsPulling(false)
  }

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
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
              >
                <SkeletonLoader lines={2} />
              </motion.div>
            ))}
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
            onRetry={() => refetch()}
          />
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="max-w-md mx-auto">
        {/* Pull to Refresh Indicator */}
        {(isRefreshing || isPulling) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center py-2 mb-4"
          >
            <LoadingSpinner size="sm" message={isRefreshing ? "Refreshing..." : "Pull to refresh"} />
          </motion.div>
        )}

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
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.1}
                onDragEnd={(_, info) => {
                  const swipeThreshold = 50
                  if (info.offset.x > swipeThreshold) {
                    // Swipe right - could implement previous report
                    console.log('Swipe right detected')
                  } else if (info.offset.x < -swipeThreshold) {
                    // Swipe left - could implement next report or action
                    console.log('Swipe left detected')
                  }
                }}
              >
                <Link to={`/reports/${report.id}`} className="block">
                  <motion.div
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700 p-5 transition-all duration-200 group"
                    whileHover={{ scale: 1.01, y: -1 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex items-start justify-between mb-3">
                       <h3 className="font-semibold text-lg flex-1 pr-2 text-gray-900 dark:text-white group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors leading-tight">
                         {report.title}
                       </h3>
                       <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(report.priority?.score ?? report.priority_score ?? 50)}`}>
                         {getPriorityLabel(report.priority?.score ?? report.priority_score ?? 50)}
                       </span>
                     </div>
                     <div className="flex items-center justify-between text-sm">
                       <span className="text-gray-500 dark:text-gray-400">{formatTimeAgo(report.created_at)}</span>
                       <div className="flex items-center space-x-3">
                         {isAuthenticated && (
                           <button
                             onClick={(e) => {
                               e.preventDefault()
                               confirmMutation.mutate(report.id)
                             }}
                             disabled={confirmMutation.isPending}
                             className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                           >
                             {confirmMutation.isPending ? 'Confirming...' : '👍 Confirm'}
                           </button>
                         )}
                         <span className="text-gray-600 dark:text-gray-300 font-medium group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                           View Details →
                         </span>
                       </div>
                     </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))
          )}
        </div>

        <motion.div
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
          initial={{ opacity: 0, scale: 0, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
        >
          <Link
            to="/report"
            className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 font-medium flex items-center space-x-2 hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Report Issue</span>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default Feed