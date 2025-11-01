import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import TitleInput from '../TitleInput'

describe('TitleInput', () => {
  it('renders with placeholder', () => {
    render(<TitleInput value="" onChange={() => {}} />)
    expect(screen.getByPlaceholderText('e.g., Flooding on Main St near Market')).toBeInTheDocument()
  })

  it('calls onChange when typing', () => {
    const mockOnChange = vi.fn()
    render(<TitleInput value="" onChange={mockOnChange} />)

    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'Test title' } })

    expect(mockOnChange).toHaveBeenCalledWith('Test title')
  })

  it('shows hint text', () => {
    render(<TitleInput value="" onChange={() => {}} />)
    expect(screen.getByText('Make it short and specific (e.g., \'Pothole outside #12 Market St\')')).toBeInTheDocument()
  })
})