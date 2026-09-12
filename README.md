# Sportify - Personalized Athlete Development Platform

> **Train for what your game demands.**

Sportify is an intelligent, full-stack athlete development platform that pairs **computer-vision movement assessment**, **role-specific biomechanical intelligence**, and **generative AI coaching** to give amateur and aspiring athletes elite-level diagnostic and training feedback.

---

## What It Does

| Capability | Technical Overview |
|------------|---------------------|
| **Role-Aware Assessment** | Dynamic sport-and-position taxonomy. Calibration adapts whether evaluating an *Opening Batsman*, *Fast Bowler*, *Football Striker*, *Point Guard*, or *Sprinter*. |
| **Activity-Aware Computer Vision** | Evaluates specialized athletic movement through **Google MediaPipe Pose** (33 3D anatomical landmarks) and OpenCV kinematic vector math. |
| **Calibrated Quality Gate** | Validates video clarity, angle framing, and joint tracking with a flexible 70% landmark coverage baseline, 0.35 confidence threshold, high-FPS downsampling, and sub-second explosive movement detection. |
| **Biomechanical Radar Profiling** | Maps calculated kinematics against sport/role benchmarks across stability, mobility, symmetry, posture, explosive capacity, and balance. |
| **Bottleneck Diagnostic Engine** | Algorithmic gap analysis weighting raw kinematic deviations against position demands to categorize performance into *Strengths*, *Proficient*, *Development Areas*, and *Critical Bottlenecks*. |
| **AI Periodized Training Plans** | Powered by **Google Gemini 3.6 Flash**, synthesizing structured multi-week training regimens, corrective exercises, and recovery protocols targeting specific identified bottlenecks. |
| **Longitudinal Progress Tracking** | Logs training sessions, tracks performance trends over time, and supports reassessment cycles to measure real physical development. |

---

## Supported Sports & Roles

Sportify features granular role and sub-role configurations tailored to distinct kinematic demands:

| Sport | Primary Roles | Specialized Sub-Roles |
|-------|---------------|-----------------------|
| 🏏 **Cricket** | Batsman, Bowler, All-Rounder, Wicketkeeper | Opening Batsman, Top Order, Middle Order, Finisher, Fast Bowler, Swing Bowler, Spin Bowler, Wicketkeeper-Batsman |
| ⚽ **Football** | Forward, Midfielder, Defender, Goalkeeper | Striker, Winger, Central Midfielder, Attacking Midfielder, Centre-Back, Full-Back, Goalkeeper |
| 🏀 **Basketball** | Guard, Forward, Center | Point Guard, Shooting Guard, Small Forward, Power Forward, Center |
| 🏃 **Athletics** | Track, Field | Sprinter (100m/200m), Middle Distance, Jumper (Long/High/Triple), Thrower |

---

## Specialized Movement Protocols

Sportify enforces activity-specific kinematic analyzers rather than applying generic exercises to specialized athletic motions:

1. 🏏 **Cricket Batting Drive Assessment** (cricket_batting): Stance direction, lead elbow elevation, head over lead knee horizontal alignment, front knee flexion, and rotational weight transfer.
2. ⚽ **Football Strike & Kicking Mechanics** (ootball_strike): Plant-foot stability, kicking knee extension velocity, striking hip whip, and torso lean balance.
3. 🏀 **Basketball Jump Shot & Release** (asketball_jump_shot): Triple extension, elbow alignment under ball, vertical release apex, and landing stabilization.
4. 🏃 **Sprint Acceleration Mechanics** (sprint_mechanics): Forward torso acceleration lean, high knee drive elevation, hip extension, and bilateral stride symmetry.
5. ⚡ **Vertical Jump / CMJ** (ertical_jump): Countermovement load depth, explosive rate of extension, takeoff posture, and eccentric landing absorption.
6. 🏋️ **Squat Biomechanics** (squat): Deep hip flexion, femur-to-parallel depth, knee valgus/varus control, torso inclination, and bilateral knee symmetry.

---

## Architecture

`
+------------------------------------------------------------------------+
|                      React 18 + Vite Frontend                          |
|   Glassmorphic Dark UI • Zustand State • Interactive SVG Radar Chart   |
|   Landing -> Onboarding -> Studio -> Analysis -> Dashboard -> Plan     |
+------------------------------------------------------------------------+
                                     |  REST API (Axios + JWT Auth)
                                     v
+------------------------------------------------------------------------+
|                        FastAPI Backend (Python 3.11+)                  |
|    Auth (/auth/*) • Intake (/intake/*) • Video Engine (/video/*)       |
|    Assessment (/assessment/*) • Plan (/plan/*) • Progress (/progress/*)|
+------------------------------------------------------------------------+
                  |                                           |
                  v                                           v
+------------------------------------+    +------------------------------+
|          Database Layer            |    |       AI & Vision Engine     |
|  * SQLite (Zero-setup local dev)   |    |  * Google MediaPipe Tasks    |
|  * PostgreSQL (Neon cloud ready)   |    |  * Kinematic Vector Math     |
|  * SQLAlchemy 2.0 (AsyncIO)        |    |  * Bottleneck Scoring Engine |
|  * Alembic schema migrations       |    |  * Google Gemini 3.6 Flash   |
+------------------------------------+    +------------------------------+
`

---

## Project Structure

`
SIH/
+-- backend/
|   +-- main.py                    # FastAPI entrypoint, middleware, and routers
|   +-- config.py                  # Pydantic environment configuration
|   +-- database.py                # Dual-mode async DB engine (SQLite & PostgreSQL)
|   +-- models/                    # Declarative ORM models (Athlete, Assessment, Plan, etc.)
|   +-- schemas/                   # Pydantic v2 validation schemas
|   +-- routers/                   # API routes (auth, intake, video, plan, progress)
|   +-- services/
|   |   +-- pose_analyzer.py       # Activity-aware video assessment coordinator
|   |   +-- pose_detector.py       # MediaPipe Tasks PoseLandmarker adapter
|   |   +-- gemini_service.py      # Google Gemini 3.6 Flash SDK integration
|   |   +-- bottleneck_engine.py   # 4-tier gap analysis diagnostic engine
|   |   +-- plan_generator.py      # Periodized training and recovery synthesizer
|   |   +-- movement/              # Modular biomechanics protocol suite
|   |       +-- base.py            # Abstract MovementProtocol & QualityReport
|   |       +-- quality_gate.py    # VideoQualityGate validation & FPS sampler
|   |       +-- registry.py        # Dynamic protocol registry
|   |       +-- cricket_batting_analyzer.py
|   |       +-- football_strike_analyzer.py
|   |       +-- basketball_shot_analyzer.py
|   |       +-- sprint_mechanics_analyzer.py
|   |       +-- jump_analyzer.py
|   |       +-- squat_analyzer.py
|   +-- data/                      # Taxonomy, benchmarks, and 100+ exercise library
|   +-- tests/                     # Unit test suites (test_pass1.py, test_pass2.py)
|   +-- requirements.txt
|   +-- .env.example
|
+-- frontend/
|   +-- src/
|   |   +-- pages/                 # Landing, Onboarding, SportAssessmentPage,
|   |   |                          # Analysis, Dashboard, TrainingPlan, RecoveryPlan, Progress
|   |   +-- components/            # assessment/, common/, layout/, analysis/
|   |   +-- store/                 # Zustand store (persisted auth, profile, state)
|   |   +-- config/                # Sport taxonomy, assessment matrix, guides, benchmarks
|   |   +-- api/                   # Centralized Axios client with JWT interceptor
|   +-- package.json
|   +-- tailwind.config.js
|   +-- vite.config.js
|
+-- README.md
`

---

## Quick Start

### Prerequisites
- **Python**: 3.10, 3.11, 3.12, or 3.13
- **Node.js**: 18+ (LTS recommended)
- **Google Gemini API Key**: Obtain from [Google AI Studio](https://aistudio.google.com/)

---

### 1. Backend Setup

`ash
cd backend

# 1. Create and activate a virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment variables
copy .env.example .env   # On Windows
# cp .env.example .env   # On macOS/Linux

# Edit backend/.env and paste your GEMINI_API_KEY:
# GEMINI_API_KEY=your_actual_gemini_api_key_here

# 4. Start the FastAPI development server
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
`

* **Interactive Swagger Documentation**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* **Default Database**: Starts immediately on local **SQLite** (ackend/athletiq.db) with zero manual database installation required.
* **PostgreSQL (Optional / Production)**: Paste your Neon or PostgreSQL URL into DATABASE_URL in .env; database.py auto-normalizes driver flags and connection pooling.

---

### 2. Frontend Setup

`ash
cd frontend

# 1. Install NPM packages
npm install

# 2. Start Vite development server
npm run dev
`

* **Frontend Web App**: [http://localhost:5173/](http://localhost:5173/)

---

## Environment Configuration

In ackend/.env:

`env
# Database: SQLite (default) or PostgreSQL
DATABASE_URL=sqlite+aiosqlite:///./athletiq.db

# Authentication Security
SECRET_KEY=sportify-super-secret-key-min-32-characters-long
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.6-flash
GEMINI_FALLBACK_MODEL=gemini-2.0-flash

# Media Storage
UPLOAD_DIR=./uploads
MAX_VIDEO_SIZE_MB=100
`

---

## User Journey

`
[ 1. Landing ]  -->  [ 2. Onboarding ]  -->  [ 3. Athlete Dashboard ]
   Hero & Loop        Sport, Position,        Baseline calibration,
                      Attributes & Goals      development pathway
                                                       |
                                                       v
[ 6. Progress ] <--  [ 5. Training Plan ] <-- [ 4. Movement Studio ]
   Reassessment        4-Week periodized       Upload / record video,
   trend tracking      Gemini AI routine       MediaPipe CV & radar chart
`

---

## Tech Stack

| Domain | Technologies |
|--------|--------------|
| **Frontend Core** | React 18.3, Vite 5.4, React Router DOM v6 |
| **Frontend Styling** | Vanilla CSS + Tailwind CSS v3.4 (Custom glassmorphism design system) |
| **State Management** | Zustand 4.5 (with persist middleware for JWT and profile hydration) |
| **Visualizations** | Recharts, Custom Interactive SVG Biomechanical Radar Chart |
| **UI & Icons** | Radix UI headless primitives, Lucide React, Framer Motion |
| **Backend API** | FastAPI, Uvicorn, Pydantic v2, Python 3.13 |
| **Database & ORM** | SQLAlchemy 2.0 (AsyncIO), Alembic, SQLite (iosqlite), PostgreSQL (syncpg) |
| **Computer Vision** | Google MediaPipe Tasks (pose_landmarker_full), OpenCV, NumPy, SciPy |
| **Generative AI** | Google Gemini 3.6 Flash (Native Google GenAI SDK with structured JSON outputs) |
| **Authentication** | OAuth2 Password Bearer flow, JWT tokens (python-jose), bcrypt hashing |

---

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Register new athlete account with credentials |
| POST | /auth/login | Authenticate athlete and return JWT bearer token |
| GET | /auth/me | Fetch authenticated athlete profile |
| GET | /intake/sports | List sports taxonomy, roles, and disciplines |
| POST | /intake/profile | Submit athlete role and baseline physical parameters |
| GET | /intake/profile | Retrieve active athlete profile |
| POST | /video/coach | Submit activity video for asynchronous CV analysis |
| GET | /video/coach/{id} | Poll CV processing, kinematic scores, and AI feedback |
| GET | /video/protocols | List registered movement protocols |
| GET | /assessment/latest | Retrieve latest verified movement assessment |
| POST | /assessment/manual | Submit manual kinematic assessment values |
| GET | /plan/current | Retrieve active periodized training plan |
| POST | /plan/generate | Trigger Gemini 3.6 Flash training plan synthesis |
| POST | /progress/log | Log completed training workout session |
| GET | /progress/dashboard | Aggregated development metrics, stats, and recovery |
| GET | /health | Server health check endpoint |

---

## License

MIT License - Built for Smart India Hackathon (SIH).
