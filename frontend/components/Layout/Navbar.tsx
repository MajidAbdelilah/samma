import React from 'react';
import {
  Box,
  Flex,
  Button,
  Image,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Text,
  Avatar,
  useToast,
  Icon,
} from '@chakra-ui/react';
import { useAuth } from '../../hooks/useAuth';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { FaGamepad } from 'react-icons/fa';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const toast = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
      toast({
        title: 'تم تسجيل الخروج بنجاح',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'خطأ في تسجيل الخروج',
        status: 'error',
        duration: 3000,
      });
    }
  };

  return (
    <Box bg="white" boxShadow="sm" position="sticky" top={0} zIndex={1000}>
      <Flex
        maxW="container.xl"
        mx="auto"
        px={4}
        h="16"
        alignItems="center"
        justifyContent="space-between"
      >
        <Box as={Link} href="/" cursor="pointer">
          <Image src="/logo.svg" alt="Samma Store" h="8" />
        </Box>

        <HStack spacing={4}>
          {isAuthenticated ? (
            <>
              <Button
                as={Link}
                href="/games/create"
                colorScheme="green"
                leftIcon={<Icon as={FaGamepad} />}
              >
                نشر لعبة جديدة
              </Button>
              <Button as={Link} href="/games/discover" variant="ghost">
                اكتشف الألعاب
              </Button>
              <Menu>
                <MenuButton
                  as={Button}
                  rightIcon={<ChevronDownIcon />}
                  variant="ghost"
                >
                  <HStack>
                    <Avatar size="sm" name={user?.username} />
                    <Text>{user?.username}</Text>
                  </HStack>
                </MenuButton>
                <MenuList>
                  <MenuItem as={Link} href="/dashboard">
                    لوحة التحكم
                  </MenuItem>
                  <MenuItem as={Link} href="/profile">
                    الملف الشخصي
                  </MenuItem>
                  <MenuItem as={Link} href="/settings">
                    الإعدادات
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    تسجيل الخروج
                  </MenuItem>
                </MenuList>
              </Menu>
            </>
          ) : (
            <>
              <Button as={Link} href="/login" variant="ghost">
                تسجيل الدخول
              </Button>
              <Button as={Link} href="/register" colorScheme="blue">
                إنشاء حساب
              </Button>
            </>
          )}
        </HStack>
      </Flex>
    </Box>
  );
};

export default Navbar; 