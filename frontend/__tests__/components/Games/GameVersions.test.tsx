import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import GameVersions from '@/components/Games/GameVersions';

global.fetch = jest.fn();

describe('GameVersions', () => {
  const mockVersions = [
    {
      id: '1',
      version: '1.0.0',
      notes: 'Initial release',
      uploadedAt: '2025-02-10T10:00:00Z',
      fileSize: 1024,
      downloadCount: 100,
      isActive: true,
      downloadUrl: 'https://example.com/v1.0.0.zip'
    },
    {
      id: '2',
      version: '1.1.0',
      notes: 'Bug fixes',
      uploadedAt: '2025-02-10T11:00:00Z',
      fileSize: 2048,
      downloadCount: 50,
      isActive: false,
      downloadUrl: 'https://example.com/v1.1.0.zip'
    },
  ];

  const mockProps = {
    gameId: '123',
    versions: mockVersions,
    onVersionDelete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it('renders version list correctly', () => {
    render(
      <ChakraProvider>
        <GameVersions {...mockProps} />
      </ChakraProvider>
    );

    // Check table headers
    expect(screen.getByText('الإصدار')).toBeInTheDocument();
    expect(screen.getByText('تاريخ الرفع')).toBeInTheDocument();
    expect(screen.getByText('حجم الملف')).toBeInTheDocument();
    expect(screen.getByText('عدد التحميلات')).toBeInTheDocument();
    expect(screen.getByText('الحالة')).toBeInTheDocument();
    expect(screen.getByText('الإجراءات')).toBeInTheDocument();

    // Check version details
    mockVersions.forEach(version => {
      expect(screen.getByText(version.version)).toBeInTheDocument();
      expect(screen.getByText(version.notes)).toBeInTheDocument();
      expect(screen.getByText(version.downloadCount.toString())).toBeInTheDocument();
      expect(screen.getByText(version.isActive ? 'نشط' : 'غير نشط')).toBeInTheDocument();
    });
  });

  it('handles version deletion correctly', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

    render(
      <ChakraProvider>
        <GameVersions {...mockProps} />
      </ChakraProvider>
    );

    // Click delete button for first version
    const deleteButtons = screen.getAllByText('حذف');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `${process.env.NEXT_PUBLIC_API_URL}/games/123/versions/1`,
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });

    expect(mockProps.onVersionDelete).toHaveBeenCalledWith('1');
  });

  it('handles deletion API error correctly', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    render(
      <ChakraProvider>
        <GameVersions {...mockProps} />
      </ChakraProvider>
    );

    // Click delete button
    const deleteButtons = screen.getAllByText('حذف');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('فشل حذف الإصدار')).toBeInTheDocument();
    });

    expect(mockProps.onVersionDelete).not.toHaveBeenCalled();
  });

  it('opens download URL when download button is clicked', () => {
    const windowSpy = jest.spyOn(window, 'open').mockImplementation();

    render(
      <ChakraProvider>
        <GameVersions {...mockProps} />
      </ChakraProvider>
    );

    // Click download button for first version
    const downloadButtons = screen.getAllByText('تحميل');
    fireEvent.click(downloadButtons[0]);

    expect(windowSpy).toHaveBeenCalledWith(mockVersions[0].downloadUrl);
    windowSpy.mockRestore();
  });

  it('formats file sizes correctly', () => {
    render(
      <ChakraProvider>
        <GameVersions {...mockProps} />
      </ChakraProvider>
    );

    expect(screen.getByText('1 KB')).toBeInTheDocument();
    expect(screen.getByText('2 KB')).toBeInTheDocument();
  });
});
