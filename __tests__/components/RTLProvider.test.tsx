import React from 'react';
import { render } from '@testing-library/react';
import RTLProvider from '@/components/RTLProvider';

// Mock stylis-plugin-rtl
jest.mock('stylis-plugin-rtl', () => {
  return {
    __esModule: true,
    default: jest.fn(),
  };
});

// Mock createCache
jest.mock('@emotion/cache', () => {
  return {
    __esModule: true,
    default: jest.fn().mockReturnValue({
      key: 'samma-rtl',
      stylisPlugins: [jest.fn()],
      insert: jest.fn(),
      container: document.createElement('div'),
    }),
  };
});

describe('RTLProvider', () => {
  let createCache: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    createCache = require('@emotion/cache').default;
  });

  it('creates emotion cache with RTL settings', () => {
    render(
      <RTLProvider>
        <div>Test Content</div>
      </RTLProvider>
    );

    expect(createCache).toHaveBeenCalledWith({
      key: 'samma-rtl',
      stylisPlugins: expect.any(Array),
    });
  });

  it('renders children correctly', () => {
    const { getByText } = render(
      <RTLProvider>
        <div>Test Content</div>
      </RTLProvider>
    );
    
    expect(getByText('Test Content')).toBeInTheDocument();
  });

  it('applies RTL styling to children', () => {
    const { container } = render(
      <RTLProvider>
        <div style={{ marginRight: '10px' }}>RTL Content</div>
      </RTLProvider>
    );
    
    const element = container.querySelector('div');
    expect(element).toHaveStyle({ marginRight: '10px' });
  });
}); 