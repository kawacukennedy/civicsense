import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'

interface Report {
  id: string
  title: string
  description: string
  lat: number
  lng: number
  status: string
  priority: { score: number; level: string }
  created_at: string
}

const VolunteerDashboard = () => {
  const queryClient = useQueryClient()

  const { data: reports, isLoading, error, refetch } = useQuery({
    queryKey: ['reports', 'high_priority'],
    queryFn: async () => {
      const response = await fetch('http://localhost:8000/api/v1/reports?status=verified')
      if (!response.ok) {
        throw new Error('Failed to fetch reports')
      }
      return response.json()
    },
  })

  const claimMutation = useMutation({
    mutationFn: async (_reportId: string) => {
      // Mock claim - in real app, this would be a POST request
      return { status: 'in_progress', assigned_to: 'volunteer@example.com' }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
  })

  const resolveMutation = useMutation({
    mutationFn: async (_reportId: string) => {
      // Mock resolve
      return { status: 'resolved' }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
  })

  const getPriorityColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-bg p-4 flex items-center justify-center"
      >
        <div className="text-center">
          <LoadingSpinner size="lg" message="Loading your dashboard..." />
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
        <div className="max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold mb-6"
          >
            Volunteer Dashboard
          </motion.h1>
          <ErrorMessage
            message="Failed to load dashboard. Please try again."
            onRetry={() => refetch()}
          />
        </div>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-bg p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Volunteer Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Reports List */}
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">High Priority Reports</h2>
            <div className="space-y-4">
              {reports?.data?.filter((r: Report) => r.priority.level === 'high').map((report: Report) => (
                <div key={report.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{report.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(report.priority.level)}`}>
                      {report.priority.level}
                    </span>
                  </div>
                  <p className="text-sm text-muted mb-2">{report.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted">Score: {report.priority.score}</span>
                    <div className="space-x-2">
                      <button
                        onClick={() => claimMutation.mutate(report.id)}
                        disabled={claimMutation.isPending}
                        className="bg-primary text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                      >
                        Claim
                      </button>
                      <button
                        onClick={() => resolveMutation.mutate(report.id)}
                        disabled={resolveMutation.isPending}
                        className="bg-success text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                      >
                        Resolve
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* My Tasks */}
          <div>
            <h2 className="text-xl font-semibold mb-4">My Tasks</h2>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-muted">No tasks assigned yet.</p>
              <p className="text-sm mt-2">Claim a report to get started!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VolunteerDashboard