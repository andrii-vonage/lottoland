import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Button,
  Flex,
  Heading,
  ListIcon,
  Spinner,
} from "@chakra-ui/react";
import Head from "next/head";
import { useState } from "react";
import { ConfirmDialog } from "src/components/ConfirmDialog";
import { Navigation } from "src/components/Navigation";
import { TemplateForm } from "src/components/TemplateForm";
import { TemplatesList } from "src/components/TemplatesList";
import { withPageAuthRequired } from "@auth0/nextjs-auth0/client";
import useSWR from "swr";
import { InfoIcon, QuestionIcon, WarningIcon } from "@chakra-ui/icons";

const fetcher = (input: RequestInfo, init?: RequestInit) =>
  fetch(input, init).then(async (res) => {
    if (res.ok) {
      return res.json();
    }

    const { message } = (await res.json()) ?? { message: "Unknown error" };

    throw new Error(message);
  });

export interface Template {
  id: string;
  smsText: string;
  senderIdFieldName: string;
}

export default withPageAuthRequired(function Templates() {
  const { data, isLoading, error, mutate } = useSWR<{
    result: Array<Template>;
  }>("/api/templates", fetcher);

  const [templateToEdit, setTemplateToEdit] = useState<Template>();
  const [viewTemplateForm, setViewTemplateForm] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<Template>();
  const [successAlert, setSuccessAlert] = useState<string | null>(null);
  const [errorAlert, setErrorAlert] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setTemplateToDelete(data?.result.find((template) => template.id === id));
  };

  const deleteTemplate = async () => {
    if (templateToDelete) {
      await fetcher(`/api/templates/${templateToDelete.id}`, {
        method: "DELETE",
      });

      mutate();
      setSuccessAlert("Template deleted successfully");
    }

    setTemplateToDelete(undefined);
  };

  const handleAdd = () => {
    setViewTemplateForm(true);
    setSuccessAlert(null);
    setErrorAlert(null);
  };

  const handleEdit = (id: string) => {
    setTemplateToEdit(data?.result.find((template) => template.id === id));
    handleAdd();
  };

  const handleClose = () => {
    setTemplateToEdit(undefined);
    setViewTemplateForm(false);

    setSuccessAlert(null);
    setErrorAlert(null);
  };

  const handleSave = async (template: Template) => {
    if (template.id && template.senderIdFieldName && template.smsText) {
      try {
        await fetcher("/api/templates", {
          body: JSON.stringify(template),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        });
      } catch (error: unknown) {
        setErrorAlert((error as Error).message);
        return;
      }

      mutate();
      handleClose();
      setSuccessAlert("Template saved successfully");
      setErrorAlert(null);
    } else {
      setErrorAlert("Please fill all template fields");
    }
  };

  return (
    <>
      <Head>
        <meta name="description" content="Templates manager" />
      </Head>
      <main>
        <Flex direction="column">
          <Navigation />

          <Flex mx={8} justifyContent="space-between">
            <Heading mb={8}>Templates manager</Heading>
            {!viewTemplateForm && (
              <Button colorScheme="teal" variant="outline" onClick={handleAdd}>
                Create new template
              </Button>
            )}
          </Flex>
          {successAlert && (
            <Alert status="success" marginBottom={8}>
              <AlertIcon />
              {successAlert}
            </Alert>
          )}
          {errorAlert && (
            <Alert status="error" marginBottom={8}>
              <AlertIcon />
              {String(errorAlert)}
            </Alert>
          )}
          <Flex direction="column" marginX={8}>
            {viewTemplateForm && (
              <TemplateForm
                template={templateToEdit}
                onCancel={handleClose}
                onSave={handleSave}
              />
            )}

            {isLoading ? (
              <Spinner />
            ) : error ? (
              <Alert
                status="error"
                variant="subtle"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                textAlign="center"
                height="200px"
              >
                <WarningIcon boxSize="40px" mr={0} />
                <AlertTitle mt={4} mb={1} fontSize="lg">
                  Something went wrong
                </AlertTitle>
                <AlertDescription maxWidth="sm">
                  {error.message}
                </AlertDescription>
              </Alert>
            ) : data?.result.length ? (
              <TemplatesList
                data={data.result}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            ) : (
              <Alert
                status="info"
                variant="subtle"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                textAlign="center"
                height="200px"
              >
                <QuestionIcon boxSize="40px" mr={0} />
                <AlertTitle mt={4} mb={1} fontSize="lg">
                  No templates found
                </AlertTitle>
                <AlertDescription maxWidth="sm">
                  Add new template to get started.
                </AlertDescription>
              </Alert>
            )}
            <ConfirmDialog
              isOpen={Boolean(templateToDelete?.id)}
              onClose={() => setTemplateToDelete(undefined)}
              onConfirm={deleteTemplate}
              title="Delete template"
              description=" Are you sure? You can't undo this action afterwards."
              confirmText="Yes. Delete"
              cancelText="Cancel"
            />
          </Flex>
        </Flex>
      </main>
    </>
  );
});
