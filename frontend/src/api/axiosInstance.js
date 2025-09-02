import axios from "axios";
import { showSnackbar } from "../features/ui/uiSlice";
import { store } from "../app/store";

const axiosInstance = axios.create({
  baseURL: "http://localhost:9000/api",
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Something went wrong";

    try {
      store.dispatch(showSnackbar({ message, severity: "error" }));
    } catch (e) {
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
