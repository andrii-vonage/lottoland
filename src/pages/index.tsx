import { Alert, AlertIcon, Flex, Heading, Spinner } from "@chakra-ui/react";
import Head from "next/head";
import { CampaignsList } from "src/components/CampaignsList";
import { Navigation } from "src/components/Navigation";
import { withPageAuthRequired } from "@auth0/nextjs-auth0/client";
import { useState } from "react";
import { CampaignFilterForm } from "src/components/CampaignFilterForm";
import { ConfirmDialog } from "src/components/ConfirmDialog";
import { fetcher, getSortQuery, makeQuery } from "../utils";
import useSWR from "swr";
import { State } from "src/components/State";
import { pageSize } from "../utils/config";

export interface Campaign {
  id: string;
  targetGroupName: string;
  actions: Array<string>;
  startDate: string;
  endDate: string;
}

export default withPageAuthRequired(function Home() {
  const [campaignToStop, setCampaignToStop] = useState<Campaign>();
  const [successAlert, setSuccessAlert] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  const [offset, setOffset] = useState(0);
  const [sort, setSort] = useState({
    sortBy: "",
    sortDir: "asc" as "asc" | "desc",
  });

  const { data, isLoading, error, mutate } = useSWR<{
    result: Array<Campaign>;
    total: number;
  }>(
    `/api/campaigns?offset=${
      offset * pageSize
    }&limit=${pageSize}${search}${getSortQuery(sort)}`,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  const handleFilter = (filter: Partial<Campaign>) => {
    setSearch(makeQuery(filter));
  };

  const handleStop = (id: string) => {
    setCampaignToStop(data?.result.find((campaign) => campaign.id === id));
  };

  const stopCampaign = async () => {
    if (campaignToStop) {
      await fetcher(`/api/campaigns/${campaignToStop.id}`, {
        method: "POST",
      });

      mutate();
      setSuccessAlert("Campaign stopped successfully");
    }

    setCampaignToStop(undefined);
  };

  return (
    <>
      <Head>
        <meta name="description" content="Campaigns overview" />
      </Head>
      <main>
        <Flex direction="column">
          <Navigation />
          <Heading mb={8} ml={8}>
            Running campaigns
          </Heading>
          {successAlert && (
            <Alert status="success" marginBottom={8}>
              <AlertIcon />
              {successAlert}
            </Alert>
          )}

          <CampaignFilterForm onFilter={handleFilter} />
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
              <CampaignsList
                data={data.result}
                onStop={handleStop}
                total={data.total}
                onPaginate={setOffset}
                offset={offset}
                onSort={setSort}
                sortBy={sort.sortBy}
                sortDir={sort.sortDir}
              />
            ) : (
              <State
                status="info"
                title="No templates found"
                description="Add new template to get started"
              />
            )}

            <ConfirmDialog
              isOpen={Boolean(campaignToStop?.id)}
              onClose={() => setCampaignToStop(undefined)}
              onConfirm={stopCampaign}
              title="Stop campaign"
              description=" Are you sure you want to stop this campaign?"
              confirmText="Yes. Stop"
              cancelText="Cancel"
            />
          </Flex>
        </Flex>
      </main>
    </>
  );
});
