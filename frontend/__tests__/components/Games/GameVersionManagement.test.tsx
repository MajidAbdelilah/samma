import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChakraProvider } from '@chakra-ui/react';
import GameVersionManagement from '@/components/Games/GameVersionManagement';
import { createApi } from '@/utils/api';
import { GameVersion } from '@/types';

// Mock the API
jest.mock('@/utils/api');

const mockVersions: GameVersion[] = [
  {
    id: 1,
    version: '1.0.0',
    release_notes: 'Initial release',
    download_url: 'https://example.com/game-v1.0.0.zip',
    created_at: '2025-02-10T17:00:00Z',
    file_size: 1024000,
    is_active: true
  },
  {
    id: 2,
    version: '1.1.0',
    release_notes: 'Bug fixes and improvements',
    download_url: 'https://example.com/game-v1.1.0.zip',
    created_at: '2025-02-10T18:00:00Z',
    file_size: 1048576,
    is_active: true
  }
];

describe('GameVersionManagement', () => {
  const mockGameId = 1;
  const mockOnVersionUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (createApi as jest.Mock).mockImplementation(() => ({
      get: jest.fn().mockResolvedValue({ data: { results: mockVersions } }),
      post: jest.fn().mockResolvedValue({ data: mockVersions[0] }),
      patch: jest.fn().mockResolvedValue({ data: mockVersions[0] }),
      delete: jest.fn().mockResolvedValue({})
    }));
  });

  const renderVersionManagement = () => {
    return render(
      <ChakraProvider>
        <GameVersionManagement
          gameId={mockGameId}
          onVersionUpdate={mockOnVersionUpdate}
        />
      </ChakraProvider>
    );
  };

  it('renders version list correctly', async () => {
    renderVersionManagement();

    await waitFor(() => {
      expect(screen.getByText('1.0.0')).toBeInTheDocument();
      expect(screen.getByText('1.1.0')).toBeInTheDocument();
    });

    expect(screen.getByText('Initial release')).toBeInTheDocument();
    expect(screen.getByText('Bug fixes and improvements')).toBeInTheDocument();
  });

  it('handles file size limit', async () => {
    renderVersionManagement();

    await waitFor(() => {
      // Use queryAllByText to handle multiple elements with the same text
      const fileSizeElements = screen.queryAllByText(/\d+(\.\d+)? MB/);
      expect(fileSizeElements.length).toBeGreaterThan(0);
    });
  });

  it('handles version deletion', async () => {
    jest.setTimeout(10000);
    jest.setTimeout(10000);
    const user = userEvent.setup();
    renderVersionManagement();

    await waitFor(() => {
      expect(screen.getByText('1.0.0')).toBeInTheDocument();
    });

    const deleteButton = screen.getAllByRole('button', { name: /Delete/i })[0];
    await user.click(deleteButton);

    await waitFor(() => {
      expect(createApi().delete).toHaveBeenCalledWith(
        `/games/${mockGameId}/versions/1`
      );
      expect(mockOnVersionUpdate).toHaveBeenCalled();
    });
  });

  it('prevents deletion of active version', async () => {
    // Mock the latest version as active
    const versionsWithActive = mockVersions.map(v => ({
      ...v,
      is_active: v.version === '1.1.0'
    }));

    (createApi as jest.Mock).mockImplementation(() => ({
      get: jest.fn().mockResolvedValue({ data: { results: versionsWithActive } })
    }));

    renderVersionManagement();

    await waitFor(() => {
      expect(screen.getByText('1.1.0')).toBeInTheDocument();
    });

    const deleteButton = screen.getAllByText('Delete')[1];
    expect(deleteButton).toBeDisabled();
  });

  it('handles network errors gracefully', async () => {
    jest.setTimeout(10000);
    (createApi as jest.Mock).mockImplementation(() => ({
      get: jest.fn().mockRejectedValue(new Error('Network error')),
      delete: jest.fn().mockRejectedValue(new Error('Network error'))
    }));

    renderVersionManagement();

    await waitFor(() => {
      expect(screen.getByText('Error loading versions')).toBeInTheDocument();
    }, { timeout: 10000 });
  });
});
