# Methodology

## Data collection approach

The original project was based on direct observation of street behavior at a real intersection area. The observational inputs included:

- approximate street queue capacity
- short-window traffic counts
- signalized vs stop-sign control behavior
- directional assumptions about vehicle movement

Because the project was built from manual observation rather than formal sensor telemetry, the data should be treated as **approximate modeling input**, not as engineering-grade transportation data.

## Modeling approach

Each street is modeled as:

- a bounded queue with a maximum capacity
- a traffic control rule (timed light or stop sign)
- an arrival rate estimated from cars observed in a 5-minute window
- routing probabilities for vehicles leaving the queue

## Simulation assumptions

- A car can move only if the street is effectively open (green light or stop-sign-controlled movement)
- When a destination queue is full, the car exits the system instead of blocking upstream traffic
- Arrival rates are normalized to the represented simulation window
- The frontend playback is a visualization of the simulation state, not a GIS-accurate map model
