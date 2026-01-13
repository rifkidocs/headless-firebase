import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ApiPermissions from '@/components/cms/ApiPermissions'
import { CollectionConfig } from '@/lib/types'
import { getPublicPermissions, updatePublicPermissions } from '@/lib/permissions'

// Mock the permissions library
jest.mock('@/lib/permissions', () => ({
  getPublicPermissions: jest.fn(),
  updatePublicPermissions: jest.fn(),
}))

const mockCollections: CollectionConfig[] = [
  {
    slug: 'posts',
    label: 'Posts',
    kind: 'collectionType',
    fields: [],
  },
  {
    slug: 'pages',
    label: 'Pages',
    kind: 'collectionType',
    fields: [],
  },
]

describe('ApiPermissions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(getPublicPermissions as jest.Mock).mockResolvedValue({
      find: false,
      findOne: false,
      create: false,
      update: false,
      delete: false,
    })
  })

  it('renders loading state initially', async () => {
    render(<ApiPermissions collections={mockCollections} />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders the list of collections after loading', async () => {
    render(<ApiPermissions collections={mockCollections} />)
    
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Posts')).toBeInTheDocument()
    expect(screen.getByText('Pages')).toBeInTheDocument()
  })

  it('renders the permission matrix for each collection', async () => {
    render(<ApiPermissions collections={mockCollections} />)

    await waitFor(() => {
      expect(screen.getByText('Posts')).toBeInTheDocument()
    })

    // Expand all collections
    const expandButtons = screen.getAllByRole('button', { name: /posts|pages/i })
    expandButtons.forEach(button => fireEvent.click(button))

    // Check for permission labels (should appear for each collection)
    const findCheckboxes = screen.getAllByLabelText(/^find$/i)
    expect(findCheckboxes).toHaveLength(mockCollections.length)
  })

  it('toggles permission when checkbox is clicked', async () => {
    render(<ApiPermissions collections={mockCollections} />)

    await waitFor(() => {
      expect(screen.getByText('Posts')).toBeInTheDocument()
    })

    // Expand Posts
    fireEvent.click(screen.getByText('Posts'))

    const findCheckboxes = screen.getAllByLabelText(/^find$/i)
    const postsFind = findCheckboxes[0]

    expect(postsFind).not.toBeChecked()
    fireEvent.click(postsFind)
    expect(postsFind).toBeChecked()
  })

  it('calls updatePublicPermissions when save button is clicked', async () => {
    render(<ApiPermissions collections={mockCollections} />)

    await waitFor(() => {
      expect(screen.getByText('Posts')).toBeInTheDocument()
    })

    // Expand Posts
    fireEvent.click(screen.getByText('Posts'))

    const findCheckboxes = screen.getAllByLabelText(/^find$/i)
    fireEvent.click(findCheckboxes[0]) // Toggle find for Posts

    const saveButton = screen.getByRole('button', { name: /save/i })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(updatePublicPermissions).toHaveBeenCalledWith('posts', expect.objectContaining({
        find: true
      }))
    })
  })
})
