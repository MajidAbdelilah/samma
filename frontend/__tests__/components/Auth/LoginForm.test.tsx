import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider, useToast } from '@chakra-ui/react';
import LoginForm from '@/components/Auth/LoginForm';
import { createApi } from '@/utils/api';
import { useRouter } from 'next/router';
import userEvent from '@testing-library/user-event';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: jest.fn()
}));

// Mock the API
jest.mock('@/utils/api');

describe('LoginForm', () => {
  const mockRouter = {
    push: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  const renderLoginForm = () => {
    return render(
      <ChakraProvider>
        <LoginForm />
      </ChakraProvider>
    );
  };

  it('renders login form correctly', () => {
    renderLoginForm();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('handles successful login', async () => {
    jest.setTimeout(10000);
    jest.setTimeout(10000);
    const user = userEvent.setup();
    (createApi as jest.Mock).mockImplementation(() => ({
      post: jest.fn().mockResolvedValue({
        data: {
          token: 'test-token',
          user: {
            id: 1,
            username: 'testuser'
          }
        }
      })
    }));

    renderLoginForm();

    await user.type(screen.getByLabelText(/email/i), 'testuser');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
    }, { timeout: 10000 });
  });

  it('displays error message on failed login', async () => {
    jest.setTimeout(10000);
    jest.setTimeout(10000);
    const user = userEvent.setup();
    (createApi as jest.Mock).mockImplementation(() => ({
      post: jest.fn().mockRejectedValue({
        response: {
          data: {
            detail: 'Invalid credentials'
          }
        }
      })
    }));

    renderLoginForm();

    await user.type(screen.getByLabelText(/email/i), 'wronguser');
    await user.type(screen.getByLabelText(/password/i), 'wrongpass');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid email or password');
    }, { timeout: 10000 });
  });

  it('validates required fields', async () => {
    renderLoginForm();
    
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Check for HTML5 validation messages
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
    expect(emailInput.validity.valueMissing).toBe(true);
    expect(passwordInput.validity.valueMissing).toBe(true);
    expect(emailInput.validationMessage).toBeTruthy();
    expect(passwordInput.validationMessage).toBeTruthy();
  });

  it('handles network errors', async () => {
    jest.setTimeout(10000);
    jest.setTimeout(10000);
    const user = userEvent.setup();
    (createApi as jest.Mock).mockImplementation(() => ({
      post: jest.fn().mockRejectedValue({
        message: 'Network Error'
      })
    }));

    renderLoginForm();

    await user.type(screen.getByLabelText(/email/i), 'testuser');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid email or password');
    }, { timeout: 10000 });
  });
});
