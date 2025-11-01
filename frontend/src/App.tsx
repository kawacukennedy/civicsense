import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import Landing from './pages/Landing'
import ReportForm from './pages/ReportForm'
import MapView from './pages/MapView'
import Feed from './pages/Feed'
import VolunteerDashboard from './pages/VolunteerDashboard'
import ReportDetail from './pages/ReportDetail'
import './App.css'

const queryClient = new QueryClient()

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="min-h-screen bg-bg font-sans dark:bg-gray-900 dark:text-white">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/report" element={<ReportForm />} />
              <Route path="/map" element={<MapView />} />
              <Route path="/feed" element={<Feed />} />
              <Route path="/volunteer" element={<VolunteerDashboard />} />
              <Route path="/reports/:id" element={<ReportDetail />} />
            </Routes>
          </div>
        </Router>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App