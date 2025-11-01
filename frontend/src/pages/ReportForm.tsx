import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import CameraButton from '../components/CameraButton'
import TitleInput from '../components/TitleInput'
import DescriptionInput from '../components/DescriptionInput'
import LocationPicker from '../components/LocationPicker'

interface Location {
  lat: number
  lng: number
  accuracy?: number
}

const ReportForm = () => {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState<Location | null>(null)
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [anonymous, setAnonymous] = useState(true)
  const [contact, setContact] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const createReportMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('http://localhost:8000/api/v1/reports', {
        method: 'POST',
        body: formData,
      })
      if (!response.ok) {
        throw new Error('Failed to create report')
      }
      return response.json()
    },
    onSuccess: (data) => {
      // Copy tracking URL to clipboard
      navigator.clipboard.writeText(data.tracking_url)
      alert(`Report submitted! Tracking URL copied: ${data.tracking_url}`)
      navigate('/')
    },
    onError: (error) => {
      alert('Failed to submit report. Please try again.')
      console.error(error)
    },
  })

  const handleFileSelect = (file: File) => {
    setMediaFile(file)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      alert('Title is required')
      return
    }

    if (!location) {
      alert('Location is required')
      return
    }

    const formData = new FormData()
    formData.append('title', title)
    formData.append('description', description)
    formData.append('lat', location.lat.toString())
    formData.append('lng', location.lng.toString())
    if (location.accuracy) {
      formData.append('accuracy_m', location.accuracy.toString())
    }
    formData.append('anonymous', anonymous.toString())
    if (!anonymous && contact) {
      formData.append('reporter_contact', contact)
    }
    if (mediaFile) {
      formData.append('media', mediaFile)
    }

    createReportMutation.mutate(formData)
  }

  return (
    <div className="min-h-screen bg-bg p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-6">Report an Issue</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Camera Button */}
          <div className="flex justify-center">
            <CameraButton
              onFileSelect={handleFileSelect}
              disabled={createReportMutation.isPending}
            />
          </div>

          {/* Media Preview */}
          {previewUrl && (
            <div className="flex justify-center">
              <img
                src={previewUrl}
                alt="Selected media"
                className="w-32 h-32 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Title */}
          <TitleInput
            value={title}
            onChange={setTitle}
            disabled={createReportMutation.isPending}
          />

          {/* Description */}
          <DescriptionInput
            value={description}
            onChange={setDescription}
            disabled={createReportMutation.isPending}
          />

          {/* Location */}
          <LocationPicker
            location={location}
            onLocationChange={setLocation}
            disabled={createReportMutation.isPending}
          />

          {/* Anonymous Toggle */}
          <div className="flex items-center space-x-2">
            <input
              id="anonymous"
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
              disabled={createReportMutation.isPending}
              className="rounded"
            />
            <label htmlFor="anonymous" className="text-sm">
              Keep this report anonymous (default)
            </label>
          </div>

          {/* Contact Input */}
          {!anonymous && (
            <div>
              <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-1">
                Contact info (optional)
              </label>
              <input
                id="contact"
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Email or phone"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={createReportMutation.isPending}
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={createReportMutation.isPending || !title.trim() || !location}
            className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createReportMutation.isPending ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ReportForm