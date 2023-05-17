import React, { useEffect } from "react";
import { useTable, usePagination, HeaderGroup, Row, CellProps, useSortBy } from "react-table";
import { Table, Thead, Tbody, Tr, Th, Td, Flex, IconButton, Text, Tooltip, Spinner } from "@chakra-ui/react";
import {
    ArrowRightIcon,
    ArrowLeftIcon,
    ChevronRightIcon,
    ChevronLeftIcon,
    ChevronDownIcon,
    ChevronUpIcon,
} from "@chakra-ui/icons";
import styled from "@emotion/styled";
import * as config from "../config";
import { TableOptions } from "src/utils";

interface ColumnHeader<T extends {}> {
    Header?: string;
    accessor: any;
    Cell?: (cell: CellProps<T>) => JSX.Element;
}

interface CustomTableProps<T extends {}> extends TableOptions {
    withPagination?: boolean;
    columns: Array<ColumnHeader<T>>;
    data: Array<T>;
}

const Wrapper = styled.div`
    position: relative;
`;

const SpinnerOverlay = styled.div`
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(255, 255, 255, 0.8);
`;

export const CustomTable = <T extends object>({
    columns,
    data,
    withPagination = false,
    offset = 0,
    onPaginate,
    sortBy,
    sortDir,
    onSort,
    total = 0,
}: CustomTableProps<T>) => {
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        prepareRow,
        page,
        pageCount,
        state: { sortBy: sortByState },
    } = useTable<T>(
        {
            columns,
            data,
            manualPagination: true,
            autoResetPage: false,
            manualSortBy: true,
            autoResetFilters: false,
            pageCount: Math.ceil(total / config.PAGE_SIZE),
            pageIndex: offset,
            desc: true,
            initialState: {
                sortBy: [
                    {
                        id: sortBy,
                        desc: sortDir === "desc",
                    },
                ],
            },
        },
        useSortBy,
        usePagination
    );

    const { id, desc } = sortByState[0] || { id: null, desc: null };

    const canPreviousPage = offset > 0;
    const canNextPage = offset + 1 < pageCount;

    useEffect(() => {
        if (id) {
            onSort({ sortBy: id, sortDir: desc ? "desc" : "asc" });
        } else {
            onSort({ sortBy: "", sortDir: "asc" });
        }
    }, [desc, id, onSort]);

    const renderHeaderGroup = (headerGroup: HeaderGroup<T>) =>
        headerGroup.headers.map((column) => {
            const { key, ...restColumn } = column.getHeaderProps(column.getSortByToggleProps());

            return (
                <Th key={key} {...restColumn} style={{ whiteSpace: "nowrap" }}>
                    {column.render("Header")}
                    <span>{column.isSorted ? column.isSortedDesc ? <ChevronDownIcon /> : <ChevronUpIcon /> : ""}</span>
                </Th>
            );
        });

    const renderHeaderGroups = (headerGroups: Array<HeaderGroup<T>>) =>
        headerGroups.map((headerGroup) => {
            const { key, ...restHeaderGroupProps } = headerGroup.getHeaderGroupProps();

            return (
                <Tr key={key} {...restHeaderGroupProps}>
                    {renderHeaderGroup(headerGroup)}
                </Tr>
            );
        });

    const renderRow = (row: Row<T>) =>
        row.cells.map((cell) => {
            const { key, ...restCellProps } = cell.getCellProps();

            return (
                <Td key={key} {...restCellProps}>
                    {cell.render("Cell")}
                </Td>
            );
        });

    const renderPage = (rows: Array<Row<T>>) =>
        rows.map((row: Row<T>) => {
            prepareRow(row);
            const { key, ...restRowProps } = row.getRowProps();

            return (
                <tr key={key} {...restRowProps}>
                    {renderRow(row)}
                </tr>
            );
        });

    return (
        <Wrapper>
            {false && (
                <SpinnerOverlay>
                    <Spinner />
                </SpinnerOverlay>
            )}
            <Table {...getTableProps()}>
                <Thead>{renderHeaderGroups(headerGroups)}</Thead>
                <Tbody {...getTableBodyProps()}>{renderPage(page)}</Tbody>
            </Table>

            {withPagination && (
                <Flex justifyContent="space-between" m={4} alignItems="center">
                    <Flex>
                        <Tooltip label="First Page" placement="top">
                            <IconButton
                                aria-label="First Page"
                                onClick={() => onPaginate(0)}
                                isDisabled={!canPreviousPage}
                                icon={<ArrowLeftIcon h={3} w={3} />}
                                mr={4}
                            />
                        </Tooltip>
                        <Tooltip label="Previous Page" placement="top">
                            <IconButton
                                aria-label="Previous Page"
                                onClick={() => onPaginate(offset - 1)}
                                isDisabled={!canPreviousPage}
                                icon={<ChevronLeftIcon h={6} w={6} />}
                            />
                        </Tooltip>
                    </Flex>

                    <Flex alignItems="center">
                        <Text flexShrink="0" mr={8}>
                            Page{" "}
                            <Text fontWeight="bold" as="span">
                                {offset + 1}
                            </Text>{" "}
                            of{" "}
                            <Text fontWeight="bold" as="span">
                                {pageCount > 0 ? pageCount : 1}
                            </Text>
                        </Text>
                    </Flex>

                    <Flex>
                        <Tooltip label="Next Page" placement="top">
                            <IconButton
                                aria-label="Next Page"
                                onClick={() => onPaginate(offset + 1)}
                                isDisabled={!canNextPage}
                                icon={<ChevronRightIcon h={6} w={6} />}
                            />
                        </Tooltip>
                        <Tooltip label="Last Page" placement="top">
                            <IconButton
                                aria-label="Last Page"
                                onClick={() => onPaginate(pageCount - 1)}
                                isDisabled={!canNextPage}
                                icon={<ArrowRightIcon h={3} w={3} />}
                                ml={4}
                            />
                        </Tooltip>
                    </Flex>
                </Flex>
            )}
        </Wrapper>
    );
};
