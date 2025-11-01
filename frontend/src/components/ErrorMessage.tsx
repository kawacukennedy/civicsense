import { motion } from 'framer-motion'

interface ErrorMessageProps {
  message: string
  onRetry?: () => void
}

const ErrorMessage = ({ message, onRetry }: ErrorMessageProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-danger/10 border border-danger/20 rounded-lg p-4 text-center"
    >
      <div className="text-danger mb-2">
        <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <p className="text-danger font-medium mb-2">Something went wrong</p>
      <p className="text-sm text-muted mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-danger text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      )}
    </motion.div>
  )
}

export default ErrorMessage