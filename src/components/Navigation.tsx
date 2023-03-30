import { LockIcon, UnlockIcon } from "@chakra-ui/icons";
import { Button, Flex, Stack, Text } from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useUser } from "@auth0/nextjs-auth0/client";

export const Navigation = () => {
  const router = useRouter();
  const { user, error, isLoading } = useUser();

  const signIn = () => {
    router.replace("/api/auth/login");
  };

  const signOut = () => {
    router.replace("/api/auth/logout");
  };

  return (
    <Flex
      background="gray.100"
      as="nav"
      align="center"
      justify="space-between"
      wrap="wrap"
      w="100%"
      mb={8}
      px={8}
      py={4}
    >
      <Flex flexGrow={1} justifyContent="space-between" alignItems="center">
        <Stack direction="row" spacing={8}>
          <Link href="/">
            <Button colorScheme="teal" variant="link">
              Campaigns
            </Button>
          </Link>

          <Link href="/templates">
            <Button colorScheme="teal" variant="link">
              Templates
            </Button>
          </Link>
        </Stack>

        {user ? (
          <Stack direction="row" spacing={4} alignItems="center">
            <Text>{user.email}</Text>
            <Button
              leftIcon={<LockIcon />}
              colorScheme="blue"
              variant="solid"
              onClick={signOut}
            >
              Sign out
            </Button>
          </Stack>
        ) : (
          <Button
            leftIcon={<UnlockIcon />}
            colorScheme="blue"
            variant="solid"
            onClick={signIn}
          >
            Sign in
          </Button>
        )}
      </Flex>
    </Flex>
  );
};
