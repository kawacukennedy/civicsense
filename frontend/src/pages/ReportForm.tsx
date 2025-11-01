import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import CameraButton from '../components/CameraButton'
import TitleInput from '../components/TitleInput'
import DescriptionInput from '../components/DescriptionInput'
import LocationPicker from '../components/LocationPicker'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import SuccessMessage from '../components/SuccessMessage'

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
  const [showSuccess, setShowSuccess] = useState(false)

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
      setShowSuccess(true)
      setTimeout(() => {
        navigate('/')
      }, 3000)
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

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-bg p-4 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto"
        >
          <SuccessMessage
            message="Your report has been submitted successfully! The tracking URL has been copied to your clipboard."
            onClose={() => navigate('/')}
          />
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-bg p-4"
    >
      <div className="max-w-md mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl font-bold text-center mb-6"
        >
          Report an Issue
        </motion.h1>

        {createReportMutation.isError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6"
          >
            <ErrorMessage
              message="Failed to submit report. Please check your connection and try again."
              onRetry={() => createReportMutation.reset()}
            />
          </motion.div>
        )}

        <motion.form
          onSubmit={handleSubmit}
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* Camera Button */}
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <CameraButton
              onFileSelect={handleFileSelect}
              disabled={createReportMutation.isPending}
            />
          </motion.div>

          {/* Media Preview */}
          {previewUrl && (
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <img
                src={previewUrl}
                alt="Selected media"
                className="w-32 h-32 object-cover rounded-lg shadow-md"
              />
            </motion.div>
          )}

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <TitleInput
              value={title}
              onChange={setTitle}
              disabled={createReportMutation.isPending}
            />
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <DescriptionInput
              value={description}
              onChange={setDescription}
              disabled={createReportMutation.isPending}
            />
          </motion.div>

          {/* Location */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <LocationPicker
              location={location}
              onLocationChange={setLocation}
              disabled={createReportMutation.isPending}
            />
          </motion.div>

          {/* Anonymous Toggle */}
          <motion.div
            className="flex items-center space-x-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
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
          </motion.div>

          {/* Contact Input */}
          {!anonymous && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
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
            </motion.div>
          )}

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <motion.button
              type="submit"
              disabled={createReportMutation.isPending || !title.trim() || !location}
              className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {createReportMutation.isPending ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Submitting Report...</span>
                </>
              ) : (
                <span>Submit Report</span>
              )}
            </motion.button>
          </motion.div>
        </motion.form>
      </div>
    </motion.div>
  )
}

export default ReportForm