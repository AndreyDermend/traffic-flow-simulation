from fastapi import FastAPI, HTTPException, Query
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware

from runner import run_simulation


app = FastAPI(title="Traffic Flow Simulation API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/run-simulation")
def run_simulation_endpoint(
    represented_seconds: int = Query(300, ge=60, le=7200),
    seed: Optional[int] = Query(None),
):
    try:
        return run_simulation(represented_seconds=represented_seconds, seed=seed)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=500, detail=f"Simulation failed: {exc}") from exc