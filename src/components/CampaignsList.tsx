import { Flex, IconButton, Tooltip } from "@chakra-ui/react";
import { CustomTable } from "./CustomTable";
import { Campaign } from "src/pages";
import { CloseIcon } from "@chakra-ui/icons";
import { useMemo } from "react";
import { CellProps } from "react-table";
import { TableOptions } from "src/utils";

interface CampaignsListProps extends TableOptions {
  data: Array<Campaign>;
  onStop: (id: string) => void;
}

export const CampaignsList = ({
  onStop,
  data,
  ...rest
}: CampaignsListProps) => {
  const columns = useMemo(
    () => [
      {
        Header: "ID",
        accessor: "id",
      },
      {
        Header: "Target group",
        accessor: "targetGroupName",
      },
      {
        Header: "Actions",
        accessor: "actions",
      },
      {
        Header: "Start date",
        accessor: "startDate",
      },
      {
        Header: "End date",
        accessor: "endDate",
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
      {...rest}
    />
  );
};
