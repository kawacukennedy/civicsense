import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'

const ReportDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: report, isLoading } = useQuery({
    queryKey: ['report', id],
    queryFn: async () => {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
      const response = await fetch(`${apiBaseUrl}/api/v1/reports/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch report')
      }
      return response.json()
    },
  })

  const messageMutation = useMutation({
    mutationFn: async (format: string) => {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
      const response = await fetch(`${apiBaseUrl}/api/v1/reports/${id}/message?format=${format}`)
      if (!response.ok) {
        throw new Error('Failed to generate message')
      }
      return response.json()
    },
    onSuccess: (data) => {
      if (data.mailto) {
        window.location.href = data.mailto
      } else if (data.wa_link) {
        window.open(data.wa_link, '_blank')
      }
    },
  })

  if (isLoading) {
    return <div className="p-4">Loading report...</div>
  }

  if (!report) {
    return <div className="p-4">Report not found</div>
  }

  return (
    <div className="min-h-screen bg-bg p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow">
        <div className="p-4">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 text-primary hover:underline"
          >
            ← Back
          </button>

          <h1 className="text-xl font-bold mb-4">{report.title}</h1>

          {report.description && (
            <p className="text-muted mb-4">{report.description}</p>
          )}

          <div className="mb-4">
            <h3 className="font-semibold mb-2">Location</h3>
            <p className="text-sm">Lat: {report.lat}, Lng: {report.lng}</p>
          </div>

          {report.media_urls.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Media</h3>
              {report.media_urls.map((url: string, index: number) => (
                <img
                  key={index}
                  src={`http://localhost:8000${url}`}
                  alt="Report media"
                  className="w-full rounded-lg mb-2"
                />
              ))}
            </div>
          )}

          <div className="mb-4">
            <h3 className="font-semibold mb-2">Verification</h3>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm">Score: {report.verification.score}</p>
              <p className="text-sm">Labels: {report.verification.labels.join(', ')}</p>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold mb-2">Priority</h3>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm">Level: {report.priority.level}</p>
              <p className="text-sm">Score: {report.priority.score}</p>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => messageMutation.mutate('mailto')}
              disabled={messageMutation.isPending}
              className="w-full bg-primary text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Send via Email
            </button>
            <button
              onClick={() => messageMutation.mutate('whatsapp')}
              disabled={messageMutation.isPending}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              Send via WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportDetail