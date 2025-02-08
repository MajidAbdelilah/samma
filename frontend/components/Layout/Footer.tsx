import { Box, Container, Stack, Text, Link } from '@chakra-ui/react';

const Footer = () => {
  return (
    <Box bg="gray.50" color="gray.700" mt="auto">
      <Container maxW="container.xl" py={8}>
        <Stack spacing={4} direction={{ base: 'column', md: 'row' }} justify="space-between" align="center">
          <Text>© {new Date().getFullYear()} سما ستور. جميع الحقوق محفوظة</Text>
          <Stack direction="row" spacing={6}>
            <Link href="/about">عن سما</Link>
            <Link href="/privacy">سياسة الخصوصية</Link>
            <Link href="/terms">الشروط والأحكام</Link>
            <Link href="/contact">اتصل بنا</Link>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer; 