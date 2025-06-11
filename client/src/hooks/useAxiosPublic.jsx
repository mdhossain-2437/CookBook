import axios from "axios";

const useAxiosPublic = () => {
  const axiosPublic = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
  });
  return axiosPublic;
};

export default useAxiosPublic;