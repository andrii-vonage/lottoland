import { Flex, IconButton } from "@chakra-ui/react";
import { CustomTable } from "./CustomTable";
import { Campaign } from "src/pages";
import { CloseIcon } from "@chakra-ui/icons";
import { useMemo } from "react";
import { CellProps } from "react-table";

interface CampaignsListProps {
  data: Array<Campaign>;
  onStop: (id: string) => void;
}

export const CampaignsList = ({ data, onStop }: CampaignsListProps) => {
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
            <IconButton
              marginLeft={3}
              onClick={() => onStop(cell.row.values.id)}
              icon={<CloseIcon />}
              colorScheme="orange"
              aria-label="Stop campaign"
              variant="outline"
            />
          </Flex>
        ),
      },
    ],
    [onStop]
  ) as any;

  return <CustomTable columns={columns} data={data} />;
};
