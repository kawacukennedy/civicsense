import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import ReportForm from './pages/ReportForm'
import MapView from './pages/MapView'
import Feed from './pages/Feed'
import './App.css'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-bg font-sans">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/report" element={<ReportForm />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/feed" element={<Feed />} />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  )
}

export default App