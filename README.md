# 🎓 Mini Student Application Platform — README

The project is a simple MERN-based student management platform with login/register, a dashboard to list students, and an option to add new student data.

---

## ✨ What’s Included

* JWT-based login/registration
* Student dashboard (read/add)
* Backend APIs using Express
* MongoDB Atlas as the database
* Docker support
* CI/CD via GitHub Actions to Railway

---

## 🛠 Stack Used

* **Frontend**: React + Vite
* **Backend**: Express + Node.js
* **Database**: MongoDB Atlas
* **Auth**: JWT
* **CI/CD**: GitHub Actions → Railway

---

## 🚀 How to Run

### Requirements

* Node.js v18+
* A MongoDB Atlas URI

### Install

```bash
git clone https://github.com/bunnyNain/study_now.git
cd study_now
npm install
```

set The MongoDB Atlas URI to "study_now/server/mongodb-storage.ts"

```

### Run Locally

```bash
npm run build
npm start
```

### Or Use Docker

```bash
docker build -t study-now .
docker run -p 5000:5000 study-now
```

---

## 📁 Project Structure

```
.
├── client/         # React + Vite frontend
├── server/         # Express backend
├── dist/           # Compiled build
├── public/         # Vite static files
├── Dockerfile
└── .github/workflows/railway-deploy.yml
```

---

## 🔐 API Endpoints

| Method | Endpoint      | Description             |
| ------ | ------------- | ----------------------- |
| POST   | /api/register | Register new user       |
| POST   | /api/login    | Login and get JWT       |
| GET    | /api/students | Get all students (auth) |
| POST   | /api/students | Add a student (auth)    |

---

## 🌐 Live Link

App is deployed using Railway.

👉 [https://studynow-production.up.railway.app/](https://studynow-production.up.railway.app/)

---

## 📄 Notes

Check out the `Approach & Methodology` document in the repo for a deeper dive into the decisions, challenges, and improvements.

Thanks for reviewing!

— Banshi Lal Nain
