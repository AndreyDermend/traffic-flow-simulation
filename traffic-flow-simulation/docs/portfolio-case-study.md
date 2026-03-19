# Portfolio case study draft

## Project
Traffic Flow Simulation

## One-line description
Rebuilt a real-world traffic modeling project into a full-stack application using a C simulation engine, a Python backend, and a browser-based visualizer.

## Problem
I wanted to turn an older traffic simulation concept into a cleaner, more demonstrable engineering project that showed both low-level logic and modern application delivery.

## Context
The original idea came from observing actual traffic behavior, approximating street queue sizes, and estimating car flow over short windows. Instead of leaving it as a standalone C program, I reconstructed it into a full-stack architecture that is easier to run, test, and present.

## My role
- Reframed the original idea into a portfolio-ready product
- Rebuilt the simulation architecture around a C engine + Python API + browser frontend
- Added CI/CD with GitHub Actions
- Structured the repository for demonstration and future extension

## Technical highlights
- Queue-based traffic modeling in C
- Timed lights and stop-sign logic
- Probabilistic routing between connected streets
- FastAPI wrapper for simulation execution and JSON delivery
- Browser playback UI for tick-by-tick inspection
- GitHub Actions CI + GitHub Pages deployment workflow

## Challenges
- Turning a console-oriented simulation into structured JSON
- Keeping the C logic simple enough to demo while still feeling realistic
- Designing a frontend that communicates state clearly without overengineering the UI

## What I would improve next
- Support multiple intersection configurations from JSON
- Add comparative runs for alternate signal timing strategies
- Persist runs and metrics for analysis over time
