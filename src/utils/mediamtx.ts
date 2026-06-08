import createClient from "openapi-fetch";
import type { paths } from "#types";

const getBaseUrl = () => {
  return "http://localhost:9997";
};

const client = createClient<paths>({
  baseUrl: getBaseUrl(),
  credentials: "include",
});

export const useApi = () => client;
