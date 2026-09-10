import json
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)

# Generate unified sport taxonomy
if __name__ == "__main__":
    print(f"Data directory verified at: {DATA_DIR}")
