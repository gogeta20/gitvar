const DEFAULT_API_BASE_URL = "http://127.0.0.1:7878";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL;
