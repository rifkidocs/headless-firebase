import { jest } from '@jest/globals';

// Mock fetch before anything else
const mockFetch = jest.fn();
global.fetch = mockFetch as any;

// Mock Firebase entirely
jest.mock('firebase/app', () => ({ initializeApp: jest.fn(), getApps: jest.fn(() => []), getApp: jest.fn() }));
jest.mock('firebase/auth', () => ({ getAuth: jest.fn() }));
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  onSnapshot: jest.fn((q, cb: any) => {
    cb({
      docs: [
        { id: 'posts', data: () => ({ label: 'Posts', kind: 'collectionType', fields: [] }) }
      ]
    });
    return jest.fn();
  }),
  query: jest.fn(),
  orderBy: jest.fn(),
  doc: jest.fn(),
  deleteDoc: jest.fn(),
}));

jest.mock('@/lib/firebase', () => ({
  auth: {
    currentUser: {
      getIdToken: jest.fn(() => Promise.resolve('mock-token'))
    }
  },
  db: {}
}));

// Mock toast
jest.mock('@/components/ui/Toast', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('SchemaListPage Deletion Integration', () => {
  let SchemaListPage: any;

  beforeAll(() => {
    // @ts-ignore
    SchemaListPage = require('@/app/admin/schema/page').default;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockReset();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
  });

  it('uses StrictConfirmDialog and calls the delete API', async () => {
    const user = userEvent.setup();
    render(<SchemaListPage />);

    // Find and click delete button for 'Posts'
    const deleteBtn = await screen.findByTitle('Delete');
    await user.click(deleteBtn);

    // Verify StrictConfirmDialog is shown
    expect(screen.getByText(/Please type/)).toBeDefined();
    const input = screen.getByPlaceholderText(/Type "Posts" to confirm/);
    const confirmBtn = screen.getByRole('button', { name: /delete/i });

    expect(confirmBtn).toBeDisabled();

    // Type correct name
    await user.type(input, 'Posts');
    expect(confirmBtn).not.toBeDisabled();

    await user.click(confirmBtn);

    // Verify API call
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/schema/posts',
      expect.objectContaining({
        method: 'DELETE',
        headers: expect.objectContaining({
          'Authorization': 'Bearer mock-token'
        })
      })
    );

    // Verify success toast
    await waitFor(() => {
      const { toast } = require('@/components/ui/Toast');
      expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('successfully'));
    });
  });
});
