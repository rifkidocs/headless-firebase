import { render, screen } from '@testing-library/react'
import SchemaEmptyState from '@/components/cms/SchemaEmptyState'

describe('SchemaEmptyState', () => {
  it('renders the empty state message', () => {
    render(<SchemaEmptyState onAddField={() => {}} />)
    expect(screen.getByText(/Click "Add Field" to start/i)).toBeInTheDocument()
  })

  it('renders a button to add a field', () => {
    const handleAddField = jest.fn()
    render(<SchemaEmptyState onAddField={handleAddField} />)
    
    const button = screen.getByRole('button', { name: /add field/i })
    expect(button).toBeInTheDocument()
    
    button.click()
    expect(handleAddField).toHaveBeenCalled()
  })

  it('occupies the full width of the container', () => {
    const { container } = render(<SchemaEmptyState onAddField={() => {}} />)
    const wrapper = container.firstChild
    expect(wrapper).toHaveClass('flex')
  })
})
