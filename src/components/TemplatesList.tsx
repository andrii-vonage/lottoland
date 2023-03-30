import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { IconButton, Flex, Text, Tooltip } from "@chakra-ui/react";
import { useMemo } from "react";
import { CustomTable } from "./CustomTable";
import { Template } from "src/pages/templates";
import { formatDistanceToNow, format } from "date-fns";

interface TemplatesListProps {
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  data: Array<Template>;
}

export const TemplatesList = ({
  onEdit,
  onDelete,
  data,
}: TemplatesListProps) => {
  const columns = useMemo(
    () => [
      {
        Header: "Template",
        columns: [
          {
            Header: "ID",
            accessor: "id",
          },
          {
            Header: "Sender ID field name",
            accessor: "senderIdFieldName",
          },
        ],
      },
      {
        Header: "Meta",
        columns: [
          {
            Header: "Created at",
            accessor: "createdAt",
            Cell: ({ cell }: { cell: any }) => (
              <Text>
                <Tooltip
                  placement="top"
                  label={format(new Date(cell.value), "dd-MMMM-yyyy HH:mm")}
                >
                  {formatDistanceToNow(new Date(cell.value), {
                    addSuffix: true,
                  })}
                </Tooltip>
              </Text>
            ),
          },
        ],
      },
      {
        header: "Actions",
        accessor: "some-key",
        Cell: ({ cell }: { cell: any }) => (
          <Flex justifyContent="flex-end">
            <IconButton
              onClick={() => onEdit(cell.row.values.id)}
              icon={<EditIcon />}
              aria-label="Edit template"
              colorScheme="teal"
              variant="outline"
            />
            <IconButton
              marginLeft={3}
              onClick={() => onDelete(cell.row.values.id)}
              icon={<DeleteIcon />}
              colorScheme="red"
              aria-label="Delete template"
              variant="outline"
            />
          </Flex>
        ),
      },
    ],
    [onDelete, onEdit]
  ) as any;

  return <CustomTable columns={columns} data={data} />;
};
