import React from 'react';
import {
  Box,
  Image,
  Heading,
  Text,
  Stack,
  Badge,
  HStack,
  Progress,
} from '@chakra-ui/react';
import { StarIcon, ChatIcon } from '@chakra-ui/icons';
import Link from 'next/link';

interface GameCardProps {
  game: {
    id: string;
    title: string;
    price: number;
    rating: number;
    commentCount: number;
    bidPercentage: number;
    thumbnailUrl: string;
    categories: string[];
  };
}

const GameCard = ({ game }: GameCardProps) => {
  return (
    <Link href={`/games/${game.id}`}>
      <Box
        bg="white"
        rounded="lg"
        shadow="md"
        overflow="hidden"
        transition="transform 0.2s"
        _hover={{ transform: 'translateY(-4px)' }}
      >
        <Image
          src={game.thumbnailUrl}
          alt={game.title}
          w="full"
          h="48"
          objectFit="cover"
        />
        
        <Stack p={4} spacing={2}>
          <Heading size="md" noOfLines={1}>
            {game.title}
          </Heading>
          
          <HStack spacing={4}>
            <HStack>
              <StarIcon color="yellow.400" />
              <Text>{game.rating.toFixed(1)}/10</Text>
            </HStack>
            <HStack>
              <ChatIcon />
              <Text>{game.commentCount}</Text>
            </HStack>
          </HStack>

          <Text fontWeight="bold" color="primary.500">
            ${game.price}
          </Text>

          <HStack wrap="wrap" spacing={2}>
            {game.categories.map((category) => (
              <Badge key={category} colorScheme="primary">
                {category}
              </Badge>
            ))}
          </HStack>

          <Box>
            <Text fontSize="sm" mb={1}>نسبة العمولة: {game.bidPercentage}%</Text>
            <Progress
              value={game.bidPercentage}
              min={5}
              max={100}
              colorScheme="primary"
              size="sm"
              rounded="full"
            />
          </Box>
        </Stack>
      </Box>
    </Link>
  );
};

export default GameCard; 