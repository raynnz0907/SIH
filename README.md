# ? ATHLETIQ — Personalized Athlete Development Platform

> **Know Your Limit. Break It.**

ATHLETIQ is a full-stack athlete development platform that combines **video-based movement analysis**, **role-aware sports intelligence**, and **AI-generated training plans** to help amateur athletes understand exactly what to improve next — and how.

---

## ?? What It Does

| Feature | Description |
|---------|-------------|
| **Role-Aware Assessment** | Select your sport and playing position. The system knows what matters for a *winger* vs a *centre-back* vs a *point guard*. |
| **Video Movement Analysis** | Upload a movement video (squat, jump, sprint). MediaPipe Pose extracts 33 3D landmarks to score knee stability, hip mobility, posture, symmetry, explosiveness, flexibility, and balance. |
| **Bottleneck Identification** | A weighted scoring engine cross-references your movement scores against role-specific benchmarks to rank your top development gaps. |
| **AI Training Plans** | Gemini AI generates a structured 4-week training + recovery plan targeting your specific bottlenecks, filtered by your availability and experience. |
| **Progress Tracking** | Log sessions, track score trends over time, and re-assess movement to measure real improvement. |

---

## ??? Supported Sports & Roles

| Sport | Roles |
|-------|-------|
| ? Football | Striker, Winger, Central Midfielder, Centre-Back, Goalkeeper |
| ?? Basketball | Point Guard, Shooting Guard, Small Forward, Power Forward, Center |
| ?? Athletics | Sprinter, Middle Distance, Jumper, Thrower |

---

## ??? Architecture

```
+----------------------------------------------------------+
¦                   React + Vite Frontend                  ¦
¦  Landing ? Onboarding ? Video ? Analysis ? Dashboard    ¦
¦         ? Training Plan ? Recovery ? Progress           ¦
+----------------------------------------------------------+
                        ¦ REST API (/api/*)
+-----------------------?----------------------------------+
¦                  FastAPI Backend (Python)                 ¦
¦  Auth · Intake · Video · Assessment · Plan · Progress    ¦
+----------------------------------------------------------+
                  ¦                      ¦
      +-----------?------+   +-----------?--------------+
      ¦   PostgreSQL     ¦   ¦      AI Engine            ¦
      ¦   (profiles,     ¦   ¦  +- MediaPipe Pose        ¦
      ¦    plans,        ¦   ¦  +- Bottleneck Scorer     ¦
      ¦    progress)     ¦   ¦  +- Gemini Plan Generator ¦
      +------------------+   +--------------------------+
```

---

## ?? Project Structure

```
SIH/
+-- backend/
¦   +-- main.py                # FastAPI app entry
¦   +-- config.py              # Environment settings
¦   +-- database.py            # Async SQLAlchemy setup
¦   +-- models/                # ORM models (athlete, assessment, plan)
¦   +-- schemas/               # Pydantic v2 schemas
¦   +-- routers/               # API routes (auth, intake, video, plan, progress)
¦   +-- services/
¦   ¦   +-- pose_analyzer.py   # MediaPipe joint angle extraction
¦   ¦   +-- bottleneck_engine.py # Role-aware gap analysis
¦   ¦   +-- plan_generator.py  # Gemini API plan generation
¦   +-- data/
¦   ¦   +-- sport_roles.json   # Sport/role attribute mappings
¦   ¦   +-- movement_benchmarks.json
¦   ¦   +-- exercise_library.json  # 100+ exercises
¦   +-- alembic/               # DB migrations
¦   +-- requirements.txt
¦   +-- .env.example
¦
+-- frontend/
¦   +-- src/
¦   ¦   +-- pages/             # Landing, Onboarding, VideoCapture, Analysis,
¦   ¦   ¦                      # Dashboard, TrainingPlan, RecoveryPlan, Progress
¦   ¦   +-- components/        # layout/, analysis/, plan/, progress/
¦   ¦   +-- store/             # Zustand (persisted auth + state)
¦   ¦   +-- api/               # Axios client + all API functions
¦   ¦   +-- utils/
¦   +-- package.json
¦
+-- README.md
```

---

## ?? Quick Start

### Prerequisites
- Python 3.12+
- Node.js 20+
- PostgreSQL 15+ running locally
- Gemini API key: https://aistudio.google.com/

---

### 1. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env: set DATABASE_URL, GEMINI_API_KEY, SECRET_KEY

# Create the PostgreSQL database
createdb athlete_dev

# Run migrations
alembic upgrade head

# Start backend
uvicorn main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

---

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:5173

---

### 3. .env Configuration

```env
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/athlete_dev
SECRET_KEY=your-secret-key-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
GEMINI_API_KEY=AIza...your-key
UPLOAD_DIR=./uploads
MAX_VIDEO_SIZE_MB=100
```

---

## ?? User Journey

1. **Register / Login** — Create athlete account
2. **Onboarding Wizard** — Sport ? Role ? Goals ? Ability Sliders ? Availability
3. **Movement Assessment** — Upload squat/jump/sprint video
4. **AI Pose Analysis** — MediaPipe scores 7 movement quality metrics
5. **Bottleneck Report** — Role-weighted gap analysis ranks top development priorities
6. **Training Plan** — Gemini generates 4-week plan targeting your specific bottlenecks
7. **Execute & Track** — Log sessions, track trends, re-assess to measure growth

---

## ?? AI Engine

| Component | What it does |
|-----------|-------------|
| **MediaPipe Pose** | Extracts 33 3D landmarks per frame from uploaded video |
| **Joint Angle Calculator** | Computes knee, hip, shoulder, ankle angles via vector trigonometry |
| **Movement Scorer** | Maps angles to 7 scores: Knee Stability, Hip Mobility, Posture, Symmetry, Explosiveness, Flexibility, Balance |
| **Bottleneck Engine** | `score = (1 - normalized_score) × role_weight × goal_weight` |
| **Gemini Plan Generator** | Structured JSON 4-week plan with exercises, sets/reps, coaching cues, recovery notes |

---

## ??? Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite + TailwindCSS |
| State | Zustand (persisted) |
| Charts | Recharts |
| Animations | Framer Motion |
| Backend | FastAPI + Python 3.12 |
| Database | PostgreSQL 15 |
| ORM | SQLAlchemy 2.0 (async) |
| Pose Analysis | MediaPipe Pose |
| AI Plans | Google Gemini API |
| Auth | JWT (python-jose) |

---

## ?? API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register athlete |
| POST | `/auth/login` | Login, get JWT |
| POST | `/intake/profile` | Submit onboarding profile |
| GET | `/intake/sports` | Sports + roles list |
| POST | `/video/upload` | Upload movement video |
| GET | `/video/{id}/status` | Poll analysis status |
| POST | `/assessment/manual` | Manual score input |
| GET | `/plan/current` | Get active plan |
| POST | `/plan/generate` | Generate new AI plan |
| POST | `/progress/log` | Log completed session |
| GET | `/progress/dashboard` | Analytics + trends |

---

## ?? License

MIT — Built for Smart India Hackathon (SIH).
