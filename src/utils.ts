import { Campaign } from "./pages";
import { Template } from "./pages/templates";

let counter = 0;

export const generateUniqueId = () => {
  const timestamp = Date.now(); // Get the current timestamp in milliseconds
  counter = (counter + 1) % 1000; // Increment the counter and wrap it around at 1000
  return timestamp * 1000 + counter; // Combine the timestamp and counter to create a unique ID
};

export function timestampToYMD(timestamp: string): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based in JavaScript
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function addDaysToTimestamp(timestamp: string, days: number) {
  let date = new Date(timestamp);
  date.setDate(date.getDate() + days);

  let year = date.getFullYear();
  let month = String(date.getMonth() + 1).padStart(2, '0');  // JavaScript months are 0-based
  let day = String(date.getDate()).padStart(2, '0');
  let hours = String(date.getHours()).padStart(2, '0');
  let minutes = String(date.getMinutes()).padStart(2, '0');
  let seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export function fillTemplate(template: string, dictionary: Record<string, string>) {
  return template.replace(/{{\s*(.*?)\s*}}/g, function (_, key) {
    return dictionary[key.trim()] || '';
  });
}

interface SortOptions {
  sortBy: string;
  sortDir: "asc" | "desc";
}

interface PaginationOptions {
  offset?: number;
  total: number;
}

export interface TableOptions extends SortOptions, PaginationOptions {
  onSort: (data: SortOptions) => void;
  onPaginate: (offset: number) => void;
}

export const fetcher = (input: RequestInfo, init?: RequestInit) =>
  fetch(input, init).then(async (res) => {
    if (res.ok) {
      return res.json();
    }

    const { message } = (await res.json()) ?? { message: "Unknown error" };

    throw new Error(message);
  });

export const makeQuery = (
  filter: Partial<Template> | Partial<Campaign> | SortOptions
) => {
  let queryParams: Array<string> = [];

  Object.entries(filter).forEach(([key, value]) => {
    const trimmedValue = String(value)?.trim();

    if (trimmedValue) {
      queryParams.push(`${key}=${trimmedValue}`);
    }
  });

  return queryParams ? `&${queryParams.join("&")}` : "";
};

export const getSortQuery = (sort: SortOptions) => {
  const { sortBy, sortDir } = sort;
  if (sortBy) {
    return makeQuery({ sortBy, sortDir });
  }

  return "";
};
