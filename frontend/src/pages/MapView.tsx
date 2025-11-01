import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { useQuery } from '@tanstack/react-query'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface Report {
  id: string
  title: string
  lat: number
  lng: number
  status: string
  priority_score: number
}

const MapView = () => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)

  const { data: reports, isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const response = await fetch('http://localhost:8000/api/v1/reports')
      if (!response.ok) {
        throw new Error('Failed to fetch reports')
      }
      return response.json()
    },
  })

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude])
        },
        (error) => {
          console.error('Error getting location:', error)
        }
      )
    }
  }, [])

  const getPriorityColor = (score: number) => {
    if (score >= 67) return 'red'
    if (score >= 34) return 'orange'
    return 'gray'
  }

  return (
    <div className="h-screen relative">
      <MapContainer
        center={userLocation || [40.7128, -74.0060]} // Default to NYC
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {reports?.data?.map((report: Report) => (
          <Marker
            key={report.id}
            position={[report.lat, report.lng]}
            icon={L.divIcon({
              className: 'custom-marker',
              html: `<div style="background-color: ${getPriorityColor(report.priority_score)}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>`,
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            })}
          >
            <Popup>
              <div>
                <h3 className="font-semibold">{report.title}</h3>
                <p>Priority: {report.priority_score}</p>
                <p>Status: {report.status}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {userLocation && (
          <Marker position={userLocation}>
            <Popup>You are here</Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Floating action button */}
      <button
        onClick={() => window.location.href = '/report'}
        className="absolute bottom-6 right-6 w-14 h-14 bg-primary rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-700"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  )
}

export default MapView