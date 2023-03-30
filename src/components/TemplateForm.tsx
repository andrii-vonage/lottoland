import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Textarea,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Template } from "src/pages/templates";

interface TemplateFormProps {
  onCancel: () => void;
  onSave: (data: Template) => void;
  template?: Template;
}

export const TemplateForm = ({
  onCancel,
  onSave,
  template,
}: TemplateFormProps) => {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: template,
  });

  useEffect(() => {
    reset(template);
  }, [reset, template]);

  return (
    <form onSubmit={handleSubmit(onSave)}>
      <Stack
        spacing={4}
        marginBottom={8}
        background="gray.50"
        padding={8}
        borderRadius={8}
      >
        <FormControl isRequired>
          <FormLabel>Template ID</FormLabel>
          <Input
            placeholder="Template ID"
            background="white"
            {...register("id")}
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Sender ID field name</FormLabel>
          <Input
            background="white"
            placeholder="Sender ID field name"
            {...register("senderIdFieldName")}
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>SMS textTemplate ID</FormLabel>
          <Textarea
            placeholder="SMS text"
            background="white"
            {...register("smsText")}
          />
        </FormControl>
        <Flex justifyContent="flex-end">
          <Button
            colorScheme="teal"
            variant="ghost"
            type="reset"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button colorScheme="teal" marginLeft={4} type="submit">
            Save template
          </Button>
        </Flex>
      </Stack>
    </form>
  );
};
