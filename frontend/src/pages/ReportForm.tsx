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
import { useFormValidation } from '../hooks/useFormValidation'

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

  const validationConfig = {
    title: {
      required: true,
      minLength: 5,
      maxLength: 140,
    },
    description: {
      maxLength: 2000,
    },
    contact: {
      custom: (value: string) => {
        if (!anonymous && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && !/^\+?[\d\s-()]+$/.test(value)) {
          return 'Please enter a valid email or phone number'
        }
        return null
      },
    },
  }

  const { getFieldError, setFieldTouched, validate, isValid } = useFormValidation(validationConfig)

  const createReportMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
      const response = await fetch(`${apiBaseUrl}/api/v1/reports`, {
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

    // Mark all fields as touched for validation display
    setFieldTouched('title')
    setFieldTouched('description')
    if (!anonymous) {
      setFieldTouched('contact')
    }

    // Validate all fields
    const values = { title, description, contact }
    const validationErrors = validate(values)

    // Check location separately
    if (!location) {
      validationErrors.location = 'Location is required'
    }

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    const formData = new FormData()
    formData.append('title', title)
    formData.append('description', description)
    formData.append('lat', location!.lat.toString())
    formData.append('lng', location!.lng.toString())
    if (location!.accuracy) {
      formData.append('accuracy_m', location!.accuracy.toString())
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
              onChange={(value) => {
                setTitle(value)
                setFieldTouched('title')
              }}
              onBlur={() => setFieldTouched('title')}
              error={getFieldError('title')}
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
              onChange={(value) => {
                setDescription(value)
                setFieldTouched('description')
              }}
              onBlur={() => setFieldTouched('description')}
              error={getFieldError('description')}
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
              error={getFieldError('location')}
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
                onChange={(e) => {
                  setContact(e.target.value)
                  setFieldTouched('contact')
                }}
                onBlur={() => setFieldTouched('contact')}
                placeholder="Email or phone"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 ${
                  getFieldError('contact') ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                }`}
                disabled={createReportMutation.isPending}
                aria-describedby={getFieldError('contact') ? "contact-error" : undefined}
                aria-invalid={!!getFieldError('contact')}
              />
              {getFieldError('contact') && (
                <p id="contact-error" className="text-xs text-red-600 mt-1" role="alert">
                  {getFieldError('contact')}
                </p>
              )}
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
              disabled={createReportMutation.isPending || !isValid || !location}
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