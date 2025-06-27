# 📝 Approach & Methodology: Mini Student Application Platform

## 1. 🧠 My Understanding

I interpreted the task as building a lightweight, full-stack student management app using the MERN stack. Since React is more modern and familiar for me than Angular, I used React with Vite for the frontend. I focused on keeping the app modular and secure, with basic auth, student listing, and an option to add students.

---

## 2. 🏗️ How I Structured It

```
.
├── client/         # React frontend (Vite)
├── server/         # Express backend
├── dist/           # Compiled output (frontend + backend)
└── Dockerfile      # Build & run everything together
```

The backend serves both the API and the static frontend (built with Vite) using `express.static()` when in production. During development, I use Vite dev middleware. The API is RESTful (`/api/login`, `/api/register`, etc.).

---

## 3. 🔧 Why I Chose These Tools

| Part     | Tool                     | Reason                              |
| -------- | ------------------------ | ----------------------------------- |
| Frontend | React + Vite             | Fast dev environment, supports ESM  |
| Backend  | Node + Express           | Simple, familiar, fast to scaffold  |
| Database | MongoDB Atlas            | Easy cloud setup, free tier         |
| Auth     | JWT                      | Stateless auth, works well for APIs |
| Hosting  | Railway + GitHub Actions | No card required, fast CI/CD        |

I wanted a stack that would be quick to deploy and easy to test without local setup barriers.

---

## 4. 🔐 Security & 🧪 Performance

* JWT is used for authentication. The token is stored in localStorage (simple for now, could be improved later).
* I ensured protected routes check auth with middleware.
* Vite’s static output and Railway hosting make the app load fast in production.

---

## 5. ⚠️ Challenges I Ran Into

| What Happened                          | What I Did                                      |
| -------------------------------------- | ----------------------------------------------- |
| Vite trying to run in dev mode in prod | Set NODE\_ENV manually in Dockerfile            |
| Frontend not loading in Railway        | Fixed public path + static route in Express     |
| MongoDB wasn’t connecting at first     | Wrapped DB logic in async block and used `.env` |

---

## 6. 🚀 What I'd Improve If I Had More Time

* Add user roles (e.g., admin, student)
* Write proper validation with Zod or Joi
* Add unit tests and maybe Cypress for frontend
* Improve error messages and loading states
* Add pagination or filters for the student list
* Polish the UI (animations, layout tweaks)

---

Written by **Banshi Lal Nain**, with focus on clarity and practical implementation.
