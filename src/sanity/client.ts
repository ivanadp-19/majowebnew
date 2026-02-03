import { createClient } from "next-sanity";

export const client = createClient({
  projectId: "5l74lxqg",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: true, // Use CDN for better performance and CORS handling
});
