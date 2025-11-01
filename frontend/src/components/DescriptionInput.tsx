interface DescriptionInputProps {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string | null
  disabled?: boolean
}

const DescriptionInput = ({ value, onChange, onBlur, error, disabled }: DescriptionInputProps) => {
  return (
    <div>
      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
        Add details (optional)
      </label>
      <textarea
        id="description"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        disabled={disabled}
        maxLength={2000}
        rows={3}
        placeholder="When did it start? Are people at risk? Landmarks."
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 resize-none ${
          error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
        }`}
        aria-describedby={error ? "description-error" : undefined}
        aria-invalid={!!error}
      />
      {error && (
        <p id="description-error" className="text-xs text-red-600 mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export default DescriptionInput