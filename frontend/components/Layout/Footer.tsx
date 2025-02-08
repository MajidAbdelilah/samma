import React from 'react';
import {
  Box,
  Container,
  SimpleGrid,
  Stack,
  Text,
  Flex,
  useColorModeValue,
  Heading,
  Icon,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { FaTwitter, FaYoutube, FaInstagram, FaDiscord } from 'react-icons/fa';
import Link from 'next/link';

const ListHeader = ({ children }: { children: React.ReactNode }) => {
  return (
    <Text fontWeight={'500'} fontSize={'lg'} mb={2}>
      {children}
    </Text>
  );
};

const Footer = () => {
  return (
    <Box
      bg={useColorModeValue('gray.50', 'gray.900')}
      color={useColorModeValue('gray.700', 'gray.200')}
      borderTopWidth={1}
      borderColor={useColorModeValue('gray.200', 'gray.700')}
    >
      <Container as={Stack} maxW={'container.xl'} py={10}>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={8}>
          <Stack align={'flex-start'}>
            <ListHeader>عن سماء</ListHeader>
            <ChakraLink as={Link} href="/about">
              من نحن
            </ChakraLink>
            <ChakraLink as={Link} href="/contact">
              اتصل بنا
            </ChakraLink>
            <ChakraLink as={Link} href="/careers">
              الوظائف
            </ChakraLink>
          </Stack>

          <Stack align={'flex-start'}>
            <ListHeader>المساعدة</ListHeader>
            <ChakraLink as={Link} href="/faq">
              الأسئلة الشائعة
            </ChakraLink>
            <ChakraLink as={Link} href="/support">
              الدعم الفني
            </ChakraLink>
            <ChakraLink as={Link} href="/refund-policy">
              سياسة الاسترجاع
            </ChakraLink>
          </Stack>

          <Stack align={'flex-start'}>
            <ListHeader>القانونية</ListHeader>
            <ChakraLink as={Link} href="/terms">
              الشروط والأحكام
            </ChakraLink>
            <ChakraLink as={Link} href="/privacy">
              سياسة الخصوصية
            </ChakraLink>
            <ChakraLink as={Link} href="/cookies">
              سياسة ملفات تعريف الارتباط
            </ChakraLink>
          </Stack>

          <Stack align={'flex-start'}>
            <ListHeader>تابعنا</ListHeader>
            <Stack direction={'row'} spacing={6}>
              <ChakraLink href={'#'} isExternal>
                <Icon as={FaTwitter} w={6} h={6} />
              </ChakraLink>
              <ChakraLink href={'#'} isExternal>
                <Icon as={FaYoutube} w={6} h={6} />
              </ChakraLink>
              <ChakraLink href={'#'} isExternal>
                <Icon as={FaInstagram} w={6} h={6} />
              </ChakraLink>
              <ChakraLink href={'#'} isExternal>
                <Icon as={FaDiscord} w={6} h={6} />
              </ChakraLink>
            </Stack>
          </Stack>
        </SimpleGrid>
      </Container>
      
      <Box py={4} borderTopWidth={1} borderColor={useColorModeValue('gray.200', 'gray.700')}>
        <Container maxW={'container.xl'}>
          <Text textAlign={'center'}>
            © {new Date().getFullYear()} سماء. جميع الحقوق محفوظة
          </Text>
        </Container>
      </Box>
    </Box>
  );
};

export default Footer; 