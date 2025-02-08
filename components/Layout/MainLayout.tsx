import React from 'react';
import { Box, Container } from '@chakra-ui/react';
import Navbar from './Navbar';
import Footer from './Footer';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      <Navbar />
      <Container maxW="container.xl" flex="1" py={8}>
        {children}
      </Container>
      <Footer />
    </Box>
  );
};

export default MainLayout; 