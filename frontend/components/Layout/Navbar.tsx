import React from 'react';
import {
  Box,
  Flex,
  Button,
  Image,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
} from '@chakra-ui/react';
import { useAuth } from '../../hooks/useAuth';
import Link from 'next/link';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box bg="white" boxShadow="sm">
      <Flex
        maxW="container.xl"
        mx="auto"
        px={4}
        h="16"
        alignItems="center"
        justifyContent="space-between"
      >
        <Link href="/">
          <Image src="/logo.png" alt="Samma Store" h="8" />
        </Link>

        <HStack spacing={4}>
          {isAuthenticated ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost">لوحة التحكم</Button>
              </Link>
              <Menu>
                <MenuButton as={Button}>
                  {user?.name}
                </MenuButton>
                <MenuList>
                  <MenuItem onClick={logout}>تسجيل الخروج</MenuItem>
                </MenuList>
              </Menu>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">تسجيل الدخول</Button>
              </Link>
              <Link href="/register">
                <Button colorScheme="primary">إنشاء حساب</Button>
              </Link>
            </>
          )}
        </HStack>
      </Flex>
    </Box>
  );
};

export default Navbar; 