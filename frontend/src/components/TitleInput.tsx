interface TitleInputProps {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string | null
  disabled?: boolean
}

const TitleInput = ({ value, onChange, onBlur, error, disabled }: TitleInputProps) => {
  return (
    <div>
      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
        Short title (required)
      </label>
      <input
        id="title"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        disabled={disabled}
        maxLength={140}
        placeholder="e.g., Flooding on Main St near Market"
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 ${
          error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
        }`}
        required
        aria-describedby={error ? "title-error title-hint" : "title-hint"}
        aria-invalid={!!error}
      />
      {error && (
        <p id="title-error" className="text-xs text-red-600 mt-1" role="alert">
          {error}
        </p>
      )}
      <p id="title-hint" className="text-xs text-muted mt-1">
        Make it short and specific (e.g., 'Pothole outside #12 Market St')
      </p>
    </div>
  )
}

export default TitleInput