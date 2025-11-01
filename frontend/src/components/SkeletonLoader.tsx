import { motion } from 'framer-motion'

interface SkeletonLoaderProps {
  className?: string
  lines?: number
  showAvatar?: boolean
}

const SkeletonLoader = ({ className = "", lines = 3, showAvatar = false }: SkeletonLoaderProps) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {showAvatar && (
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      )}
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="h-4 bg-gray-200 dark:bg-gray-700 rounded"
            style={{ width: `${Math.random() * 40 + 60}%` }}
          />
        ))}
      </div>
    </div>
  )
}

export default SkeletonLoader