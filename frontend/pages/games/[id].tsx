import React from 'react';
import { GetServerSideProps } from 'next';
import {
  Box,
  Container,
  Grid,
  Heading,
  Text,
  Image,
  Button,
  VStack,
  HStack,
  Badge,
  Divider,
  useToast,
} from '@chakra-ui/react';
import { StarIcon, ChatIcon } from '@chakra-ui/icons';
import MainLayout from '../../components/Layout/MainLayout';
import BidModal from '../../components/Games/BidModal';
import CommentSection from '../../components/Games/CommentSection';
import { Game } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { PayPalButtons } from '@paypal/react-paypal-js';

interface GameDetailsProps {
  game: Game;
}

export default function GameDetails({ game }: GameDetailsProps) {
  const { isAuthenticated, user } = useAuth();
  const [isBidModalOpen, setBidModalOpen] = React.useState(false);
  const toast = useToast();

  const handlePurchase = async () => {
    // Handle purchase logic
  };

  const handleBidSubmit = async (bidPercentage: number) => {
    try {
      const response = await fetch(`/api/games/${game.id}/bid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bidPercentage }),
      });

      if (!response.ok) throw new Error('Failed to submit bid');

      toast({
        title: 'تم تقديم العرض بنجاح',
        status: 'success',
        duration: 3000,
      });
      setBidModalOpen(false);
    } catch (error) {
      toast({
        title: 'فشل تقديم العرض',
        status: 'error',
        duration: 3000,
      });
    }
  };

  return (
    <MainLayout>
      <Container maxW="container.xl" py={8}>
        <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={8}>
          {/* Game Details */}
          <Box>
            <Image
              src={game.thumbnailUrl}
              alt={game.title}
              w="full"
              h="400px"
              objectFit="cover"
              rounded="lg"
            />
            
            <VStack align="stretch" spacing={4} mt={6}>
              <Heading size="xl">{game.title}</Heading>
              
              <HStack spacing={6}>
                <HStack>
                  <StarIcon color="yellow.400" />
                  <Text>{game.rating.toFixed(1)}/10</Text>
                </HStack>
                <HStack>
                  <ChatIcon />
                  <Text>{game.commentCount} تعليق</Text>
                </HStack>
              </HStack>

              <Text fontSize="xl" fontWeight="bold" color="primary.500">
                ${game.price}
              </Text>

              <Text>{game.description}</Text>

              <HStack wrap="wrap" spacing={2}>
                {game.categories.map((category) => (
                  <Badge key={category} colorScheme="primary">
                    {category}
                  </Badge>
                ))}
              </HStack>
            </VStack>

            <Divider my={8} />

            <CommentSection gameId={game.id} />
          </Box>

          {/* Purchase Section */}
          <Box>
            <VStack
              spacing={4}
              p={6}
              bg="white"
              rounded="lg"
              shadow="md"
              position="sticky"
              top={4}
            >
              <Text fontSize="2xl" fontWeight="bold">
                ${game.price}
              </Text>

              {isAuthenticated ? (
                <>
                  {user?.id === game.seller.id ? (
                    <Button
                      colorScheme="primary"
                      w="full"
                      onClick={() => setBidModalOpen(true)}
                    >
                      تعديل نسبة العمولة
                    </Button>
                  ) : (
                    <PayPalButtons
                      createOrder={(data, actions) => {
                        return actions.order.create({
                          purchase_units: [
                            {
                              amount: {
                                value: game.price.toString(),
                              },
                            },
                          ],
                        });
                      }}
                      onApprove={handlePurchase}
                    />
                  )}
                </>
              ) : (
                <Button colorScheme="primary" w="full" isDisabled>
                  سجل الدخول للشراء
                </Button>
              )}

              <Box w="full">
                <Text fontSize="sm" mb={1}>
                  نسبة العمولة: {game.bidPercentage}%
                </Text>
                <Box
                  w="full"
                  h="2"
                  bg="gray.200"
                  rounded="full"
                  overflow="hidden"
                >
                  <Box
                    w={`${game.bidPercentage}%`}
                    h="full"
                    bg="primary.500"
                  />
                </Box>
              </Box>
            </VStack>
          </Box>
        </Grid>
      </Container>

      <BidModal
        isOpen={isBidModalOpen}
        onClose={() => setBidModalOpen(false)}
        onSubmit={handleBidSubmit}
        currentBid={game.bidPercentage}
      />
    </MainLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  // In a real application, fetch this data from your API
  const game = {
    id: '1',
    title: 'عنوان اللعبة',
    description: 'وصف اللعبة...',
    price: 29.99,
    rating: 8.5,
    commentCount: 42,
    bidPercentage: 15,
    thumbnailUrl: '/game-thumbnail.jpg',
    categories: ['مغامرة', 'أكشن'],
    tags: ['مغامرة', 'أكشن', 'تصويب'],
    seller: {
      id: '123',
      name: 'المطور',
    },
  };

  return {
    props: {
      game,
    },
  };
}; 