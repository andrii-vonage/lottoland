import {
  Alert,
  AlertIcon,
  Button,
  Flex,
  Heading,
  Spinner,
} from "@chakra-ui/react";
import Head from "next/head";
import { useCallback, useState } from "react";
import { ConfirmDialog } from "src/components/ConfirmDialog";
import { Navigation } from "src/components/Navigation";
import { TemplateForm } from "src/components/TemplateForm";
import { TemplatesList } from "src/components/TemplatesList";
import { withPageAuthRequired } from "@auth0/nextjs-auth0/client";
import useSWR from "swr";
import { State } from "src/components/State";
import { TemplateFilterForm } from "src/components/TemplateFilterForm";
import { fetcher, getSortQuery, makeQuery } from "../utils";
import { pageSize } from "../utils/config";
import { getCounterStats } from "@sms77.io/counter";

export interface Template {
  id: number;
  name: string;
  smsText: string;
  senderIdFieldName: string;
}

export default withPageAuthRequired(function Templates() {
  const [templateToEdit, setTemplateToEdit] = useState<Template>();
  const [viewTemplateForm, setViewTemplateForm] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<Template>();
  const [successAlert, setSuccessAlert] = useState<string | null>(null);
  const [errorAlert, setErrorAlert] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState<string>("");
  const [sort, setSort] = useState({
    sortBy: "",
    sortDir: "asc" as "asc" | "desc",
  });
  const [offset, setOffset] = useState(0);

  const { data, isLoading, error, mutate } = useSWR<{
    result: Array<Template>;
    total: number;
  }>(
    `/api/templates?offset=${
      offset * pageSize
    }&limit=${pageSize}${search}${getSortQuery(sort)}`,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  const handleDelete = (id: number) => {
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

  const handleEdit = (id: number) => {
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
    const id = parseInt(String(template.id), 10);
    const name = template.name.trim();
    const senderIdFieldName = template.senderIdFieldName.trim();
    const smsText = template.smsText.trim();

    if (name && senderIdFieldName && smsText) {
      const { charCount, charLimit } = getCounterStats(smsText);
      const maxSmsTextLength = charLimit * 2;
      if (charCount > maxSmsTextLength) {
        setErrorAlert(
          `SMS text is too long (max ${maxSmsTextLength} characters)`
        );
        return;
      }

      try {
        setBusy(true);
        await fetcher(id ? `/api/templates/${id}` : "/api/templates", {
          body: JSON.stringify({ id, name, senderIdFieldName, smsText }),
          headers: { "Content-Type": "application/json" },
          method: id ? "PUT" : "POST",
        });
      } catch (error: unknown) {
        setBusy(false);
        setErrorAlert((error as Error).message);
        return;
      }

      mutate();
      setBusy(false);
      handleClose();
      setSuccessAlert("Template saved successfully");
      setErrorAlert(null);
    } else {
      setErrorAlert("Please fill all template fields");
    }
  };

  const handleFilter = (filter: Partial<Template>) => {
    setOffset(0);
    setSearch(makeQuery(filter));
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

          {viewTemplateForm ? (
            <TemplateForm
              busy={busy}
              template={templateToEdit}
              onCancel={handleClose}
              onSave={handleSave}
            />
          ) : (
            <TemplateFilterForm onFilter={handleFilter} />
          )}

          <Flex direction="column" marginX={8}>
            {isLoading ? (
              <Spinner />
            ) : error ? (
              <State
                status="error"
                title="Something went wrong"
                description={error.message}
              />
            ) : data?.result.length ? (
              <TemplatesList
                data={data.result}
                total={data.total}
                offset={offset}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onSort={setSort}
                sortBy={sort.sortBy}
                sortDir={sort.sortDir}
                onPaginate={setOffset}
              />
            ) : (
              <State
                status="info"
                title="No templates found"
                description="Add new template to get started"
              />
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
