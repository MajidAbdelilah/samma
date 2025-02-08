import React, { ChangeEvent, FormEvent } from 'react';
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  NumberInput,
  NumberInputField,
  Button,
  Box,
  Image,
  SimpleGrid,
  IconButton,
  Select,
  HStack,
  Tag,
  TagLabel,
  TagCloseButton,
  useToast,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { Game, Category } from '../../types';

interface GameFormProps {
  initialData?: Partial<Game>;
  categories: Category[];
  onSubmit: (data: FormData) => Promise<void>;
  isLoading?: boolean;
}

const GameForm: React.FC<GameFormProps> = ({
  initialData,
  categories,
  onSubmit,
  isLoading = false,
}) => {
  const [screenshots, setScreenshots] = React.useState<File[]>([]);
  const [tags, setTags] = React.useState<string[]>(initialData?.tags || []);
  const [newTag, setNewTag] = React.useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    // Add screenshots
    screenshots.forEach((file, index) => {
      formData.append(`screenshots`, file);
    });

    // Add tags
    formData.append('tags', JSON.stringify(tags));

    try {
      await onSubmit(formData);
      toast({
        title: 'تم حفظ اللعبة بنجاح',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'حدث خطأ أثناء حفظ اللعبة',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleScreenshotUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setScreenshots((prev: File[]) => [...prev, ...newFiles]);
    }
  };

  const removeScreenshot = (index: number) => {
    setScreenshots((prev: File[]) => prev.filter((_, i: number) => i !== index));
  };

  const addTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags((prev: string[]) => [...prev, newTag]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags((prev: string[]) => prev.filter((tag: string) => tag !== tagToRemove));
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <VStack spacing={6} align="stretch">
        <FormControl isRequired>
          <FormLabel>عنوان اللعبة</FormLabel>
          <Input
            name="title"
            defaultValue={initialData?.title}
            placeholder="أدخل عنوان اللعبة"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>وصف اللعبة</FormLabel>
          <Textarea
            name="description"
            defaultValue={initialData?.description}
            placeholder="أدخل وصف اللعبة"
            minH="200px"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>السعر</FormLabel>
          <NumberInput min={0} defaultValue={initialData?.price || 0}>
            <NumberInputField name="price" />
          </NumberInput>
        </FormControl>

        <FormControl isRequired>
          <FormLabel>التصنيف</FormLabel>
          <Select name="category" defaultValue={initialData?.categories?.[0]}>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>الوسوم</FormLabel>
          <HStack mb={2}>
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="أضف وسماً"
            />
            <IconButton
              aria-label="Add tag"
              icon={<AddIcon />}
              onClick={addTag}
            />
          </HStack>
          <HStack wrap="wrap" spacing={2}>
            {tags.map((tag) => (
              <Tag key={tag} size="md" borderRadius="full" variant="solid">
                <TagLabel>{tag}</TagLabel>
                <TagCloseButton onClick={() => removeTag(tag)} />
              </Tag>
            ))}
          </HStack>
        </FormControl>

        <FormControl>
          <FormLabel>صور اللعبة</FormLabel>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleScreenshotUpload}
            accept="image/*"
            multiple
            style={{ display: 'none' }}
          />
          <Button onClick={() => fileInputRef.current?.click()} mb={4}>
            إضافة صور
          </Button>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            {screenshots.map((file, index) => (
              <Box key={index} position="relative">
                <Image
                  src={URL.createObjectURL(file)}
                  alt={`Screenshot ${index + 1}`}
                  objectFit="cover"
                  w="full"
                  h="200px"
                />
                <IconButton
                  aria-label="Remove screenshot"
                  icon={<DeleteIcon />}
                  position="absolute"
                  top={2}
                  right={2}
                  onClick={() => removeScreenshot(index)}
                />
              </Box>
            ))}
          </SimpleGrid>
        </FormControl>

        <Button
          type="submit"
          colorScheme="primary"
          size="lg"
          isLoading={isLoading}
        >
          {initialData ? 'تحديث اللعبة' : 'نشر اللعبة'}
        </Button>
      </VStack>
    </Box>
  );
};

export default GameForm; 