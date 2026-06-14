import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "/api",
  headers: { "Content-Type": "application/json" },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const register        = (data)     => API.post("/auth/register", data);
export const login           = (data)     => API.post("/auth/login", data);
export const getMe           = ()         => API.get("/auth/me");

// ✅ purposeMeta carries university/competitive exam context
export const startSession    = (userId, role, difficulty, questionType, purpose, purposeMeta) =>
  API.post("/session/start", { userId, role, difficulty, questionType, purpose, purposeMeta });

export const submitAnswer    = (payload)  => API.post("/session/answer", payload);
export const endSession      = (sessionId) => API.post("/session/end", { sessionId });
export const getSession      = (sessionId) => API.get(`/session/${sessionId}`);
export const getUserHistory  = (userId)   => API.get(`/history/${userId}`);

export default API;