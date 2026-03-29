import os
from pathlib import Path

# Fix path relative to d:/Projects/researchweb/backend
base = Path("static/uploads")
base.mkdir(parents=True, exist_ok=True)

files = [
    "fe1de841-1dd7-48b4-b71f-a725fa35068d-wealth_dataset.csv",
    "d500a33e-363e-4ec4-9723-837eeab4e971-_98655449_gomtipurahmedabad.jpg",
    "d91f4271-e54b-4378-ab7d-ccf40a6e7370-_98655449_gomtipurahmedabad.jpg",
    "_98655449_gomtipurahmedabad.jpg"
]

for f in files:
    file_path = base / f
    if not file_path.exists():
        file_path.touch()
        print(f"Created placeholder: {f}")
    else:
        print(f"Placeholder already exists: {f}")

print("Recovery complete.")
