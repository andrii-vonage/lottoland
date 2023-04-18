import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Spinner,
  Stack,
  Textarea,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Template } from "src/pages/templates";

interface TemplateFormProps {
  busy?: boolean;
  onCancel: () => void;
  onSave: (data: Template) => void;
  template?: Template;
}

export const TemplateForm = ({
  busy = false,
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
        <Stack direction="row" justifyContent="space-between">
          <FormControl isRequired>
            <FormLabel>Template name</FormLabel>
            <Input
              placeholder="Template name"
              background="white"
              {...register("name")}
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
        </Stack>
        <FormControl isRequired>
          <FormLabel>SMS text</FormLabel>
          <Textarea
            rows={5}
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
          <Button
            colorScheme="teal"
            marginLeft={4}
            type="submit"
            disabled={busy}
          >
            {busy && <Spinner size="sm" marginRight={2} />}
            Save template
          </Button>
        </Flex>
      </Stack>
    </form>
  );
};
