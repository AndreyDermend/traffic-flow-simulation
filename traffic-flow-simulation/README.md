# Traffic Flow Simulation

A traffic modeling project rebuilt into a modern full-stack demo using a **C simulation engine**, a **Python/FastAPI backend**, and a **browser-based visualizer**.

## Project story

This project started with real-world traffic observation. Street sizes were approximated in person, and vehicle flow was manually observed over short windows to estimate queue capacity and arrival volume. That observational data was then used to model traffic behavior across a connected street network.

The original simulation was written in C. This repository rebuilds the idea into a portfolio-ready architecture:

- **C** for queueing, routing, and traffic-light simulation
- **Python / FastAPI** for execution, validation, and API delivery
- **HTML / CSS / JavaScript** for visualization and playback
- **GitHub Actions** for CI/CD

## Architecture

```text
Observed street data -> C simulation engine -> Python API -> Browser visualizer
```

## Features

- Multi-street traffic simulation based on observed flow assumptions
- Queue depth and congestion modeling
- Green-light / red-light timing plus stop-sign behavior
- Probabilistic car routing between connected streets
- Time-step playback in the frontend
- JSON output for reuse and analysis
- Automated CI pipeline and GitHub Pages deployment workflow

## Tech stack

- C
- Python 3.11+
- FastAPI
- HTML / CSS / JavaScript
- GitHub Actions

## Repository structure

```text
traffic-flow-simulation/
├── .github/workflows/
├── backend/
├── data/
├── docs/
├── frontend/
├── screenshots/
└── sim-engine/
```

## Quick start

### 1) Build the simulation engine

```bash
make build
```

### 2) Run the engine directly

```bash
./sim-engine/bin/traffic_sim 300 42
```

Arguments:
- `300` = represented seconds of real traffic (defaults to 300)
- `42` = random seed for reproducibility (optional)

### 3) Run the backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --reload
```

The API will be available at `http://127.0.0.1:8000`.

### 4) Run the frontend

```bash
cd frontend
python -m http.server 8080
```

Open `http://127.0.0.1:8080` and point the app to `http://127.0.0.1:8000`.

## API endpoints

- `GET /health`
- `GET /run-simulation?represented_seconds=300&seed=42`

## Suggested screenshots for the portfolio

Add your own screenshots to `screenshots/` and embed them here:

1. Main dashboard with all street cards visible
2. Playback slider showing tick-by-tick changes
3. Summary cards with total cars and peak congestion
4. Any visual you create showing the real-world intersection inspiration

## CI/CD

This repository includes:

- **CI**: build C engine, validate JSON output, and run backend tests on push / pull request
- **CD**: deploy the static frontend to **GitHub Pages** on pushes to `main`

See `.github/workflows/` for setup.

## Resume-ready description

Rebuilt a real-world traffic modeling project into a full-stack application using a C simulation engine, a Python backend, and a browser-based visualizer to simulate queue depth, light timing, and vehicle routing across connected streets.
