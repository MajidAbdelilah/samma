import { useState } from 'react';
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Avatar,
  Box,
  Text,
  useToast,
  FormErrorMessage,
  InputGroup,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useAuth } from '../../hooks/useAuth';

interface ProfileData {
  name: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  avatarUrl?: string;
}

const ProfileSettingsForm = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<ProfileData>>({});
  const [formData, setFormData] = useState<ProfileData>({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    avatarUrl: user?.avatarUrl,
  });

  const validateForm = () => {
    const newErrors: Partial<ProfileData> = {};

    if (!formData.name) newErrors.name = 'الاسم مطلوب';
    if (!formData.email) newErrors.email = 'البريد الإلكتروني مطلوب';
    if (formData.newPassword && formData.newPassword.length < 8) {
      newErrors.newPassword = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
    }
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'كلمات المرور غير متطابقة';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to update profile');

      toast({
        title: 'تم تحديث الملف الشخصي بنجاح',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'فشل تحديث الملف الشخصي',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload avatar');

      const { avatarUrl } = await response.json();
      setFormData(prev => ({ ...prev, avatarUrl }));

      toast({
        title: 'تم تحديث الصورة الشخصية بنجاح',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'فشل تحديث الصورة الشخصية',
        status: 'error',
        duration: 3000,
      });
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit} w="full" maxW="md" mx="auto">
      <VStack spacing={6} align="stretch">
        <Box textAlign="center">
          <Avatar
            size="2xl"
            src={formData.avatarUrl}
            name={formData.name}
            mb={4}
          />
          <Button
            as="label"
            size="sm"
            colorScheme="primary"
            cursor="pointer"
          >
            تغيير الصورة
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleAvatarChange}
            />
          </Button>
        </Box>

        <FormControl isInvalid={!!errors.name}>
          <FormLabel>الاسم</FormLabel>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <FormErrorMessage>{errors.name}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.email}>
          <FormLabel>البريد الإلكتروني</FormLabel>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <FormErrorMessage>{errors.email}</FormErrorMessage>
        </FormControl>

        <FormControl>
          <FormLabel>كلمة المرور الحالية</FormLabel>
          <InputGroup>
            <Input
              type={showPassword ? 'text' : 'password'}
              value={formData.currentPassword}
              onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
            />
            <InputRightElement>
              <IconButton
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                onClick={() => setShowPassword(!showPassword)}
                variant="ghost"
                size="sm"
              />
            </InputRightElement>
          </InputGroup>
        </FormControl>

        <FormControl isInvalid={!!errors.newPassword}>
          <FormLabel>كلمة المرور الجديدة</FormLabel>
          <Input
            type="password"
            value={formData.newPassword}
            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
          />
          <FormErrorMessage>{errors.newPassword}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.confirmPassword}>
          <FormLabel>تأكيد كلمة المرور الجديدة</FormLabel>
          <Input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          />
          <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
        </FormControl>

        <Button
          type="submit"
          colorScheme="primary"
          size="lg"
          isLoading={isLoading}
        >
          حفظ التغييرات
        </Button>
      </VStack>
    </Box>
  );
};

export default ProfileSettingsForm; 