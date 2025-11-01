import { motion } from 'framer-motion'

interface SuccessMessageProps {
  message: string
  onClose?: () => void
}

const SuccessMessage = ({ message, onClose }: SuccessMessageProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-success/10 border border-success/20 rounded-lg p-4 text-center"
    >
      <div className="text-success mb-2">
        <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p className="text-success font-medium mb-2">Success!</p>
      <p className="text-sm text-muted">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="mt-4 text-success hover:underline text-sm"
        >
          Close
        </button>
      )}
    </motion.div>
  )
}

export default SuccessMessage