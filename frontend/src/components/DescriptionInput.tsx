interface DescriptionInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

const DescriptionInput = ({ value, onChange, disabled }: DescriptionInputProps) => {
  return (
    <div>
      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
        Add details (optional)
      </label>
      <textarea
        id="description"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        maxLength={2000}
        rows={3}
        placeholder="When did it start? Are people at risk? Landmarks."
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 resize-none"
      />
    </div>
  )
}

export default DescriptionInput