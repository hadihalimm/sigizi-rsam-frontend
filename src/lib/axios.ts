import useSessionStore from "@/hooks/use-session";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    if (err.response?.status === 401) {
      useSessionStore.getState().clearSession();
      toast.error(String((err.response?.data as { error: string }).error));
      setTimeout(() => {
        window.location.href = "/sign-in";
      }, 1000);
      return;
    }
    return Promise.reject(err);
  },
);

export default api;
