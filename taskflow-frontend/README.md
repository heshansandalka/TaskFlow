# TaskFlow — Frontend

React (Vite) frontend for **TaskFlow**, a real-time, Trello-style task management
platform. Built for SE3106 (CCU) Software Construction and Evolution.

## Stack

- **React 19 + Vite** — UI and build tooling
- **React Router** — client-side routing
- **Tailwind CSS** — styling, with a custom design token set (see `tailwind.config.js`)
- **@dnd-kit** — accessible drag-and-drop for boards/lists/cards
- **Socket.IO client** — real-time board sync
- **Axios** — API calls with JWT auth interceptor
- **date-fns** — date formatting

## Getting started

```bash
npm install
cp .env.example .env
# edit .env to point at your backend, e.g.:
# VITE_API_URL=http://localhost:5000/api
npm run dev
```

The app runs at `http://localhost:5173` by default.

## Build for production

```bash
npm run build
```

Output goes to `dist/`. Deploy `dist/` to any static host (Vercel, Netlify, etc.).

## Environment variables

| Variable        | Description                                              |
|-----------------|-----------------------------------------------------------|
| `VITE_API_URL`  | Base URL of the backend REST API (e.g. `.../api`)         |

The Socket.IO connection is derived automatically by stripping `/api` from
`VITE_API_URL` — make sure your backend serves both REST and WebSocket
traffic from the same origin, or adjust `src/context/SocketContext.jsx`.

## Project structure

```
src/
  api/            axios client + per-resource API calls (auth, boards, tasks)
  components/
    board/        BoardColumn, TaskCard, TaskModal, CreateBoardModal, InviteMemberModal
    layout/       Sidebar, Topbar, AuthShell
    ui/           Avatar, Badge, Modal — shared primitives
    NotificationBell.jsx
    ProtectedRoute.jsx
  context/        AuthContext, ThemeContext, SocketContext, ToastContext
  hooks/          useBoardRealtime — socket event wiring for live board sync
  pages/          LoginPage, RegisterPage, DashboardPage, BoardPage, NotFoundPage
  App.jsx         route definitions
  main.jsx        provider tree + app mount
```

## Backend API contract (expected)

This frontend expects a REST + Socket.IO backend matching the SRS in the
project proposal. Key endpoints it calls:

- `POST /auth/register`, `POST /auth/login`, `GET /auth/me`
- `GET /boards`, `POST /boards`, `GET /boards/:id`, `PATCH /boards/:id`
- `POST /boards/:id/members`, `DELETE /boards/:id/members/:userId`
- `POST /boards/:id/lists`, `PATCH /boards/:id/lists/:listId`, `DELETE .../lists/:listId`
- `POST /lists/:listId/tasks`, `PATCH /tasks/:id`, `DELETE /tasks/:id`
- `PATCH /tasks/:id/move`, `PATCH /tasks/:id/assign`, `POST /tasks/:id/comments`

Socket.IO events emitted/expected: `board:join`, `board:leave`,
`task:created`, `task:updated`, `task:moved`, `task:deleted`,
`list:created`, `list:updated`, `list:deleted`, `board:updated`,
`notification:assigned`, `notification:due-soon`, `notification:mention`.

## Notes

- Dark mode is the default; toggle in the top bar switches to a light theme
  (persisted in `localStorage`).
- Drag-and-drop uses optimistic UI updates — the board reorders instantly and
  syncs to the server in the background.
- If the backend isn't running yet, the app will still build and render the
  login/register screens; API calls will fail until a backend is connected.
