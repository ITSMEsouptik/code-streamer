# Codestreamer - Collaborative Live Coding Interview Platform

Codestreamer is a web application designed for collaborative live coding interviews, with a future vision for AI assistance. This project allows an interviewer and an interviewee to share a real-time code editor and communicate via video/audio.

## Project Status (Up to Sprint 2 In-Progress)

*   **Sprint 0 (Setup & Basic Structure):** Complete. Monorepo setup with pnpm workspaces, Quasar (Vue3+TS) frontend, and Node.js (Express+TS) backend. Basic Socket.IO connection established.
*   **Sprint 1 (Session Management & Socket.IO Foundation):** Complete. Users can create unique sessions (as Interviewer) and other users can join existing sessions (as Interviewee) using a Session ID. Roles are assigned and communicated. Environment configuration and basic health checks implemented.
*   **Sprint 2 (Collaborative Code Editor Implementation):** In Progress. Ace Editor integrated into the frontend. Real-time code synchronization logic is being developed.

## Tech Stack

*   **Monorepo Management:** [pnpm Workspaces](https://pnpm.io/workspaces)
*   **Frontend (`client` workspace):**
    *   Framework: [Vue.js 3](https://vuejs.org/) with [TypeScript](https://www.typescriptlang.org/)
    *   UI Framework: [Quasar Framework](https://quasar.dev/) (with Vite)
    *   Real-time Communication: [Socket.IO Client](https://socket.io/docs/v4/client-api/)
    *   Code Editor: [Ace Editor](https://ace.c9.io/) via [vue-ace-editor](https://github.com/chairuosen/vue-ace-editor) (or similar wrapper)
*   **Backend (`server` workspace):**
    *   Framework: [Node.js](https://nodejs.org/) with [Express.js](https://expressjs.com/) and [TypeScript](https://www.typescriptlang.org/)
    *   Real-time Communication: [Socket.IO Server](https://socket.io/docs/v4/server-api/)
*   **Development Tooling:**
    *   [Vite](https://vitejs.dev/) (for frontend bundling and dev server)
    *   [ts-node-dev](https://github.com/wclr/ts-node-dev) (for backend auto-reloading in development)
    *   ESLint, Prettier

## Prerequisites

*   [Node.js](https://nodejs.org/) (Version specified in `engines` field of `package.json` files, e.g., >=18.0.0)
*   [pnpm](https://pnpm.io/installation) (Version specified in `engines` field, e.g., >=8.0.0)
*   A modern web browser (Chrome, Firefox, Edge recommended)

## Project Structure (Monorepo)
codestreamer-monorepo/
├── .git/
├── client/ 
│ ├── public/
│ ├── src/
│ ├── quasar.config.js
│ ├── package.json
│ └── ...
├── server/ 
│ ├── src/
│ ├── package.json
│ └── ...
├── .gitignore
├── pnpm-workspace.yaml # Defines pnpm workspaces
├── package.json # Root package.json (for monorepo scripts & dev tools)
└── README.md
## Getting Started & Project Execution

Follow these steps to get the Codestreamer application running locally up to the current sprint's progress.

**1. Clone the Repository:**

```bash
git clone <your-repository-url> codestreamer-monorepo
cd codestreamer-monorepo

pnpm install

```
## Environment Configuration:

The application uses environment variables for configuration.
Backend (server/.env):
Create a .env file in the codestreamer-monorepo/server/ directory with the following content (adjust port if needed):
### server/.env
PORT=3001
CLIENT_ORIGIN=http://localhost:9000 # Default Quasar dev port, adjust if different

Frontend (client/.env or client/.env.local):
Create a .env or .env.local file in the codestreamer-monorepo/client/ directory:
### client/.env or client/.env.local
VITE_BACKEND_URL=http://localhost:3001 # URL of your backend server

(Note: Ensure .env and .env.local files are listed in your root .gitignore)

## Run Development Servers

```bash
pnpm run dev
```
This command typically executes:
Backend server (e.g., ts-node-dev server/src/server.ts) usually on http://localhost:3001.
Frontend Quasar development server (e.g., quasar dev) usually on http://localhost:9000 (or another port configured in quasar.config.js).
You should see console output from both servers indicating they have started successfully.

## Development Workflow (Git)
This project follows a Gitflow-inspired branching model:

main: Production-ready code.
develop: Main integration branch for features.
feature/sprintX-feature-name: Branches for new features or sprint work (e.g., feature/sprint2-collaborative-editor). These are created from develop and merged back into develop via Pull Requests.

To contribute or continue development:
1. Ensure you are on the develop branch and it's up-to-date:

```bash
git checkout develop
git pull origin develop
```
2. Create a new feature branch for your work:

```bash
git checkout -b feature/your-feature-name
```
3. Make your changes, commit regularly.
4. Push your feature branch and create a Pull Request to develop

Next Steps (Beyond Current Sprints)
1.Full WebRTC integration for video/audio.
2.Advanced collaborative editor features (cursors, selections).
3.AI assistance features (code explanation, hints - using OpenAI Codex).
4.User authentication and profiles.
5.Question bank and session management tools for interviewers.
6.Deployment to a cloud platform.

