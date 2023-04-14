import { InfoIcon, WarningIcon } from "@chakra-ui/icons";
import { Alert, AlertDescription, AlertTitle } from "@chakra-ui/react";

interface StateProps {
  status: "error" | "info";
  title: string;
  description: string;
}

export const State = ({ status, title, description }: StateProps) => {
  const Icon = status === "error" ? WarningIcon : InfoIcon;

  return (
    <Alert
      status={status}
      variant="subtle"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      height="200px"
    >
      <Icon boxSize="40px" mr={0} />
      <AlertTitle mt={4} mb={1} fontSize="lg">
        {title}
      </AlertTitle>
      <AlertDescription maxWidth="sm">{description}</AlertDescription>
    </Alert>
  );
};
