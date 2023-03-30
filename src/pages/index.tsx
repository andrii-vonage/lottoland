import { Flex, Heading } from "@chakra-ui/react";
import Head from "next/head";
import { CampaignsList } from "src/components/CampaignsList";
import { FilterForm } from "src/components/FilterForm";
import { Navigation } from "src/components/Navigation";
import { withPageAuthRequired } from "@auth0/nextjs-auth0/client";
import { useState } from "react";

const source: Array<Campaign> = [
  { id: "a1", name: "first", startDate: "2021-01-01", endDate: "2021-12-31" },
  { id: "a2", name: "second", startDate: "2022-01-01", endDate: "2022-12-31" },
  { id: "a3", name: "third", startDate: "2023-01-01", endDate: "2023-12-31" },
  { id: "a4", name: "fourth", startDate: "2024-01-01", endDate: "2024-12-31" },
  { id: "a5", name: "fifth", startDate: "2025-01-01", endDate: "2025-12-31" },
  { id: "a6", name: "sixth", startDate: "2026-01-01", endDate: "2026-12-31" },
  { id: "a7", name: "seventh", startDate: "2027-01-01", endDate: "2027-12-31" },
  { id: "a8", name: "eighth", startDate: "2028-01-01", endDate: "2028-12-31" },
  { id: "a9", name: "ninth", startDate: "2029-01-01", endDate: "2029-12-31" },
  { id: "a10", name: "tenth", startDate: "2030-01-01", endDate: "2030-12-31" },
  {
    id: "a11",
    name: "eleventh",
    startDate: "2031-01-01",
    endDate: "2031-12-31",
  },
  {
    id: "a12",
    name: "twelfth",
    startDate: "2032-01-01",
    endDate: "2032-12-31",
  },
  {
    id: "a13",
    name: "thirteenth",
    startDate: "2033-01-01",
    endDate: "2033-12-31",
  },
  {
    id: "a14",
    name: "fourteenth",
    startDate: "2034-01-01",
    endDate: "2034-12-31",
  },
  {
    id: "a15",
    name: "fifteenth",
    startDate: "2035-01-01",
    endDate: "2035-12-31",
  },
];

export interface Campaign {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

interface FilterParams {
  id?: string;
  name?: string;
}

export default withPageAuthRequired(function Home() {
  const [data, setData] = useState(source);

  const handleFilter = (filter: FilterParams) => {
    const filteredData = source.filter((campaign) => {
      if (filter.id && campaign.id !== filter.id) {
        return false;
      }
      if (filter.name && !campaign.name.includes(filter.name)) {
        return false;
      }
      return true;
    });
    setData(filteredData);
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
          <FilterForm onFilter={handleFilter} />
          <Flex direction="column" marginX={8}>
            <CampaignsList data={data} />
          </Flex>
        </Flex>
      </main>
    </>
  );
});
