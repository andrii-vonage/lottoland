import {
    Alert,
    AlertIcon,
    Button,
    Flex,
    FormControl,
    FormLabel,
    Heading,
    Image,
    Input,
    Radio,
    RadioGroup,
    Select,
    Spinner,
    Stack,
    Text,
} from "@chakra-ui/react";

import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { fetcher, getCountry } from "src/utils";

import countryCodes from "../../phone-codes.json";
import content from "./content.json";
import { useState } from "react";

const Form = ({ code }: { code: string }) => {
    const [busy, setBusy] = useState(false);
    const [errorAlert, setErrorAlert] = useState<string | null>(null);
    const [successAlert, setSuccessAlert] = useState<string | null>(null);
    const { heading, logo, message, label, placeholder, footer, button } = content[code] ?? {};
    const phoneCountryCode = countryCodes.find((country) => country.code === code)?.dial_code;

    const {
        register,
        handleSubmit,
        watch,
        formState: { isSubmitting },
    } = useForm({
        defaultValues: {
            action: "opt-out",
            phoneNumber: "",
            phoneCountryCode,
        },
    });
    const phoneNumber = watch("phoneNumber");
    const disabled = !phoneNumber || isSubmitting;

    const onSave = async ({ action, phoneNumber, phoneCountryCode }) => {
        if (!phoneNumber) {
            setErrorAlert("Please enter a phone number");
            return;
        }

        try {
            setBusy(true);
            await fetcher("api/numbers/opt-out", {
                body: JSON.stringify({ action, phoneNumber, phoneCountryCode }),
                headers: { "Content-Type": "application/json" },
                method: "POST",
            });
            setBusy(false);
            setSuccessAlert(
                action === "opt-out"
                    ? `Phone number ${phoneCountryCode} ${phoneNumber} opted-out successfully`
                    : `Phone number ${phoneCountryCode} ${phoneNumber} opted-in successfully`
            );
        } catch (error: unknown) {
            setBusy(false);
            setErrorAlert((error as Error).message);
            return;
        }
    };

    return (
        <Flex alignItems="center" flexGrow={1} minHeight="100vh" justifyContent="center">
            <Flex direction="column" maxWidth={600} flexGrow={1} justifyContent="center">
                <Image src={logo} alt="Lottoland" />
                <Heading as="h2" textAlign="center" marginTop={2}>
                    {heading}
                </Heading>
                <Text
                    marginY={5}
                    dangerouslySetInnerHTML={{
                        __html: message,
                    }}
                />
                <Stack marginBottom={5}>
                    {successAlert && (
                        <Alert status="success" marginBottom={8}>
                            <AlertIcon />
                            {successAlert}
                        </Alert>
                    )}
                    {errorAlert && (
                        <Alert status="error" marginBottom={8}>
                            <AlertIcon />
                            {String(errorAlert)}
                        </Alert>
                    )}
                    <form onSubmit={handleSubmit(onSave)}>
                        <FormControl isRequired>
                            <FormLabel>{label}</FormLabel>
                            <Flex>
                                <Select
                                    {...register("phoneCountryCode")}
                                    width="max-content"
                                    marginRight={2}
                                    flexGrow={0}
                                >
                                    {countryCodes.map(({ code, dial_code, name }) => (
                                        <option key={code} value={dial_code}>
                                            {getCountry(code).emoji} {name} {dial_code}
                                        </option>
                                    ))}
                                </Select>
                                <Input
                                    flexGrow={1}
                                    background="white"
                                    type="number"
                                    placeholder={placeholder}
                                    {...register("phoneNumber")}
                                />
                            </Flex>
                        </FormControl>
                        {code === "GB" && (
                            <RadioGroup defaultValue="opt-out">
                                <Stack direction="row" marginTop={4}>
                                    <Radio value="opt-out" {...register("action")}>
                                        Opt-out
                                    </Radio>
                                    <Radio value="opt-in" {...register("action")} marginLeft={2}>
                                        Opt-in
                                    </Radio>
                                </Stack>
                            </RadioGroup>
                        )}
                        <Button
                            isLoading={busy}
                            loadingText="Please wait..."
                            type="submit"
                            colorScheme={disabled ? "gray" : "blue"}
                            width="100%"
                            marginTop={4}
                            disabled={disabled}
                        >
                            {button}
                        </Button>
                    </form>
                </Stack>
                <hr />
                <Text marginTop={3}>{footer}</Text>
                <Image src="/footer.jpeg" alt="Opt out" marginTop={5} marginBottom={10} />
            </Flex>
        </Flex>
    );
};

const OptOut = () => {
    const router = useRouter();
    const codeParam = router.query.code;
    const code = Array.isArray(codeParam) ? codeParam[0] : codeParam;

    if (!code) {
        return (
            <Flex alignItems="center" flexGrow={1} minHeight="100vh" justifyContent="center">
                <Flex direction="column" alignItems="center" justifyContent="center">
                    <Spinner />
                </Flex>
            </Flex>
        );
    }

    return <Form code={code} />;
};

export default OptOut;
