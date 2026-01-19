import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StrictConfirmDialog } from '@/components/ui/StrictConfirmDialog';
import { jest } from '@jest/globals';

describe('StrictConfirmDialog', () => {
  const mockOnConfirm = jest.fn();
  const mockOnOpenChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with given props', () => {
    render(
      <StrictConfirmDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        title="Delete Item"
        description="This action is permanent."
        confirmText="Delete"
        expectedValue="test-collection"
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByText('Delete Item')).toBeDefined();
    expect(screen.getByText('This action is permanent.')).toBeDefined();
    expect(screen.getByPlaceholderText('Type "test-collection" to confirm')).toBeDefined();
    expect(screen.getByRole('button', { name: /delete/i })).toBeDisabled();
  });

  it('enables confirm button when correct value is typed', async () => {
    const user = userEvent.setup();
    render(
      <StrictConfirmDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        title="Delete Item"
        expectedValue="test-collection"
        onConfirm={mockOnConfirm}
      />
    );

    const input = screen.getByPlaceholderText('Type "test-collection" to confirm');
    const confirmBtn = screen.getByRole('button', { name: /confirm/i });

    expect(confirmBtn).toBeDisabled();

    await user.type(input, 'wrong-value');
    expect(confirmBtn).toBeDisabled();

    await user.clear(input);
    await user.type(input, 'test-collection');
    expect(confirmBtn).not.toBeDisabled();
  });

  it('calls onConfirm when confirm button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <StrictConfirmDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        title="Delete Item"
        expectedValue="test-collection"
        onConfirm={mockOnConfirm}
      />
    );

    const input = screen.getByPlaceholderText('Type "test-collection" to confirm');
    await user.type(input, 'test-collection');
    
    const confirmBtn = screen.getByRole('button', { name: /confirm/i });
    await user.click(confirmBtn);

    expect(mockOnConfirm).toHaveBeenCalled();
  });
});
