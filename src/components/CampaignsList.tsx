import { Flex, IconButton, Tooltip } from "@chakra-ui/react";
import { CustomTable } from "./CustomTable";
import { Campaign } from "src/pages";
import { CloseIcon } from "@chakra-ui/icons";
import { useMemo } from "react";
import { CellProps } from "react-table";

interface CampaignsListProps {
  data: Array<Campaign>;
  onStop: (id: string) => void;
  onPaginate: (offset: number) => void;
  offset?: number;
  total: number;
}

export const CampaignsList = ({
  onStop,
  onPaginate,
  data,
  offset,
  total,
}: CampaignsListProps) => {
  const columns = useMemo(
    () => [
      {
        Header: "ID",
        accessor: "id",
      },
      {
        header: "Actions",
        accessor: "_",
        Cell: ({ cell }: CellProps<Campaign>) => (
          <Flex justifyContent="flex-end">
            <Tooltip label="Stop campaign" placement="top">
              <IconButton
                marginLeft={3}
                onClick={() => onStop(cell.row.values.id)}
                icon={<CloseIcon />}
                colorScheme="orange"
                aria-label="Stop campaign"
                variant="outline"
              />
            </Tooltip>
          </Flex>
        ),
      },
    ],
    [onStop]
  );

  return (
    <CustomTable<Campaign>
      columns={columns}
      data={data}
      withPagination
      onPaginate={onPaginate}
      offset={offset}
      total={total}
    />
  );
};
