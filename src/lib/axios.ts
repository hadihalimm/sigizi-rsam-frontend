import useSessionStore from "@/hooks/use-session";
import axios, { AxiosError } from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    if (err.response?.status === 401) {
      useSessionStore.getState().clearSession();
      window.location.href = "/sign-in";
    }
  },
);

export default api;
