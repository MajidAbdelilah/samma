import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChakraProvider } from '@chakra-ui/react';
import GameUploadForm from '@/components/Games/GameUploadForm';
import { AuthContext } from '@/hooks/useAuth';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;

// Mock environment variables
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000/api';

// Mock Chakra UI's toast
const mockToast = jest.fn();
jest.mock('@chakra-ui/react', () => {
  const originalModule = jest.requireActual('@chakra-ui/react');
  return {
    ...originalModule,
    useToast: () => mockToast,
  };
});

// Define User type
interface User {
  id: string;
  username: string;
  name: string;
  email: string;
}

// Define AuthContextType
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
}

// Mock auth state
const mockAuthState: AuthContextType = {
  isAuthenticated: true,
  user: {
    id: '1',
    username: 'testuser',
    name: 'Test User',
    email: 'test@example.com'
  },
  login: jest.fn(),
  logout: jest.fn(),
  register: jest.fn(),
};

describe('GameUploadForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset axios mocks
    mockAxios.post.mockReset();
    mockToast.mockReset();
  });

  const renderWithProviders = (ui: React.ReactElement, authState = mockAuthState) => {
    return render(
      <ChakraProvider>
        <AuthContext.Provider value={authState}>
          {ui}
        </AuthContext.Provider>
      </ChakraProvider>
    );
  };

  it('renders upload form correctly', () => {
    renderWithProviders(<GameUploadForm gameId="123" />);

    expect(screen.getByLabelText('ملف اللعبة (ZIP)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'اختر ملف' })).toBeInTheDocument();
  });

  it('handles file selection correctly', async () => {
    renderWithProviders(<GameUploadForm gameId="123" />);

    const file = new File(['game content'], 'game.zip', { type: 'application/zip' });
    const input = screen.getByTestId('file-input') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('game.zip')).toBeInTheDocument();
      expect(screen.getByText(/0\.\d+ MB/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'رفع الملف' })).toBeInTheDocument();
    });
  });

  it('validates file type', async () => {
    renderWithProviders(<GameUploadForm gameId="123" />);

    const file = new File(['invalid'], 'invalid.txt', { type: 'text/plain' });
    const input = screen.getByTestId('file-input') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('يجب أن يكون الملف بصيغة ZIP')).toBeInTheDocument();
    });
  });

  it('handles successful upload', async () => {
    const mockOnUploadComplete = jest.fn();
    mockAxios.post.mockResolvedValueOnce({ status: 200, data: {} });

    renderWithProviders(<GameUploadForm gameId="123" onUploadComplete={mockOnUploadComplete} />);

    const file = new File(['game content'], 'game.zip', { type: 'application/zip' });
    const input = screen.getByTestId('file-input') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'رفع الملف' })).toBeInTheDocument();
    });

    const uploadButton = screen.getByRole('button', { name: 'رفع الملف' });
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(mockAxios.post).toHaveBeenCalledWith(
        'http://localhost:3000/api/games/123/upload',
        expect.any(FormData),
        expect.objectContaining({
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: expect.any(Function),
        })
      );
      expect(mockOnUploadComplete).toHaveBeenCalled();
      expect(mockToast).toHaveBeenCalledWith({
        title: 'تم رفع الملف بنجاح',
        status: 'success',
        duration: 3000,
      });
    });
  });

  it('handles upload failure', async () => {
    mockAxios.post.mockRejectedValueOnce(new Error('Upload failed'));

    renderWithProviders(<GameUploadForm gameId="123" />);

    const file = new File(['game content'], 'game.zip', { type: 'application/zip' });
    const input = screen.getByTestId('file-input') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'رفع الملف' })).toBeInTheDocument();
    });

    const uploadButton = screen.getByRole('button', { name: 'رفع الملف' });
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'فشل رفع الملف',
        description: 'Upload failed',
        status: 'error',
        duration: 3000,
      });
    });
  });

  it('disables upload button while uploading', async () => {
    mockAxios.post.mockImplementationOnce(() => new Promise(() => {})); // Never resolves

    renderWithProviders(<GameUploadForm gameId="123" />);

    const file = new File(['game content'], 'game.zip', { type: 'application/zip' });
    const input = screen.getByTestId('file-input') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'رفع الملف' })).toBeInTheDocument();
    });

    const uploadButton = screen.getByRole('button', { name: 'رفع الملف' });
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(uploadButton).toBeDisabled();
    });
  });
}); 