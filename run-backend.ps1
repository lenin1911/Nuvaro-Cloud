# Start the FastAPI backend from the project root
# --reload-dir backend ensures ONLY backend/ changes trigger a reload (not frontend/node_modules)
Set-Location "$PSScriptRoot"
uv run --project backend python -m uvicorn backend.main:app --reload --reload-dir backend
