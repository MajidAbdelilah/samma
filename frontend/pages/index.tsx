import type { NextPage } from 'next';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Button,
  VStack,
  HStack,
  Image,
  useColorModeValue,
  Flex,
  Icon,
  Link as ChakraLink,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { FaGamepad, FaSearch, FaShoppingCart, FaStar } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';

const Feature = ({ icon, title, text }: { icon: any; title: string; text: string }) => {
  return (
    <VStack
      align="center"
      p={6}
      bg={useColorModeValue('white', 'gray.800')}
      rounded="xl"
      shadow="md"
      borderWidth="1px"
      spacing={4}
    >
      <Icon as={icon} w={10} h={10} color="blue.500" />
      <Text fontWeight="bold" fontSize="xl" textAlign="center">
        {title}
      </Text>
      <Text textAlign="center" color={useColorModeValue('gray.600', 'gray.300')}>
        {text}
      </Text>
    </VStack>
  );
};

const Home: NextPage = () => {
  const { isAuthenticated } = useAuth();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box>
      {/* Hero Section */}
      <Box bg={bgColor} py={20}>
        <Container maxW="container.xl">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10} alignItems="center">
            <VStack align="flex-start" spacing={6}>
              <Heading as="h1" size="2xl">
                متجر الألعاب الرقمية العربي الأول
              </Heading>
              <Text fontSize="xl" color={useColorModeValue('gray.600', 'gray.300')}>
                اكتشف مجموعة واسعة من الألعاب الرقمية بأسعار تنافسية
              </Text>
              <HStack spacing={4}>
                {!isAuthenticated ? (
                  <>
                    <NextLink href="/register" passHref legacyBehavior>
                      <Button as="a" colorScheme="blue" size="lg">
                        سجل الآن
                      </Button>
                    </NextLink>
                    <NextLink href="/login" passHref legacyBehavior>
                      <Button as="a" variant="outline" size="lg">
                        تسجيل الدخول
                      </Button>
                    </NextLink>
                  </>
                ) : (
                  <NextLink href="/dashboard" passHref legacyBehavior>
                    <Button as="a" colorScheme="blue" size="lg">
                      لوحة التحكم
                    </Button>
                  </NextLink>
                )}
              </HStack>
            </VStack>
            <Flex justify="center">
              <Image
                src="/logo.svg"
                alt="Samma Store Logo"
                width={400}
                height={400}
                objectFit="contain"
              />
            </Flex>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxW="container.xl" py={20}>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
          <Feature
            icon={FaGamepad}
            title="مجموعة متنوعة"
            text="آلاف الألعاب من مختلف الفئات والتصنيفات"
          />
          <Feature
            icon={FaShoppingCart}
            title="شراء آمن"
            text="دفع آمن وسريع مع دعم متعدد طرق الدفع"
          />
          <Feature
            icon={FaStar}
            title="تقييمات موثوقة"
            text="تقييمات وآراء حقيقية من مجتمع اللاعبين"
          />
        </SimpleGrid>
      </Container>

      {/* Footer */}
      <Box borderTopWidth={1} borderColor={borderColor} py={8}>
        <Container maxW="container.xl">
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={8}>
            <VStack align="flex-start">
              <Heading size="md">عن سماء</Heading>
              <NextLink href="/about" passHref legacyBehavior>
                <ChakraLink>من نحن</ChakraLink>
              </NextLink>
              <NextLink href="/contact" passHref legacyBehavior>
                <ChakraLink>اتصل بنا</ChakraLink>
              </NextLink>
            </VStack>
            <VStack align="flex-start">
              <Heading size="md">المساعدة</Heading>
              <NextLink href="/faq" passHref legacyBehavior>
                <ChakraLink>الأسئلة الشائعة</ChakraLink>
              </NextLink>
              <NextLink href="/support" passHref legacyBehavior>
                <ChakraLink>الدعم الفني</ChakraLink>
              </NextLink>
            </VStack>
            <VStack align="flex-start">
              <Heading size="md">القانونية</Heading>
              <NextLink href="/terms" passHref legacyBehavior>
                <ChakraLink>الشروط والأحكام</ChakraLink>
              </NextLink>
              <NextLink href="/privacy" passHref legacyBehavior>
                <ChakraLink>سياسة الخصوصية</ChakraLink>
              </NextLink>
            </VStack>
            <VStack align="flex-start">
              <Heading size="md">تابعنا</Heading>
              <HStack spacing={4}>
                <ChakraLink href="#" isExternal>
                  <Icon as={FaGamepad} w={6} h={6} />
                </ChakraLink>
                <ChakraLink href="#" isExternal>
                  <Icon as={FaSearch} w={6} h={6} />
                </ChakraLink>
              </HStack>
            </VStack>
          </SimpleGrid>
          <Text mt={8} textAlign="center" color={useColorModeValue('gray.600', 'gray.400')}>
            © {new Date().getFullYear()} سماء. جميع الحقوق محفوظة
          </Text>
        </Container>
      </Box>
    </Box>
  );
};

export default Home; 