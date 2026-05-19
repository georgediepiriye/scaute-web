import axios from "axios";

export const API = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}`,
  withCredentials: true,
});

API.interceptors.request.use(
  (config) => {
    // Ensure the string matches EXACTLY what you set inside your login screen logic
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("skaute_token")
        : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
