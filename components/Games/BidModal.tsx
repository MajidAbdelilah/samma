import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Text,
} from '@chakra-ui/react';

interface BidModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bidPercentage: number) => void;
  currentBid: number;
}

const BidModal = ({ isOpen, onClose, onSubmit, currentBid }: BidModalProps) => {
  const [bidPercentage, setBidPercentage] = React.useState(currentBid);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(bidPercentage);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>تعديل نسبة العمولة</ModalHeader>
          <ModalBody>
            <FormControl>
              <FormLabel>نسبة العمولة الجديدة</FormLabel>
              <NumberInput
                min={5}
                max={100}
                value={bidPercentage}
                onChange={(_, value) => setBidPercentage(value)}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <Text fontSize="sm" color="gray.600" mt={2}>
                الحد الأدنى للعمولة هو 5%
              </Text>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              إلغاء
            </Button>
            <Button colorScheme="primary" type="submit">
              تأكيد
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default BidModal; 