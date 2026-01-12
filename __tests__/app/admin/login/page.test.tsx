import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from '@/app/admin/login/page'
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'

// Mock next/navigation
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock firebase/auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signInWithPopup: jest.fn(),
  GoogleAuthProvider: jest.fn(),
}))

// Mock the firebase lib
jest.mock('@/lib/firebase', () => ({
  auth: {},
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

// Mock custom toast
const mockToastError = jest.fn()
const mockToastSuccess = jest.fn()
jest.mock('@/components/ui/Toast', () => ({
  toast: {
    error: (msg: string) => mockToastError(msg),
    success: (msg: string) => mockToastSuccess(msg),
  },
}))

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the login page', () => {
    render(<LoginPage />)
    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('calls signInWithEmailAndPassword with correct arguments on submit', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)
    
    await user.type(screen.getByPlaceholderText(/name@company.com/i), 'test@example.com')
    await user.type(screen.getByPlaceholderText(/••••••••/i), 'password123')
    
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), 'test@example.com', 'password123')
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/admin')
    })
  })

  it('handles Firebase errors correctly', async () => {
    const user = userEvent.setup()
    ;(signInWithEmailAndPassword as jest.Mock).mockRejectedValue({ code: 'auth/invalid-credential' })
    
    render(<LoginPage />)
    
    await user.type(screen.getByPlaceholderText(/name@company.com/i), 'wrong@example.com')
    await user.type(screen.getByPlaceholderText(/••••••••/i), 'wrongpass')
    
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(expect.stringMatching(/invalid/i))
    })
  })

  it('shows validation error for invalid email', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)
    
    const emailInput = screen.getByPlaceholderText(/name@company.com/i)
    await user.type(emailInput, 'invalid-email')
    
    const error = await screen.findByTestId('email-error')
    expect(error).toHaveTextContent(/invalid email address/i)
  })

  it('shows validation error for short password', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)
    
    const passwordInput = screen.getByPlaceholderText(/••••••••/i)
    await user.type(passwordInput, '123')
    
    const error = await screen.findByText(/password must be at least 6 characters/i)
    expect(error).toBeInTheDocument()
  })

  it('calls signInWithPopup with GoogleAuthProvider on Google login click', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)
    
    await user.click(screen.getByRole('button', { name: /google account/i }))

    expect(signInWithPopup).toHaveBeenCalledWith(expect.anything(), expect.any(GoogleAuthProvider))
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/admin')
    })
  })
})
