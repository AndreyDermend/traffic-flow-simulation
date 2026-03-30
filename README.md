# Traffic Flow Simulation

A traffic modeling project rebuilt into a modern full-stack demo using a **C simulation engine**, a **Python/FastAPI backend**, and a **browser-based street visualizer**.

## Project story

This project started with real-world traffic observation. Street sizes were approximated in person, and vehicle flow was manually observed over short windows to estimate queue capacity and arrival volume. That observational data was then used to model traffic behavior across a connected street network.

The original simulation was written in C. This repository rebuilds the idea into a portfolio-ready architecture:

- **C** for queueing, routing, and traffic-light simulation
- **Python / FastAPI** for execution, validation, and API delivery
- **HTML / CSS / JavaScript** for a simplified street-scene visualization
- **GitHub Actions** for CI/CD

## Why this version is portfolio-ready

The project is strongest when it is presented as a process:

1. collect simplified real-world traffic observations
2. design and implement the simulation in C
3. split the work across team-owned functions
4. test low/high represented traffic and edge cases
5. rebuild the output into a Python + browser visualizer

That story demonstrates real-world observation, systems programming, teamwork, testing, and full-stack modernization in one project.

## Architecture

```text
Observed street data -> C simulation engine -> Python API -> Browser visualizer