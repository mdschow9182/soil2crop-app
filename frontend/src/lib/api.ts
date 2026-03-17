import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach farmer_id automatically if available
api.interceptors.request.use((config) => {
  const farmerId = localStorage.getItem("farmer_id");
  if (farmerId) {
    config.headers["x-farmer-id"] = farmerId;
  }
  return config;
});

export default api;
