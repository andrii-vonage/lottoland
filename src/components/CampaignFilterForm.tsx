import { Button, Flex, Input, Stack } from "@chakra-ui/react";

import { useForm } from "react-hook-form";
import { Campaign } from "src/pages";

interface CampaignFilterFormProps {
  onFilter: (data: Partial<Campaign>) => void;
}

export const CampaignFilterForm = ({ onFilter }: CampaignFilterFormProps) => {
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
        direction="row"
        spacing={4}
        marginBottom={8}
        padding={8}
        background="gray.50"
        borderRadius={8}
        marginX={8}
      >
        <Flex flexGrow={1}>
          <Input
            placeholder="Campaign ID"
            background="white"
            {...register("id")}
            marginRight={2}
          />
        </Flex>
        <Flex flexGrow={4}>
          <Input
            placeholder="Target group"
            background="white"
            {...register("targetGroupName")}
            marginRight={4}
          />
        </Flex>
        <Flex justifyContent="flex-end">
          <Button
            colorScheme="teal"
            variant="ghost"
            type="reset"
            onClick={onReset}
          >
            Reset
          </Button>
          <Button colorScheme="teal" marginLeft={4} type="submit">
            Filter
          </Button>
        </Flex>
      </Stack>
    </form>
  );
};
