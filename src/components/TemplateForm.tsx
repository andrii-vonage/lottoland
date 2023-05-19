import {
    Button,
    Center,
    Divider,
    Flex,
    FormControl,
    FormLabel,
    Input,
    Spinner,
    Stack,
    Textarea,
    Select,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Template } from "src/pages/templates";
import { CounterStats, getCounterStats } from "@sms77.io/counter";
import { getCountry } from "../utils";

interface TemplateFormProps {
    busy?: boolean;
    onCancel: () => void;
    onSave: (data: Template) => void;
    template?: Template;
}

export const TemplateForm = ({ busy = false, onCancel, onSave, template }: TemplateFormProps) => {
    const [value, setValue] = useState("");
    const [counterStats, setCounterStats] = useState<CounterStats>();
    const characterCount = counterStats?.charCount || 0;
    const warnSmsTextLength = counterStats?.charLimit || 160;
    const maxSmsTextLength = warnSmsTextLength * 2;

    const { register, handleSubmit, reset } = useForm({
        defaultValues: template,
    });

    useEffect(() => {
        reset(template);
    }, [reset, template]);

    useEffect(() => {
        setCounterStats(getCounterStats(value));
    }, [value]);

    const messageNum = Math.ceil(characterCount / warnSmsTextLength) || 1;
    const totalMessages = maxSmsTextLength / warnSmsTextLength;

    return (
        <form onSubmit={handleSubmit(onSave)}>
            <Stack spacing={4} marginBottom={8} background="gray.50" padding={8} borderRadius={8}>
                <Input type="hidden" {...register("id")} />
                <Stack direction="row" justifyContent="space-between">
                    <FormControl isRequired>
                        <FormLabel>Template name</FormLabel>
                        <Input placeholder="Template name" background="white" {...register("name")} />
                    </FormControl>
                    <FormControl isRequired>
                        <FormLabel>Sender ID field name</FormLabel>
                        <Input
                            background="white"
                            placeholder="Sender ID field name"
                            {...register("senderIdFieldName")}
                        />
                    </FormControl>
                </Stack>
                <FormControl isRequired>
                    <Stack direction="row" justifyContent="space-between" width="100%">
                        <FormLabel flexGrow={1}>SMS text</FormLabel>
                        <>
                            <Stack direction="row" minWidth="120px">
                                <span>Message:</span>
                                <strong
                                    style={{
                                        color: characterCount > maxSmsTextLength ? "red" : "black",
                                    }}
                                >
                                    {messageNum} of {totalMessages}
                                </strong>
                            </Stack>
                            <Center height="25px" marginX="md">
                                <Divider orientation="vertical" />
                            </Center>
                            <Stack direction="row" minWidth="200px">
                                <span>Characters:</span>
                                <strong
                                    style={{
                                        color: characterCount > maxSmsTextLength ? "red" : "black",
                                    }}
                                >
                                    {characterCount} of {maxSmsTextLength}
                                </strong>
                            </Stack>
                        </>
                    </Stack>

                    <Textarea
                        maxLength={maxSmsTextLength}
                        onChangeCapture={(e) => setValue(e.currentTarget.value)}
                        rows={5}
                        placeholder="SMS text"
                        background="white"
                        {...register("smsText")}
                    />
                </FormControl>
                <Stack direction="row" justifyContent="space-between" alignItems="center" width="100%">
                    <Flex>
                        <FormControl isRequired>
                            <Flex whiteSpace="nowrap" alignItems="center">
                                <FormLabel>Opt-out template</FormLabel>
                                <Select placeholder="Select language" {...register("optOutUrl")}>
                                    {[
                                        ["GB", "English", process.env.NEXT_PUBLIC_BITLY_GB],
                                        ["DE", "German", process.env.NEXT_PUBLIC_BITLY_DE],
                                        ["PL", "Polish", process.env.NEXT_PUBLIC_BITLY_PL],
                                        ["SE", "Swedish", process.env.NEXT_PUBLIC_BITLY_SE],
                                        ["BR", "Portuguese (Brazil)", process.env.NEXT_PUBLIC_BITLY_BR],
                                        ["SK", "Slovakian", process.env.NEXT_PUBLIC_BITLY_SK],
                                        ["HU", "Hungarian", process.env.NEXT_PUBLIC_BITLY_HU],
                                        ["MX", "Spanish (Mexico)", process.env.NEXT_PUBLIC_BITLY_MX],
                                        ["AU", "English (KenoGO)", process.env.NEXT_PUBLIC_BITLY_AU],
                                    ].map(([code, name, link]) => (
                                        <option key={link} value={`https://bit.ly/${link}`}>
                                            {getCountry(code).emoji} {name}
                                        </option>
                                    ))}
                                </Select>
                            </Flex>
                        </FormControl>
                    </Flex>
                    <Flex justifyContent="flex-end">
                        <Button colorScheme="teal" variant="ghost" type="reset" onClick={onCancel}>
                            Cancel
                        </Button>
                        <Button
                            colorScheme="teal"
                            marginLeft={4}
                            type="submit"
                            isDisabled={busy || characterCount > maxSmsTextLength}
                        >
                            {busy && <Spinner size="sm" marginRight={2} />}
                            Save template
                        </Button>
                    </Flex>
                </Stack>
            </Stack>
        </form>
    );
};
