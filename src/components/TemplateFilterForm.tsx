import { Button, Flex, Input, Stack } from "@chakra-ui/react";

import { useForm } from "react-hook-form";
import { Template } from "src/pages/templates";

interface TemplateFilterFormProps {
  onFilter: (data: Partial<Template>) => void;
}

export const TemplateFilterForm = ({ onFilter }: TemplateFilterFormProps) => {
  const { register, handleSubmit, reset } = useForm<Partial<Template>>({
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
            placeholder="Template name"
            background="white"
            {...register("name")}
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
