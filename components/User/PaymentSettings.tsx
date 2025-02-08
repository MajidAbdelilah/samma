import { useState, useEffect } from 'react';
import {
  VStack,
  Box,
  Heading,
  Text,
  Button,
  useToast,
  Divider,
  HStack,
  Icon,
  Badge,
} from '@chakra-ui/react';
import { FaPaypal, FaCheckCircle } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';

interface PayPalAccount {
  email: string;
  isVerified: boolean;
  lastVerified: string;
}

const PaymentSettings = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [paypalAccount, setPaypalAccount] = useState<PayPalAccount | null>(null);

  useEffect(() => {
    fetchPayPalAccount();
  }, []);

  const fetchPayPalAccount = async () => {
    try {
      const response = await fetch('/api/user/payment/paypal');
      if (response.ok) {
        const data = await response.json();
        setPaypalAccount(data);
      }
    } catch (error) {
      console.error('Error fetching PayPal account:', error);
    }
  };

  const handleConnectPayPal = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would redirect to PayPal OAuth
      const response = await fetch('/api/user/payment/paypal/connect', {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to connect PayPal account');

      toast({
        title: 'تم ربط حساب PayPal بنجاح',
        status: 'success',
        duration: 3000,
      });

      await fetchPayPalAccount();
    } catch (error) {
      toast({
        title: 'فشل ربط حساب PayPal',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnectPayPal = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/payment/paypal/disconnect', {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to disconnect PayPal account');

      toast({
        title: 'تم فصل حساب PayPal بنجاح',
        status: 'success',
        duration: 3000,
      });

      setPaypalAccount(null);
    } catch (error) {
      toast({
        title: 'فشل فصل حساب PayPal',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <VStack spacing={8} align="stretch">
      <Box>
        <Heading size="md" mb={4}>حساب PayPal</Heading>
        {paypalAccount ? (
          <Box p={4} borderWidth={1} rounded="md">
            <HStack spacing={4} mb={4}>
              <Icon as={FaPaypal} boxSize={6} color="blue.500" />
              <VStack align="start" spacing={1}>
                <Text fontWeight="bold">{paypalAccount.email}</Text>
                <HStack>
                  <Badge colorScheme={paypalAccount.isVerified ? 'green' : 'yellow'}>
                    {paypalAccount.isVerified ? 'تم التحقق' : 'في انتظار التحقق'}
                  </Badge>
                  {paypalAccount.isVerified && (
                    <Icon as={FaCheckCircle} color="green.500" />
                  )}
                </HStack>
              </VStack>
            </HStack>
            <Text fontSize="sm" color="gray.600" mb={4}>
              آخر تحقق: {new Date(paypalAccount.lastVerified).toLocaleDateString('ar-SA')}
            </Text>
            <Button
              colorScheme="red"
              variant="outline"
              onClick={handleDisconnectPayPal}
              isLoading={isLoading}
            >
              فصل الحساب
            </Button>
          </Box>
        ) : (
          <Box p={4} borderWidth={1} rounded="md">
            <Text mb={4}>
              قم بربط حساب PayPal لتتمكن من استلام المدفوعات من مبيعات الألعاب.
            </Text>
            <Button
              leftIcon={<Icon as={FaPaypal} />}
              colorScheme="blue"
              onClick={handleConnectPayPal}
              isLoading={isLoading}
            >
              ربط حساب PayPal
            </Button>
          </Box>
        )}
      </Box>

      <Divider />

      <Box>
        <Heading size="md" mb={4}>سجل المدفوعات</Heading>
        <Box p={4} borderWidth={1} rounded="md">
          <Text color="gray.600">
            يمكنك مراجعة سجل المدفوعات الخاص بك في لوحة التحكم.
          </Text>
          <Button
            mt={4}
            variant="outline"
            onClick={() => window.location.href = '/dashboard/payments'}
          >
            عرض سجل المدفوعات
          </Button>
        </Box>
      </Box>

      <Box>
        <Heading size="md" mb={4}>إعدادات الدفع</Heading>
        <Box p={4} borderWidth={1} rounded="md">
          <VStack align="stretch" spacing={4}>
            <Text fontWeight="bold">العملة الافتراضية</Text>
            <Text>USD - دولار أمريكي</Text>
            <Text fontSize="sm" color="gray.600">
              جميع المعاملات تتم بالدولار الأمريكي حالياً
            </Text>
          </VStack>
        </Box>
      </Box>
    </VStack>
  );
};

export default PaymentSettings; 