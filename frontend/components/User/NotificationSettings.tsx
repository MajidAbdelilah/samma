import { useState } from 'react';
import {
  VStack,
  FormControl,
  FormLabel,
  Switch,
  Button,
  useToast,
} from '@chakra-ui/react';

interface NotificationPreferences {
  emailNotifications: boolean;
  salesUpdates: boolean;
  newComments: boolean;
  newRatings: boolean;
  marketingEmails: boolean;
}

const NotificationSettings = () => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailNotifications: true,
    salesUpdates: true,
    newComments: true,
    newRatings: true,
    marketingEmails: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/user/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) throw new Error('Failed to update preferences');

      toast({
        title: 'تم تحديث إعدادات الإشعارات',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'فشل تحديث إعدادات الإشعارات',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <VStack as="form" onSubmit={handleSubmit} spacing={6} align="stretch">
      <FormControl display="flex" alignItems="center">
        <Switch
          id="email-notifications"
          isChecked={preferences.emailNotifications}
          onChange={(e) =>
            setPreferences({ ...preferences, emailNotifications: e.target.checked })
          }
          mr={4}
        />
        <FormLabel htmlFor="email-notifications" mb={0}>
          تفعيل الإشعارات عبر البريد الإلكتروني
        </FormLabel>
      </FormControl>

      <FormControl display="flex" alignItems="center">
        <Switch
          id="sales-updates"
          isChecked={preferences.salesUpdates}
          onChange={(e) =>
            setPreferences({ ...preferences, salesUpdates: e.target.checked })
          }
          mr={4}
        />
        <FormLabel htmlFor="sales-updates" mb={0}>
          تحديثات المبيعات
        </FormLabel>
      </FormControl>

      <FormControl display="flex" alignItems="center">
        <Switch
          id="new-comments"
          isChecked={preferences.newComments}
          onChange={(e) =>
            setPreferences({ ...preferences, newComments: e.target.checked })
          }
          mr={4}
        />
        <FormLabel htmlFor="new-comments" mb={0}>
          التعليقات الجديدة
        </FormLabel>
      </FormControl>

      <FormControl display="flex" alignItems="center">
        <Switch
          id="new-ratings"
          isChecked={preferences.newRatings}
          onChange={(e) =>
            setPreferences({ ...preferences, newRatings: e.target.checked })
          }
          mr={4}
        />
        <FormLabel htmlFor="new-ratings" mb={0}>
          التقييمات الجديدة
        </FormLabel>
      </FormControl>

      <FormControl display="flex" alignItems="center">
        <Switch
          id="marketing-emails"
          isChecked={preferences.marketingEmails}
          onChange={(e) =>
            setPreferences({ ...preferences, marketingEmails: e.target.checked })
          }
          mr={4}
        />
        <FormLabel htmlFor="marketing-emails" mb={0}>
          رسائل تسويقية
        </FormLabel>
      </FormControl>

      <Button
        type="submit"
        colorScheme="primary"
        isLoading={isLoading}
      >
        حفظ التغييرات
      </Button>
    </VStack>
  );
};

export default NotificationSettings; 