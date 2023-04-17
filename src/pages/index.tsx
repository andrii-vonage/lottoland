import { Alert, AlertIcon, Flex, Heading, Spinner } from "@chakra-ui/react";
import Head from "next/head";
import { CampaignsList } from "src/components/CampaignsList";
import { Navigation } from "src/components/Navigation";
import { withPageAuthRequired } from "@auth0/nextjs-auth0/client";
import { useState } from "react";
import { CampaignFilterForm } from "src/components/CampaignFilterForm";
import { ConfirmDialog } from "src/components/ConfirmDialog";
import { fetcher, makeQuery } from "../utils";
import useSWR from "swr";
import { State } from "src/components/State";

export interface Campaign {
  id: string;
}

export default withPageAuthRequired(function Home() {
  const [campaignToStop, setCampaignToStop] = useState<Campaign>();
  const [successAlert, setSuccessAlert] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");

  const { data, isLoading, error, mutate } = useSWR<{
    result: Array<Campaign>;
  }>(`/api/campaigns${search}`, fetcher);

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
            Campaigns overview
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
              <CampaignsList data={data.result} onStop={handleStop} />
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
