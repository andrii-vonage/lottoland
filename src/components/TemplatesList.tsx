import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { IconButton, Flex, Tooltip } from "@chakra-ui/react";
import { useMemo } from "react";
import { CustomTable } from "./CustomTable";
import { Template } from "src/pages/templates";
import { CellProps } from "react-table";

interface TemplatesListProps {
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onPaginate: (offset: number) => void;
  data: Array<Template>;
  offset?: number;
  total: number;
}

export const TemplatesList = ({
  onEdit,
  onDelete,
  onPaginate,
  data,
  offset,
  total,
}: TemplatesListProps) => {
  const columns = useMemo(
    () => [
      { Header: "ID", accessor: "id" },
      { Header: "Name", accessor: "name" },
      { Header: "Sender ID field name", accessor: "senderIdFieldName" },
      {
        header: "Actions",
        accessor: "_",
        Cell: ({ cell }: CellProps<Template>) => (
          <Flex justifyContent="flex-end">
            <Tooltip label="Edit template" placement="top">
              <IconButton
                onClick={() => onEdit(cell.row.values.id)}
                icon={<EditIcon />}
                aria-label="Edit template"
                colorScheme="teal"
                variant="outline"
              />
            </Tooltip>
            <Tooltip label="Delete template" placement="top">
              <IconButton
                marginLeft={3}
                onClick={() => onDelete(cell.row.values.id)}
                icon={<DeleteIcon />}
                colorScheme="red"
                aria-label="Delete template"
                variant="outline"
              />
            </Tooltip>
          </Flex>
        ),
      },
    ],
    [onDelete, onEdit]
  );

  return (
    <CustomTable<Template>
      columns={columns}
      data={data}
      withPagination
      offset={offset}
      onPaginate={onPaginate}
      total={total}
    />
  );
};
