import { render, screen, waitFor } from '@testing-library/react'
import { reorder } from '@/lib/utils'

// We will mock the drag-and-drop interactions in unit tests.
// Here we verify that the state logic holds up.

describe('Schema Editor Integration Flow', () => {
  it('reorders fields correctly using the utility', () => {
    let fields = [
      { id: '1', name: 'Field 1' },
      { id: '2', name: 'Field 2' },
      { id: '3', name: 'Field 3' },
    ]

    // Simulate drag Field 1 to position 2 (index 0 to 2)
    fields = reorder(fields, 0, 2)
    
    expect(fields[0].id).toBe('2')
    expect(fields[1].id).toBe('3')
    expect(fields[2].id).toBe('1')
  })
})
