# 🎓 Smart Study Planner
### A production-quality full-stack web app for CS portfolio projects

**Plan Smarter. Study Better. Achieve More.**

A complete, modern SaaS-style study planner with an integrated **AI Study Assistant** powered by OpenAI — built with Node.js, Express, MongoDB, JWT auth, and a beautiful glassmorphism frontend.

---

## 🚀 Features

| Module | Details |
|---|---|
| **Authentication** | JWT login/signup, password hashing with bcrypt, protected routes |
| **Dashboard** | Stats cards, weekly hours bar, task completion donut, subject progress chart |
| **Subject Management** | Full CRUD with color tags, credits, priority, progress slider |
| **Daily Tasks** | Full CRUD with search, filter by priority/status, sort, due dates, overdue detection |
| **Study Calendar** | Monthly + weekly views, click-to-create, drag-and-drop-like session editor |
| **Progress Analytics** | Bar, pie, line & doughnut charts via Chart.js, per-subject progress bars |
| **AI Study Assistant** | OpenAI-powered schedule generator, task time predictor, daily plan recommender |
| **Profile Page** | Edit name/university/department, avatar upload (base64) |
| **Settings** | Dark/light mode toggle (localStorage), notification toggles, change password |
| **Design System** | Glassmorphism, gradient backgrounds, smooth animations, full dark mode, responsive |

---

## 📁 Project Structure

```
smart-study-planner/
├── backend/
│   ├── config/
│   │   ├── db.js               # MongoDB connection
│   │   └── openai.js           # OpenAI client (deferred init)
│   ├── controllers/
│   │   ├── authController.js   # register, login
│   │   ├── subjectController.js
│   │   ├── taskController.js
│   │   ├── scheduleController.js
│   │   ├── progressController.js
│   │   ├── userController.js
│   │   └── aiController.js     # AI schedule, predict, daily plan
│   ├── middleware/
│   │   ├── authMiddleware.js   # JWT protect middleware
│   │   └── errorMiddleware.js  # Centralized error handling
│   ├── models/
│   │   ├── User.js
│   │   ├── Subject.js
│   │   ├── Task.js
│   │   └── Schedule.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── subjectRoutes.js
│   │   ├── taskRoutes.js
│   │   ├── scheduleRoutes.js
│   │   ├── progressRoutes.js
│   │   ├── userRoutes.js
│   │   └── aiRoutes.js
│   ├── utils/
│   │   └── generateToken.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── css/
    │   └── style.css           # Full design system (glassmorphism, dark mode)
    ├── js/
    │   ├── api.js              # Fetch wrapper + API base URL
    │   ├── auth.js             # Login/logout/requireAuth helpers
    │   ├── theme.js            # Dark/light mode toggle
    │   ├── ui.js               # Toast, loader, scroll reveal
    │   ├── layout.js           # Sidebar + topbar injection
    │   ├── ai-assistant.js     # AI frontend module (3 features)
    │   ├── dashboard.js
    │   ├── subjects.js
    │   ├── tasks.js
    │   ├── calendar.js
    │   ├── progress.js
    │   ├── profile.js
    │   └── settings.js
    ├── index.html              # Landing page
    ├── login.html
    ├── signup.html
    ├── dashboard.html
    ├── subjects.html
    ├── tasks.html
    ├── calendar.html
    ├── progress.html
    ├── ai-assistant.html
    ├── profile.html
    └── settings.html
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- OpenAI API key (for AI features)

---

### 1. Clone / Download

```bash
git clone <your-repo-url>
cd smart-study-planner
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create your `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
NODE_ENV=development

# MongoDB — use your Atlas URI or local instance
MONGO_URI=mongodb://127.0.0.1:27017/smart_study_planner

# JWT — use a long random string
JWT_SECRET=supersecretjwtkey1234567890abcdef

# OpenAI — required for AI Assistant features
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-4o-mini

# CORS — match your frontend origin
CLIENT_URL=http://localhost:5500
```

Start the server:

```bash
# Development (auto-restart with nodemon)
npm run dev

# Production
npm start
```

The API will be live at: **http://localhost:5000**

---

### 3. MongoDB Setup

**Option A — Local MongoDB:**
```bash
# Install MongoDB Community (https://www.mongodb.com/try/download/community)
mongod --dbpath /data/db
# Database will be created automatically on first run
```

**Option B — MongoDB Atlas (Cloud, free tier):**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get your connection URI
4. Replace `MONGO_URI` in `.env`:
```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/smart_study_planner
```

---

### 4. Frontend Setup

No build step needed — it's vanilla HTML/CSS/JS.

**Option A — VS Code Live Server** (recommended for dev):
1. Install the "Live Server" extension in VS Code
2. Right-click `frontend/index.html` → **Open with Live Server**
3. It opens at `http://localhost:5500`

**Option B — Any static file server:**
```bash
cd frontend
npx serve .
# Opens at http://localhost:3000
```

**Option C — Serve via Express (production):**
Add this to `backend/server.js`:
```js
const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend')));
```
Then serve everything from the backend on port 5000.

> ⚠️ Make sure `API_BASE_URL` in `frontend/js/api.js` matches your backend URL.

---

## 🔌 REST API Reference

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login, returns JWT |

### Subjects
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/subjects?search=` | Private |
| POST | `/api/subjects` | Private |
| PUT | `/api/subjects/:id` | Private |
| DELETE | `/api/subjects/:id` | Private |

### Tasks
| Method | Endpoint | Query Params |
|---|---|---|
| GET | `/api/tasks` | `search`, `priority`, `completed`, `subject`, `sort` |
| POST | `/api/tasks` | — |
| PUT | `/api/tasks/:id` | — |
| DELETE | `/api/tasks/:id` | — |

### Schedules
| Method | Endpoint | Query Params |
|---|---|---|
| GET | `/api/schedules` | `from` (ISO date), `to` (ISO date) |
| POST | `/api/schedules` | — |
| PUT | `/api/schedules/:id` | — |
| DELETE | `/api/schedules/:id` | — |

### Progress
| Method | Endpoint | Returns |
|---|---|---|
| GET | `/api/progress` | Stats, weekly hours, subject progress, priority breakdown |

### Users
| Method | Endpoint |
|---|---|
| GET | `/api/users/profile` |
| PUT | `/api/users/profile` |
| PUT | `/api/users/change-password` |
| PUT | `/api/users/settings` |

### AI Study Assistant 🤖
| Method | Endpoint | Body | Description |
|---|---|---|---|
| GET | `/api/ai/daily-plan` | — | Today's recommended study plan |
| POST | `/api/ai/suggest-schedule` | `{ startDate, endDate, dailyAvailableHours }` | AI-generated week schedule |
| POST | `/api/ai/predict-completion` | `{ taskId? }` | Time predictions for pending tasks |

---

## 🤖 AI Study Assistant Details

The AI Assistant (`/api/ai/*`) uses **OpenAI's `gpt-4o-mini`** model via structured JSON prompts.

### How it works:

1. **Daily Plan** — Fetches all pending tasks + subjects + upcoming schedules, sends them to GPT, gets back a prioritized plan for today with motivational tips.

2. **Schedule Generator** — Takes your date range and daily hours, sends your full workload to GPT, gets back a week of sessions (title, date, start/end time, reason). Each session can be one-click added to your calendar.

3. **Time Predictor** — Sends all pending tasks (title, subject, priority, due date, notes) to GPT, gets back realistic time estimates with confidence levels and reasoning.

### Changing the model:
```env
OPENAI_MODEL=gpt-4o        # More powerful, higher cost
OPENAI_MODEL=gpt-4o-mini   # Default — fast and cost-effective
OPENAI_MODEL=gpt-3.5-turbo # Budget option
```

---

## 🎨 Design System

- **Primary:** `#6366F1` (Indigo)
- **Secondary:** `#8B5CF6` (Purple)
- **Accent:** `#06B6D4` (Cyan)
- **Success:** `#10B981` (Emerald)
- **Glassmorphism:** `backdrop-filter: blur(16px)` + translucent backgrounds
- **Dark mode:** CSS `[data-theme="dark"]` variables, saved to localStorage
- **Fonts:** Poppins (Google Fonts)
- **Icons:** Font Awesome 6
- **Charts:** Chart.js 4

---

## 🛠️ Tech Stack

**Frontend:** HTML5, CSS3, Vanilla JS (ES6), Bootstrap 5, Font Awesome 6, Chart.js 4

**Backend:** Node.js, Express.js, Mongoose, bcryptjs, jsonwebtoken, OpenAI SDK, morgan, cors

**Database:** MongoDB

**AI:** OpenAI Chat Completions API (JSON mode)

---

## 📝 Environment Variables Summary

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default: 5000) |
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret key for JWT signing |
| `JWT_EXPIRES_IN` | No | Token expiry (default: 7d) |
| `OPENAI_API_KEY` | For AI features | Your OpenAI API key |
| `OPENAI_MODEL` | No | Model name (default: gpt-4o-mini) |
| `CLIENT_URL` | No | Frontend URL for CORS |

---

## 🚦 Quick Start (TL;DR)

```bash
# 1. Backend
cd backend && cp .env.example .env
# Edit .env with your MONGO_URI and OPENAI_API_KEY
npm install && npm run dev

# 2. Frontend
# Open frontend/index.html with VS Code Live Server
# Or: cd frontend && npx serve .
```

---

*Built as a full-stack portfolio project showcasing Node.js, MongoDB, JWT auth, REST APIs, Chart.js, and OpenAI integration.*
