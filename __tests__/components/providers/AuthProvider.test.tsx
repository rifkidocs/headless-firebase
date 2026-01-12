import { render, screen, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/components/providers/AuthProvider'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

// Mock firebase/auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  onAuthStateChanged: jest.fn(),
}))

// Mock the firebase lib
jest.mock('@/lib/firebase', () => ({
  auth: {},
}))

const TestComponent = () => {
  const { user, loading } = useAuth()
  if (loading) return <div>Loading...</div>
  return <div>{user ? `User: ${user.email}` : 'No User'}</div>
}

describe('AuthProvider', () => {
  it('renders children and provides auth state', async () => {
    const mockUser = { email: 'test@example.com' }
    // Mock implementation of onAuthStateChanged
    ;(onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
      callback(mockUser) // Simulate user signed in
      return jest.fn() // Unsubscribe function
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('User: test@example.com')).toBeInTheDocument()
    })
  })

  it('handles loading state', () => {
     // Mock implementation that doesn't callback immediately
     ;(onAuthStateChanged as jest.Mock).mockImplementation(() => jest.fn())

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })
})
