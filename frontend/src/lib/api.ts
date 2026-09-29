// Compatibility import for existing components. The canonical client lives in
// src/api.js and owns the shared API base URL and request handling.
import api, { API_BASE_URL } from "@/api";

export { API_BASE_URL };
export default api;
