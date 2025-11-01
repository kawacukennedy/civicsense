import { useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface CameraButtonProps {
  onFileSelect: (file: File) => void
  disabled?: boolean
}

const CameraButton = ({ onFileSelect, disabled }: CameraButtonProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isPulsing, setIsPulsing] = useState(true)

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onFileSelect(file)
      setIsPulsing(false)
    }
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <motion.button
        onClick={handleClick}
        disabled={disabled}
        className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white shadow-lg disabled:opacity-50"
        animate={isPulsing ? { scale: [1, 1.06, 1] } : {}}
        transition={{ duration: 2, repeat: isPulsing ? Infinity : 0 }}
        aria-label="Attach photo or video"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </motion.button>
      <p className="text-sm text-muted text-center">Tap to attach photo<br />(optional)</p>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
      />
    </div>
  )
}

export default CameraButton