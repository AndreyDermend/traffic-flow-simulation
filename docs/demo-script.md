# Demo script

## 30-second version
This project started as a traffic simulation based on real-world street observation. I rebuilt it into a portfolio-ready system with a C simulation engine, a Python API layer, and a browser-based visualizer so the simulation can be run and inspected more easily.

## 60-second version
The original idea came from observing traffic flow at real streets and approximating both queue capacity and vehicle volume. I used those assumptions to model a connected street network in C. To make the project more modern and demonstrable, I wrapped the simulation in a FastAPI backend that executes the compiled engine and returns JSON, then built a frontend that plays back each simulation tick and visualizes congestion. I also added GitHub Actions for automated build, test, and deployment workflows.

## Interview angle
This project helps me show more than one kind of engineering. It shows lower-level logic in C, backend orchestration in Python, frontend communication of state, and the ability to take an older idea and rebuild it into a cleaner end-to-end product.
