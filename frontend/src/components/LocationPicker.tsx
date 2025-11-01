import { useState, useEffect } from 'react'

interface Location {
  lat: number
  lng: number
  accuracy?: number
}

interface LocationPickerProps {
  location: Location | null
  onLocationChange: (location: Location) => void
  error?: string | null
  disabled?: boolean
}

const LocationPicker = ({ location, onLocationChange, error: propError, disabled }: LocationPickerProps) => {
  const [loading, setLoading] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.')
      return
    }

    setLoading(true)
    setLocationError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        }
        onLocationChange(newLocation)
        setLoading(false)
      },
      () => {
        setLocationError('Unable to retrieve your location.')
        setLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  useEffect(() => {
    if (!location) {
      getCurrentLocation()
    }
  }, [])

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Location
      </label>
      <div className="space-y-2">
        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={disabled || loading}
          className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 disabled:opacity-50"
        >
          {loading ? 'Getting location...' : 'Use my location'}
        </button>
        {location && (
          <div className="text-sm text-muted">
            Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
            {location.accuracy && ` (±${location.accuracy.toFixed(0)}m)`}
          </div>
        )}
        {locationError && (
          <div className="text-sm text-danger">{locationError}</div>
        )}
        <button
          type="button"
          className="text-sm text-primary hover:underline"
          disabled={disabled}
        >
          Tap map to drop pin (coming soon)
        </button>
        {propError && (
          <p className="text-xs text-red-600 mt-1" role="alert">
            {propError}
          </p>
        )}
      </div>
    </div>
  )
}

export default LocationPicker