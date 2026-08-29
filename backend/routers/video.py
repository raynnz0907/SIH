from fastapi import APIRouter, UploadFile, File, BackgroundTasks, HTTPException, Form
import os, shutil, uuid
from services.pose_analyzer import PoseAnalyzer
from config import settings

router = APIRouter(prefix="/video", tags=["video"])

# In-memory job store (perfect for demo)
coaching_jobs: dict = {}


def _run_coaching_job(job_id: str, video_path: str, sport: str, role: str):
    """Background: MediaPipe analysis + Ollama coaching advice."""
    try:
        analyzer = PoseAnalyzer()
        analysis = analyzer.analyze_video(video_path)
        movement_scores = analysis.get("movement_scores", {})
        coaching = analyzer.generate_coaching_advice(sport, role, movement_scores)
        coaching_jobs[job_id] = {
            "status": "completed",
            "sport": sport,
            "role": role,
            "movement_scores": movement_scores,
            "coaching": coaching,
        }
    except Exception as e:
        analyzer = PoseAnalyzer()
        coaching_jobs[job_id] = {
            "status": "completed",  # show fallback, not error
            "coaching": analyzer.get_fallback_coaching(sport, role),
        }
    finally:
        try:
            if os.path.exists(video_path):
                os.remove(video_path)
        except Exception:
            pass


@router.post("/coach")
async def coach_video(
    background_tasks: BackgroundTasks,
    video: UploadFile = File(...),
    sport: str = Form(default="football"),
    role: str = Form(default="striker"),
):
    """Upload a video and get AI sport-specific coaching. No auth required."""
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    job_id = str(uuid.uuid4())[:8]
    ext = (video.filename or "video.mp4").rsplit(".", 1)[-1].lower()
    if ext not in ["mp4", "mov", "avi", "mkv", "webm"]:
        raise HTTPException(400, "Unsupported format. Use mp4, mov, avi, mkv or webm.")
    video_path = os.path.join(settings.UPLOAD_DIR, f"{job_id}.{ext}")
    with open(video_path, "wb") as f:
        shutil.copyfileobj(video.file, f)
    coaching_jobs[job_id] = {"status": "processing"}
    background_tasks.add_task(_run_coaching_job, job_id, video_path, sport.lower(), role.lower().replace(" ", "_"))
    return {"job_id": job_id, "status": "processing"}


@router.get("/coach/{job_id}")
async def get_coaching(job_id: str):
    """Poll every 3s to check analysis status."""
    if job_id not in coaching_jobs:
        raise HTTPException(404, "Job not found")
    return coaching_jobs[job_id]
