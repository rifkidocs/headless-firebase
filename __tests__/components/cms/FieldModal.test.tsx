import { render, screen, waitFor } from '@testing-library/react'
import FieldModal from '@/components/cms/FieldModal'

describe('FieldModal', () => {
  const mockOnClose = jest.fn()
  const mockOnSelect = jest.fn()

  it('renders nothing when closed', () => {
    render(<FieldModal isOpen={false} onClose={mockOnClose} onSelect={mockOnSelect} />)
    expect(screen.queryByText(/Select Field Type/i)).not.toBeInTheDocument()
  })

  it('renders the modal when open', () => {
    render(<FieldModal isOpen={true} onClose={mockOnClose} onSelect={mockOnSelect} />)
    expect(screen.getByText(/Select Field Type/i)).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    render(<FieldModal isOpen={true} onClose={mockOnClose} onSelect={mockOnSelect} />)
    const closeButton = screen.getByRole('button', { name: /close/i })
    closeButton.click()
    expect(mockOnClose).toHaveBeenCalled()
  })

  // We will test the auto-focus and grid layout in the implementation phase
})
