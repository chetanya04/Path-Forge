# SkillPath

An app that tracks your skills, finds matching jobs, reads your resume automatically, and sends you a career update email — all in one place.

## What it does

- **Skill Gap Dashboard** — shows what skills you have vs what jobs need
- **Live Job Tracker** — pulls real job openings that match your profile
- **Resume Parser** — upload your resume, skills get added automatically
- **Career Digest** — get a career/job update email on a schedule you set

## Tech Stack

**Backend:** Node.js, Express, MongoDB (Mongoose), JWT auth, Groq AI, node-cron
**Frontend:** React
**Deployment:** Frontend on Vercel, Backend on Render

## Setup

1. Clone the repo
   ```
   git clone https://github.com/chetanya04/skillpath.git
   cd skillpath
   ```

2. Install dependencies
   ```
   cd backend && npm install
   cd ../client && npm install
   ```

3. Add environment variables (`.env` in `backend/`)
   ```
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_secret
   GROQ_API_KEY=your_groq_key
   ADZUNA_APP_ID=your_adzuna_id
   ADZUNA_APP_KEY=your_adzuna_key
   ```

4. Run it
   ```
   # backend
   node index.js

   # frontend
   npm start
   ```

## How it works

1. Fill in your profile (name, skills, education, experience)
2. AI suggests career paths based on your profile
3. Chat with AI about any suggested career
4. Track your skill gaps against real job listings
5. Set a schedule to get career digest emails automatically

---
Built as a college project.
