import { neru } from "neru-alpha";
import fetch, { RequestInit, Response } from "node-fetch";

const state = neru.getInstanceState();

const baseURL = process.env.API_BASE_URL;
const USERNAME = process.env.API_USERNAME;
const PASSWORD = process.env.API_PASSWORD;

if (!USERNAME || !PASSWORD) {
    throw new Error("API_USERNAME and API_PASSWORD environment variables must be set");
}

// Function to obtain a new session authentication token
const fetchAuthToken = async (username: string, password: string): Promise<string> => {
    try {
        const response = await fetch(`${baseURL}/current/general/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
        });

        return (await response.json()) as string;
    } catch (error) {
        console.error("Error fetching authentication token:", error.message);
        throw new Error("Error fetching authentication token:" + error.message);
    }
};

// Custom fetch function to handle token refreshing
export const apiClient = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const username = USERNAME;
    const password = PASSWORD;

    let token: string = await state.get("authToken");

    if (!token) {
        token = await fetchAuthToken(username, password);
        await state.set("authToken", token);
    }

    options.headers = {
        ...options.headers,
        "Content-Type": "application/json",
        "Authorization-Token": token,
    };

    const response = await fetch(url, options);

    if (response.status === 403) {
        // Token expired, fetch a new one and retry the request
        token = await fetchAuthToken(username, password);
        state.set("authToken", token);

        options.headers = {
            ...options.headers,
            "Content-Type": "application/json",
            "Authorization-Token": token,
        };

        return fetch(url, options);
    }

    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
    }

    return response;
};
