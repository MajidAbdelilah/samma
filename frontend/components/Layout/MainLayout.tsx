import React from 'react';
import { Box } from '@chakra-ui/react';
import Navbar from './Navbar';
import Footer from './Footer';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <Box minH="100vh" bg="gray.50" display="flex" flexDirection="column">
      <Navbar />
      <Box as="main" py={4} flex="1">
        {children}
      </Box>
      <Footer />
    </Box>
  );
};

export default MainLayout; 