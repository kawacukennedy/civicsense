interface TitleInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

const TitleInput = ({ value, onChange, disabled }: TitleInputProps) => {
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
        disabled={disabled}
        maxLength={140}
        placeholder="e.g., Flooding on Main St near Market"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
        required
        aria-describedby="title-hint"
      />
      <p id="title-hint" className="text-xs text-muted mt-1">
        Make it short and specific (e.g., 'Pothole outside #12 Market St')
      </p>
    </div>
  )
}

export default TitleInput