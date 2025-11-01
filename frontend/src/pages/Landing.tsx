import { Link } from 'react-router-dom'

const Landing = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary mb-4">CivicSense</h1>
        <p className="text-lg text-muted">Report civic problems in 30 seconds</p>
      </header>

      <div className="text-center mb-8">
        <Link
          to="/report"
          className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Report Issue
        </Link>
      </div>

      <div className="text-center">
        <p className="mb-4">Anonymous by default — verified by AI.</p>
        <div className="flex justify-center space-x-4">
          <Link to="/map" className="text-primary hover:underline">View Map</Link>
          <Link to="/feed" className="text-primary hover:underline">Browse Reports</Link>
        </div>
      </div>
    </div>
  )
}

export default Landing