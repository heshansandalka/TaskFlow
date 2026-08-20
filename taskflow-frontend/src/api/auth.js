import client from "./client";

export const authApi = {
  register: (name, email, password) =>
    client.post("/auth/register", { name, email, password }).then((r) => r.data),

  login: (email, password) =>
    client.post("/auth/login", { email, password }).then((r) => r.data),

  me: () => client.get("/auth/me").then((r) => r.data),

  updateProfile: (payload) =>
    client.patch("/auth/me", payload).then((r) => r.data),
};
