import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Textarea,
} from "@chakra-ui/react";

import { useForm } from "react-hook-form";
import { Campaign } from "src/pages";

interface FilterFormProps {
  onFilter: (data: Partial<Campaign>) => void;
}

export const FilterForm = ({ onFilter }: FilterFormProps) => {
  const { register, handleSubmit, reset } = useForm<Partial<Campaign>>({
    defaultValues: {},
  });

  const onReset = () => {
    reset();
    onFilter({});
  };

  return (
    <form onSubmit={handleSubmit(onFilter)}>
      <Stack
        spacing={4}
        marginBottom={8}
        padding={8}
        background="gray.50"
        borderRadius={8}
        marginX={8}
      >
        <Flex>
          <Input
            placeholder="Campaign ID"
            background="white"
            {...register("id")}
            marginRight={4}
          />

          <Input
            marginLeft={4}
            background="white"
            placeholder="Campaign name"
            {...register("name")}
          />
        </Flex>
        <Flex justifyContent="flex-end">
          <Button
            colorScheme="teal"
            variant="ghost"
            type="reset"
            onClick={onReset}
          >
            Cancel
          </Button>
          <Button colorScheme="teal" marginLeft={4} type="submit">
            Filter
          </Button>
        </Flex>
      </Stack>
    </form>
  );
};
