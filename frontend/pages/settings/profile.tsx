import {
  Container,
  Box,
  Heading,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from '@chakra-ui/react';
import MainLayout from '../../components/Layout/MainLayout';
import ProfileSettingsForm from '../../components/User/ProfileSettingsForm';
import NotificationSettings from '../../components/User/NotificationSettings';
import PaymentSettings from '../../components/User/PaymentSettings';

const ProfileSettings = () => {
  return (
    <MainLayout>
      <Container maxW="container.xl" py={8}>
        <Box bg="white" p={6} rounded="lg" shadow="md">
          <Heading mb={6}>إعدادات الحساب</Heading>
          
          <Tabs colorScheme="primary">
            <TabList>
              <Tab>الملف الشخصي</Tab>
              <Tab>الإشعارات</Tab>
              <Tab>الدفع</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <ProfileSettingsForm />
              </TabPanel>
              <TabPanel>
                <NotificationSettings />
              </TabPanel>
              <TabPanel>
                <PaymentSettings />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Container>
    </MainLayout>
  );
};

export default ProfileSettings; 