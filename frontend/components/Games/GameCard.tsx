import React from 'react';
import {
  Box,
  Image,
  Text,
  Badge,
  Stack,
  Heading,
  useColorModeValue,
  LinkBox,
  LinkOverlay,
  HStack,
  Icon
} from '@chakra-ui/react';
import { FaStar, FaShoppingCart } from 'react-icons/fa';
import NextLink from 'next/link';
import type { Game } from '@/types/game';

interface GameCardProps {
  game: Game;
}

const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const {
    title,
    slug,
    price,
    rating,
    total_ratings,
    category,
    thumbnail,
    seller
  } = game;

  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  // Handle rating display
  const displayRating = typeof rating === 'number' ? rating.toFixed(1) : 'N/A';
  const displayTotalRatings = total_ratings || 0;

  return (
    <LinkBox
      as="article"
      data-testid="game-card"
      maxW="sm"
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      bg={cardBg}
      transition="transform 0.2s"
      _hover={{ transform: 'translateY(-4px)' }}
    >
      <Image
        src={thumbnail || '/images/default-game-thumbnail.svg'}
        alt={title}
        height="200px"
        width="100%"
        objectFit="cover"
      />

      <Box p="6">
        <Box display="flex" alignItems="baseline">
          <Badge borderRadius="full" px="2" colorScheme="teal">
            {category.name}
          </Badge>
          <Box
            color={textColor}
            fontWeight="semibold"
            letterSpacing="wide"
            fontSize="xs"
            textTransform="uppercase"
            ml="2"
          >
            By {seller.username}
          </Box>
        </Box>

        <Box mt="2">
          <LinkOverlay as={NextLink} href={`/games/${slug}`}>
            <Heading size="md" my="2">
              {title}
            </Heading>
          </LinkOverlay>
        </Box>

        <Stack direction="row" mt="2" alignItems="center" justify="space-between">
          <HStack spacing={1}>
            <Icon as={FaStar} color="yellow.400" />
            <Text fontWeight="bold">
              {displayRating}
            </Text>
            <Text color={textColor} fontSize="sm">
              ({displayTotalRatings})
            </Text>
          </HStack>

          <Text
            color="green.600"
            fontSize="xl"
            fontWeight="bold"
          >
            ${typeof price === 'number' ? price.toFixed(2) : '0.00'}
          </Text>
        </Stack>

        <Box
          mt="4"
          as="button"
          w="full"
          py="2"
          display="flex"
          alignItems="center"
          justifyContent="center"
          gap="2"
          bg="blue.500"
          color="white"
          borderRadius="md"
          _hover={{ bg: 'blue.600' }}
        >
          <Icon as={FaShoppingCart} />
          <Text>Add to Cart</Text>
        </Box>
      </Box>
    </LinkBox>
  );
};

export default GameCard; 