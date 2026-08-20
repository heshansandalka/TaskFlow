import client from "./client";

export const tasksApi = {
  create: (listId, payload) =>
    client.post(`/lists/${listId}/tasks`, payload).then((r) => r.data),

  update: (taskId, payload) =>
    client.patch(`/tasks/${taskId}`, payload).then((r) => r.data),

  remove: (taskId) => client.delete(`/tasks/${taskId}`).then((r) => r.data),

  // Moves a card to a new list and/or position — drives drag-and-drop
  move: (taskId, { toListId, toIndex }) =>
    client
      .patch(`/tasks/${taskId}/move`, { toListId, toIndex })
      .then((r) => r.data),

  assign: (taskId, userId) =>
    client.patch(`/tasks/${taskId}/assign`, { userId }).then((r) => r.data),

  addComment: (taskId, text) =>
    client.post(`/tasks/${taskId}/comments`, { text }).then((r) => r.data),

  toggleChecklistItem: (taskId, itemId) =>
    client
      .patch(`/tasks/${taskId}/checklist/${itemId}`)
      .then((r) => r.data),
};
