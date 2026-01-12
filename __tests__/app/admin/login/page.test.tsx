import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from '@/app/admin/login/page'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
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

describe('LoginPage', () => {
  it('renders the login page', () => {
    render(<LoginPage />)
    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('types into the email input', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)
    const emailInput = screen.getByPlaceholderText(/name@company.com/i) as HTMLInputElement
    await user.type(emailInput, 'test@example.com')
    expect(emailInput.value).toBe('test@example.com')
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
})
