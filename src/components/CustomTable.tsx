import React from "react";
import {
  useTable,
  usePagination,
  HeaderGroup,
  Row,
  CellProps,
  useSortBy,
  IdType,
} from "react-table";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Flex,
  IconButton,
  Text,
  Tooltip,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import {
  ArrowRightIcon,
  ArrowLeftIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@chakra-ui/icons";

interface ColumnHeader<T extends {}> {
  Header: string;
  accessor?: keyof T extends never ? IdType<T> : never;
  Cell?: (cell: CellProps<T>) => JSX.Element;
}

interface CustomTableProps<T extends {}> {
  withPagination?: boolean;
  columns:
    | Array<ColumnHeader<T> & { columns: Array<ColumnHeader<T>> }>
    | Array<ColumnHeader<T>>;
  data: Array<T>;
}

export const CustomTable = <T extends object>({
  columns,
  data,
  withPagination = false,
}: CustomTableProps<T>) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable<T>(
    {
      columns,
      data,
    },
    useSortBy,
    usePagination
  );

  const renderHeaderGroup = (headerGroup: HeaderGroup<T>) =>
    headerGroup.headers.map((column) => {
      const { key, ...restColumn } = column.getHeaderProps(
        column.getSortByToggleProps()
      );
      return (
        <Th key={key} {...restColumn} style={{ whiteSpace: "nowrap" }}>
          {column.render("Header")}
          <span>
            {column.isSorted ? (
              column.isSortedDesc ? (
                <ChevronDownIcon />
              ) : (
                <ChevronUpIcon />
              )
            ) : (
              ""
            )}
          </span>
        </Th>
      );
    });

  const renderHeaderGroups = (headerGroups: Array<HeaderGroup<T>>) =>
    headerGroups.map((headerGroup) => {
      const { key, ...restHeaderGroupProps } =
        headerGroup.getHeaderGroupProps();

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
    <>
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
                onClick={() => gotoPage(0)}
                isDisabled={!canPreviousPage}
                icon={<ArrowLeftIcon h={3} w={3} />}
                mr={4}
              />
            </Tooltip>
            <Tooltip label="Previous Page" placement="top">
              <IconButton
                aria-label="Previous Page"
                onClick={previousPage}
                isDisabled={!canPreviousPage}
                icon={<ChevronLeftIcon h={6} w={6} />}
              />
            </Tooltip>
          </Flex>

          <Flex alignItems="center">
            <Text flexShrink="0" mr={8}>
              Page{" "}
              <Text fontWeight="bold" as="span">
                {pageIndex + 1}
              </Text>{" "}
              of{" "}
              <Text fontWeight="bold" as="span">
                {pageOptions.length}
              </Text>
            </Text>
            <Text flexShrink="0">Go to page:</Text>{" "}
            <NumberInput
              ml={2}
              mr={8}
              w={28}
              min={1}
              max={pageOptions.length}
              onChange={(value) => {
                const page = value ? parseInt(value, 10) - 1 : 0;
                gotoPage(page);
              }}
              defaultValue={pageIndex + 1}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <Select
              w={32}
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
              }}
            >
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  Show {pageSize}
                </option>
              ))}
            </Select>
          </Flex>

          <Flex>
            <Tooltip label="Next Page" placement="top">
              <IconButton
                aria-label="Next Page"
                onClick={nextPage}
                isDisabled={!canNextPage}
                icon={<ChevronRightIcon h={6} w={6} />}
              />
            </Tooltip>
            <Tooltip label="Last Page" placement="top">
              <IconButton
                aria-label="Last Page"
                onClick={() => gotoPage(pageCount - 1)}
                isDisabled={!canNextPage}
                icon={<ArrowRightIcon h={3} w={3} />}
                ml={4}
              />
            </Tooltip>
          </Flex>
        </Flex>
      )}
    </>
  );
};
