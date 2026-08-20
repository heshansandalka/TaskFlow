import client from "./client";

export const boardsApi = {
  getAll: () => client.get("/boards").then((r) => r.data),
  getOne: (boardId) => client.get(`/boards/${boardId}`).then((r) => r.data),
  create: (payload) => client.post("/boards", payload).then((r) => r.data),
  update: (boardId, payload) =>
    client.patch(`/boards/${boardId}`, payload).then((r) => r.data),
  remove: (boardId) => client.delete(`/boards/${boardId}`).then((r) => r.data),

  inviteMember: (boardId, email, role) =>
    client
      .post(`/boards/${boardId}/members`, { email, role })
      .then((r) => r.data),
  removeMember: (boardId, userId) =>
    client.delete(`/boards/${boardId}/members/${userId}`).then((r) => r.data),

  createList: (boardId, payload) =>
    client.post(`/boards/${boardId}/lists`, payload).then((r) => r.data),
  updateList: (boardId, listId, payload) =>
    client
      .patch(`/boards/${boardId}/lists/${listId}`, payload)
      .then((r) => r.data),
  removeList: (boardId, listId) =>
    client.delete(`/boards/${boardId}/lists/${listId}`).then((r) => r.data),
  reorderLists: (boardId, orderedListIds) =>
    client
      .patch(`/boards/${boardId}/lists/reorder`, { orderedListIds })
      .then((r) => r.data),
};
