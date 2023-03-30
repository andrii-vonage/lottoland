import { Box, Button, Flex, Heading, Text } from "@chakra-ui/react";
import Head from "next/head";
import { useState } from "react";
import { ConfirmDialog } from "src/components/ConfirmDialog";
import { Navigation } from "src/components/Navigation";
import { TemplateForm } from "src/components/TemplateForm";
import { TemplatesList } from "src/components/TemplatesList";
import { withPageAuthRequired } from "@auth0/nextjs-auth0/client";

const source: Array<Template> = [
  {
    id: "1",
    senderIdFieldName: "senderId 1",
    smsText: "smsText 1",
    createdAt: "2021-05-01T12:00:00.000Z",
  },
  {
    id: "2",
    senderIdFieldName: "senderId 2",
    smsText: "smsText 2",
    createdAt: "2022-05-01T12:00:00.000Z",
  },
  {
    id: "3",
    senderIdFieldName: "senderId 3",
    smsText: "smsText 3",
    createdAt: "2023-05-01T12:00:00.000Z",
  },
  {
    id: "4",
    senderIdFieldName: "senderId 4",
    smsText: "smsText 4",
    createdAt: "2024-05-01T12:00:00.000Z",
  },
  {
    id: "5",
    senderIdFieldName: "senderId 5",
    smsText: "smsText 5",
    createdAt: "2025-05-01T12:00:00.000Z",
  },
];

export interface Template {
  id: string;
  smsText: string;
  senderIdFieldName: string;
  createdAt: string;
}

export default withPageAuthRequired(function Templates() {
  const [data, setData] = useState(source);
  const [templateToEdit, setTemplateToEdit] = useState<Template>();
  const [viewTemplateForm, setViewTemplateForm] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<Template>();

  const handleDelete = (id: string) => {
    setTemplateToDelete(data.find((template) => template.id === id));
  };

  const deleteTemplate = () => {
    setData((data) =>
      data.filter((template) => template.id !== templateToDelete?.id)
    );

    setTemplateToDelete(undefined);
  };

  const handleEdit = (id: string) => {
    setTemplateToEdit(data.find((template) => template.id === id));
    setViewTemplateForm(true);
  };

  const handleCancel = () => {
    setTemplateToEdit(undefined);
    setViewTemplateForm(false);
  };

  const handleSave = (template: Template) => {
    setData((data) => [
      { ...template, createdAt: new Date().toISOString() },
      ...data,
    ]);
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
              <Button
                colorScheme="teal"
                variant="outline"
                onClick={() => setViewTemplateForm(true)}
              >
                Create new template
              </Button>
            )}
          </Flex>
          <Flex direction="column" marginX={8}>
            {viewTemplateForm && (
              <TemplateForm
                template={templateToEdit}
                onCancel={handleCancel}
                onSave={handleSave}
              />
            )}
            <TemplatesList
              data={data}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
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
