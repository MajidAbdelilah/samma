import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GameCreateForm from '@/components/Games/GameCreateForm';
import { useAuth } from '@/hooks/useAuth';
import { createApi } from '@/utils/api';

// Mock the hooks and utilities
jest.mock('@/hooks/useAuth');
jest.mock('@/utils/api');
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('GameCreateForm', () => {
  const mockUser = {
    id: 1,
    username: 'testuser',
  };

  const mockCategories = [
    { id: 1, name: 'Action' },
    { id: 2, name: 'Adventure' },
  ];

  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: mockUser,
    });

    (createApi as jest.Mock).mockReturnValue({
      post: jest.fn().mockResolvedValue({
        data: { slug: 'test-game' },
      }),
      get: jest.fn().mockResolvedValue({
        data: { results: mockCategories },
      }),
    });
  });

  it('renders the form correctly', async () => {
    jest.setTimeout(10000);
    render(<GameCreateForm />);
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    }, { timeout: 10000 });

    // Check for form fields
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/price/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
  });

  it('handles form submission correctly', async () => {
    jest.setTimeout(10000);
    jest.setTimeout(10000);
    const user = userEvent.setup();
    render(<GameCreateForm />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    }, { timeout: 5000 });

    // Fill in form fields
    await user.type(screen.getByLabelText(/^title/i), 'Test Game');
    await user.type(screen.getByLabelText(/^description/i), 'Test Description');
    await user.type(screen.getByLabelText(/^price/i), '9.99');
    await user.selectOptions(screen.getByLabelText(/^category/i), '1');

    // Create a mock file
    const file = new File(['test'], 'test.zip', { type: 'application/zip' });
    const gameFileInput = screen.getByLabelText(/game file/i);
    await user.upload(gameFileInput, file);

    // Submit form
    const submitButton = screen.getByRole('button', { name: /create/i });
    await user.click(submitButton);

    // Verify API call
    await waitFor(() => {
      expect(createApi().post).toHaveBeenCalledWith(
        '/games/',
        expect.any(FormData),
        expect.any(Object)
      );
    });
  });

  it('displays validation errors', async () => {
    jest.setTimeout(10000);
    jest.setTimeout(10000);
    const user = userEvent.setup();
    render(<GameCreateForm />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    }, { timeout: 10000 });

    // Submit without filling required fields
    const submitButton = screen.getByRole('button', { name: /create/i });
    await user.click(submitButton);

    // Check for HTML5 validation
    const titleInput = screen.getByLabelText('Title') as HTMLInputElement;
    const descriptionInput = screen.getByLabelText('Description') as HTMLInputElement;
    const priceInput = screen.getByLabelText('Price') as HTMLInputElement;
    
    await waitFor(() => {
      expect(titleInput.validity.valueMissing).toBe(true);
      expect(descriptionInput.validity.valueMissing).toBe(true);
      expect(priceInput.validity.valueMissing).toBe(true);
    }, { timeout: 10000 });
  });

  it('handles API errors correctly', async () => {
    jest.setTimeout(10000);
    jest.setTimeout(10000);
    const apiError = new Error('API Error');
    (createApi as jest.Mock).mockReturnValue({
      post: jest.fn().mockRejectedValue(apiError),
      get: jest.fn().mockResolvedValue({
        data: { results: mockCategories },
      }),
    });

    const user = userEvent.setup();
    render(<GameCreateForm />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    }, { timeout: 5000 });

    // Fill and submit form
    await user.type(screen.getByLabelText(/^title/i), 'Test Game');
    await user.type(screen.getByLabelText(/^description/i), 'Test Description');
    await user.type(screen.getByLabelText(/^price/i), '9.99');
    await user.selectOptions(screen.getByLabelText(/^category/i), '1');

    const submitButton = screen.getByRole('button', { name: /create/i });
    await user.click(submitButton);

    // Check for error message
    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
    });
  });
});
