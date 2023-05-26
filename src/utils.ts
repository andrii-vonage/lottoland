import { Campaign } from "./pages";
import { Template } from "./pages/templates";
import countries from "./contries.json";

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

export const makeQuery = (filter: Partial<Template> | Partial<Campaign> | SortOptions) => {
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

export const getCountry = (code: string) => {
    return (
        countries.find((country) => country.code === code) ?? {
            name: "United Kingdom",
            code: "GB",
            emoji: "🇬🇧",
            unicode: "U+1F1EC U+1F1E7",
            image: "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/GB.svg",
        }
    );
};
