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

  it('occupies the full height of the container', () => {
    const { container } = render(<SchemaEmptyState onAddField={() => {}} />)
    // We expect the container or the main element to have h-full or similar class
    // Depending on implementation, we can check for specific class names or styles
    // For now, let's assume we use Tailwind's h-full or min-h-screen or similar logic on the wrapper
    const wrapper = container.firstChild
    expect(wrapper).toHaveClass('h-full')
    expect(wrapper).toHaveClass('min-h-[50vh]') // Minimum height requirement or similar
  })
})
