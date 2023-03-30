import { Text, Tooltip } from "@chakra-ui/react";
import { CustomTable } from "./CustomTable";
import { formatDistanceToNow, format } from "date-fns";
import { Campaign } from "src/pages";

interface CampaignsListProps {
  data: Array<Campaign>;
}

const columns = [
  {
    Header: "ID",
    accessor: "id",
  },
  {
    Header: "Name",
    accessor: "name",
  },
  {
    Header: "Start date",
    accessor: "startDate",
    Cell: ({ cell }: { cell: any }) => (
      <Text>
        <Tooltip
          placement="top"
          label={format(new Date(cell.value), "dd MMMM yyyy HH:mm")}
        >
          {formatDistanceToNow(new Date(cell.value), {
            addSuffix: true,
          })}
        </Tooltip>
      </Text>
    ),
  },
  {
    Header: "End date",
    accessor: "endDate",
    Cell: ({ cell }: { cell: any }) => (
      <Text>
        <Tooltip
          placement="top"
          label={format(new Date(cell.value), "dd MMMM yyyy HH:mm")}
        >
          {formatDistanceToNow(new Date(cell.value), {
            addSuffix: true,
          })}
        </Tooltip>
      </Text>
    ),
  },
];

export const CampaignsList = ({ data }: CampaignsListProps) => {
  return <CustomTable columns={columns} data={data} />;
};
